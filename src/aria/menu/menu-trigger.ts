/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  booleanAttribute,
  computed,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
} from '@angular/core';
import {MenuTriggerPattern} from '../private';
import {Directionality} from '@angular/cdk/bidi';
import type {Menu} from './menu';

/**
 * A trigger for a menu.
 *
 * The `ngMenuTrigger` directive is used to open and close menus. It can be applied to
 * any interactive element (e.g., a button) to associate it with a `ngMenu` instance.
 * It also supports linking to sub-menus when applied to a `ngMenuItem`.
 *
 * ```html
 * <button ngMenuTrigger [menu]="myMenu">Open Menu</button>
 *
 * <div ngMenu #myMenu="ngMenu">
 *   <div ngMenuItem>Item 1</div>
 *   <div ngMenuItem>Item 2</div>
 * </div>
 * ```
 *
 * @developerPreview 21.0
 */
@Directive({
  selector: 'button[ngMenuTrigger]',
  exportAs: 'ngMenuTrigger',
  host: {
    '[attr.tabindex]': '_pattern.tabIndex()',
    '[attr.disabled]': '!softDisabled() && _pattern.disabled() ? true : null',
    '[attr.aria-disabled]': '_pattern.disabled()',
    '[attr.aria-haspopup]': 'hasPopup()',
    '[attr.aria-expanded]': 'expanded()',
    '[attr.aria-controls]': '_pattern.menu()?.id()',
    '(click)': '_pattern.onClick()',
    '(keydown)': '_pattern.onKeydown($event)',
    '(focusout)': '_pattern.onFocusOut($event)',
    '(focusin)': '_pattern.onFocusIn()',
  },
})
export class MenuTrigger<V> {
  /** A reference to the host element. */
  private readonly _elementRef = inject(ElementRef);

  /** A reference to the host element. */
  readonly element = this._elementRef.nativeElement as HTMLElement;

  /** The directionality (LTR / RTL) context for the application (or a subtree of it). */
  readonly textDirection = inject(Directionality).valueSignal;

  /** The menu associated with the trigger. */
  menu = input<Menu<V> | undefined>(undefined);

  /** Whether the menu is expanded. */
  readonly expanded = computed(() => this._pattern.expanded());

  /** Whether the menu trigger has a popup. */
  readonly hasPopup = computed(() => this._pattern.hasPopup());

  /** Whether the menu trigger is disabled. */
  readonly disabled = input(false, {transform: booleanAttribute});

  /** Whether the menu trigger is soft disabled. */
  readonly softDisabled = input(true, {transform: booleanAttribute});

  /** The menu trigger ui pattern instance. */
  _pattern: MenuTriggerPattern<V> = new MenuTriggerPattern({
    textDirection: this.textDirection,
    element: computed(() => this._elementRef.nativeElement),
    menu: computed(() => this.menu()?._pattern),
    disabled: () => this.disabled(),
  });

  constructor() {
    effect(() => this.menu()?.parent.set(this));
  }

  /** Opens the menu focusing on the first menu item. */
  open() {
    this._pattern.open({first: true});
  }

  /** Closes the menu. */
  close() {
    this._pattern.close();
  }
}
