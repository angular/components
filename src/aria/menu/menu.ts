/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  afterRenderEffect,
  booleanAttribute,
  computed,
  contentChildren,
  Directive,
  ElementRef,
  inject,
  input,
  output,
  Signal,
  signal,
  untracked,
} from '@angular/core';
import {MenuPattern, DeferredContentAware} from '../private';
import {_IdGenerator} from '@angular/cdk/a11y';
import {Directionality} from '@angular/cdk/bidi';
import {MenuTrigger} from './menu-trigger';
import {MenuItem} from './menu-item';
import {MenuBar} from './menu-bar';
import {MENU_COMPONENT} from './menu-tokens';

/**
 * A list of menu items.
 *
 * A `ngMenu` is used to offer a list of menu item choices to users. Menus can be nested
 * within other menus to create sub-menus. It works in conjunction with `ngMenuTrigger`
 * and `ngMenuItem` directives.
 *
 * ```html
 * <button ngMenuTrigger [menu]="myMenu">Options</button>
 *
 * <div ngMenu #myMenu="ngMenu">
 *   <div ngMenuItem>Star</div>
 *   <div ngMenuItem>Edit</div>
 *   <div ngMenuItem [submenu]="subMenu">More</div>
 * </div>
 *
 * <div ngMenu #subMenu="ngMenu">
 *   <div ngMenuItem>Sub Item 1</div>
 *   <div ngMenuItem>Sub Item 2</div>
 * </div>
 * ```
 *
 * @developerPreview 21.0
 */
@Directive({
  selector: '[ngMenu]',
  exportAs: 'ngMenu',
  host: {
    'role': 'menu',
    '[attr.id]': '_pattern.id()',
    '[attr.aria-disabled]': '_pattern.disabled()',
    '[attr.tabindex]': 'tabIndex()',
    '[attr.data-visible]': 'visible()',
    '(keydown)': '_pattern.onKeydown($event)',
    '(mouseover)': '_pattern.onMouseOver($event)',
    '(mouseout)': '_pattern.onMouseOut($event)',
    '(focusout)': '_pattern.onFocusOut($event)',
    '(focusin)': '_pattern.onFocusIn()',
    '(click)': '_pattern.onClick($event)',
  },
  hostDirectives: [
    {
      directive: DeferredContentAware,
      inputs: ['preserveContent'],
    },
  ],
  providers: [{provide: MENU_COMPONENT, useExisting: Menu}],
})
export class Menu<V> {
  /** The DeferredContentAware host directive. */
  private readonly _deferredContentAware = inject(DeferredContentAware, {optional: true});

  /** The menu items contained in the menu. */
  readonly _allItems = contentChildren<MenuItem<V>>(MenuItem, {descendants: true});

  /** The menu items that are direct children of this menu. */
  readonly _items: Signal<MenuItem<V>[]> = computed(() =>
    this._allItems().filter(i => i.parent === this),
  );

  /** A reference to the host element. */
  private readonly _elementRef = inject(ElementRef);

  /** A reference to the host element. */
  readonly element = this._elementRef.nativeElement as HTMLElement;

  /** The directionality (LTR / RTL) context for the application (or a subtree of it). */
  readonly textDirection = inject(Directionality).valueSignal;

  /** The unique ID of the menu. */
  readonly id = input(inject(_IdGenerator).getId('ng-menu-', true));

  /** Whether the menu should wrap its items. */
  readonly wrap = input(true, {transform: booleanAttribute});

  /** The delay in milliseconds before the typeahead buffer is cleared. */
  readonly typeaheadDelay = input<number>(500); // Picked arbitrarily.

  /** Whether the menu is disabled. */
  readonly disabled = input(false, {transform: booleanAttribute});

  /** A reference to the parent menu item or menu trigger. */
  readonly parent = signal<MenuTrigger<V> | MenuItem<V> | undefined>(undefined);

  /** The menu ui pattern instance. */
  readonly _pattern: MenuPattern<V>;

  /**
   * The menu items as a writable signal.
   *
   * TODO(wagnermaciel): This would normally be a computed, but using a computed causes a bug where
   * sometimes the items array is empty. The bug can be reproduced by switching this to use a
   * computed and then quickly opening and closing menus in the dev app.
   */
  private readonly _itemPatterns = () => this._items().map(i => i._pattern);

  /** Whether the menu is visible. */
  readonly visible = computed(() => this._pattern.visible());

  /** The tab index of the menu. */
  readonly tabIndex = computed(() => this._pattern.tabIndex());

  /** A callback function triggered when a menu item is selected. */
  onSelect = output<V>();

  /** The delay in milliseconds before expanding sub-menus on hover. */
  readonly expansionDelay = input<number>(100); // Arbitrarily chosen.

  constructor() {
    this._pattern = new MenuPattern({
      ...this,
      parent: computed(() => this.parent()?._pattern),
      items: this._itemPatterns,
      multi: () => false,
      softDisabled: () => true,
      focusMode: () => 'roving',
      orientation: () => 'vertical',
      selectionMode: () => 'explicit',
      activeItem: signal(undefined),
      element: computed(() => this._elementRef.nativeElement),
      onSelect: (value: V) => this.onSelect.emit(value),
    });

    afterRenderEffect(() => {
      const parent = this.parent();
      if (parent instanceof MenuItem && parent.parent instanceof MenuBar) {
        this._deferredContentAware?.contentVisible.set(true);
      } else {
        this._deferredContentAware?.contentVisible.set(
          this._pattern.visible() || !!this.parent()?._pattern.hasBeenFocused(),
        );
      }
    });

    // TODO(wagnermaciel): This is a redundancy needed for if the user uses display: none to hide
    // submenus. In those cases, the ui pattern is calling focus() before the ui has a chance to
    // update the display property. The result is focus() being called on an element that is not
    // focusable. This simply retries focusing the element after render.
    afterRenderEffect(() => {
      if (this._pattern.visible()) {
        const activeItem = untracked(() => this._pattern.inputs.activeItem());
        this._pattern.listBehavior.goto(activeItem!);
      }
    });

    afterRenderEffect(() => {
      if (
        !this._pattern.hasBeenFocused() &&
        !this._pattern.hasBeenHovered() &&
        this._items().length
      ) {
        untracked(() => this._pattern.setDefaultState());
      }
    });
  }

  /** Closes the menu. */
  close() {
    this._pattern.close();
  }
}
