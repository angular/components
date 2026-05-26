/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  computed,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  model,
  OnDestroy,
  OnInit,
  afterRenderEffect,
} from '@angular/core';
import {MenuItemPattern, reportViolations} from '../private';
import {_IdGenerator} from '@angular/cdk/a11y';
import {MENU_COMPONENT} from './menu-tokens';
import type {Menu} from './menu';
import type {MenuBar} from './menu-bar';

/**
 * An item in a Menu.
 *
 * `ngMenuItem` directives can be used in `ngMenu` and `ngMenuBar` to represent a choice
 * or action a user can take. They can also act as triggers for sub-menus.
 *
 * ```html
 * <div ngMenu (itemSelected)="doAction()">
 *   <div ngMenuItem>Action Item</div>
 *   <div ngMenuItem [submenu]="anotherMenu">Submenu Trigger</div>
 * </div>
 * ```
 *
 * @see [Menu](guide/aria/menu)
 * @see [MenuBar](guide/aria/menubar)
 */
@Directive({
  selector: '[ngMenuItem]',
  exportAs: 'ngMenuItem',
  host: {
    '[attr.role]': '_pattern.role()',
    '(focusin)': '_pattern.onFocusIn()',
    '[attr.tabindex]': '_pattern.tabIndex()',
    '[attr.data-active]': 'active()',
    '[attr.aria-haspopup]': 'hasPopup()',
    '[attr.aria-expanded]': 'expanded()',
    '[attr.aria-disabled]': '_pattern.disabled()',
    '[attr.aria-controls]': '_pattern.submenu()?.id()',
  },
})
export class MenuItem<V> implements OnInit, OnDestroy {
  /** A reference to the host element. */
  private readonly _elementRef = inject(ElementRef);

  /** A reference to the host element. */
  readonly element = this._elementRef.nativeElement as HTMLElement;

  /** The unique ID of the menu item. */
  readonly id = input(inject(_IdGenerator).getId('ng-menu-item-', true));

  /** The value of the menu item. */
  readonly value = input.required<V>();

  /** Whether the menu item is disabled. */
  readonly disabled = input<boolean>(false);

  /** The search term associated with the menu item. */
  readonly searchTerm = model<string>('');

  /** The role of the menu item. */
  readonly role = input<'menuitem' | 'menuitemradio' | 'menuitemcheckbox'>('menuitem');

  /** A reference to the parent menu or menubar. */
  readonly parent = inject<Menu<V> | MenuBar<V>>(MENU_COMPONENT, {optional: true});

  /** The submenu associated with the menu item. */
  readonly submenu = input<Menu<V> | undefined>(undefined);

  /** Context data to be passed to the submenu's template. */
  readonly submenuData = input<unknown>(null);

  /** Whether the menu item is active. */
  readonly active = computed(() => this._pattern.active());

  /** Whether the menu is expanded. */
  readonly expanded = computed(() => this._pattern.expanded());

  /** Whether the menu item has a popup. */
  readonly hasPopup = computed(() => this._pattern.hasPopup());

  /** The menu item ui pattern instance. */
  readonly _pattern: MenuItemPattern<V> = new MenuItemPattern<V>({
    id: this.id,
    value: this.value,
    element: computed(() => this._elementRef.nativeElement),
    disabled: this.disabled,
    searchTerm: this.searchTerm,
    parent: computed(() => this.parent?._pattern),
    submenu: computed(() => this.submenu()?._pattern),
    role: this.role,
  });

  constructor() {
    effect(() => this.submenu()?.parent.set(this));

    // Check for any violations after the DOM has been updated.
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      afterRenderEffect({
        read: () => {
          const violations: string[] = [];
          if (!this.parent) {
            violations.push('ngMenuItem must be placed inside an ngMenu or ngMenuBar container.');
          }
          reportViolations(violations, this.element);
        },
      });
    }
  }

  ngOnInit() {
    this.parent?._collection.register(this);
  }

  ngOnDestroy() {
    this.parent?._collection.unregister(this);
  }

  /** Opens the submenu focusing on the first menu item. */
  open() {
    this._pattern.open({first: true});
  }

  /** Closes the submenu. */
  close() {
    this._pattern.close();
  }
}
