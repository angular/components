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
  model,
  output,
  signal,
} from '@angular/core';
import {SignalLike, MenuBarPattern} from '../private';
import {Directionality} from '@angular/cdk/bidi';
import {MenuItem} from './menu-item';
import {MENU_COMPONENT} from './menu-tokens';

/**
 * A menu bar of menu items.
 *
 * Like the `ngMenu`, a `ngMenuBar` is used to offer a list of menu item choices to users.
 * However, a menubar is used to display a persistent, top-level, always-visible set of
 * menu item choices, typically found at the top of an application window.
 *
 * ```html
 * <div ngMenuBar>
 *   <button ngMenuTrigger [menu]="fileMenu">File</button>
 *   <button ngMenuTrigger [menu]="editMenu">Edit</button>
 * </div>
 *
 * <div ngMenu #fileMenu="ngMenu">
 *   <div ngMenuItem>New</div>
 *   <div ngMenuItem>Open</div>
 * </div>
 *
 * <div ngMenu #editMenu="ngMenu">
 *   <div ngMenuItem>Cut</div>
 *   <div ngMenuItem>Copy</div>
 * </div>
 * ```
 *
 * @developerPreview 21.0
 *
 * @see [Menu](guide/aria/menu)
 * @see [MenuBar](guide/aria/menubar)
 */
@Directive({
  selector: '[ngMenuBar]',
  exportAs: 'ngMenuBar',
  host: {
    'role': 'menubar',
    '[attr.disabled]': '!softDisabled() && _pattern.disabled() ? true : null',
    '[attr.aria-disabled]': '_pattern.disabled()',
    '[attr.tabindex]': '_pattern.tabIndex()',
    '(keydown)': '_pattern.onKeydown($event)',
    '(mouseover)': '_pattern.onMouseOver($event)',
    '(click)': '_pattern.onClick($event)',
    '(focusin)': '_pattern.onFocusIn()',
    '(focusout)': '_pattern.onFocusOut($event)',
  },
  providers: [{provide: MENU_COMPONENT, useExisting: MenuBar}],
})
export class MenuBar<V> {
  /** The menu items contained in the menubar. */
  readonly _allItems = contentChildren<MenuItem<V>>(MenuItem, {descendants: true});

  readonly _items: SignalLike<MenuItem<V>[]> = () =>
    this._allItems().filter(i => i.parent === this);

  /** A reference to the host element. */
  private readonly _elementRef = inject(ElementRef);

  /** A reference to the host element. */
  readonly element = this._elementRef.nativeElement as HTMLElement;

  /** Whether the menubar is disabled. */
  readonly disabled = input(false, {transform: booleanAttribute});

  /** Whether the menubar is soft disabled. */
  readonly softDisabled = input(true, {transform: booleanAttribute});

  /** The directionality (LTR / RTL) context for the application (or a subtree of it). */
  readonly textDirection = inject(Directionality).valueSignal;

  /** The values of the currently selected menu items. */
  readonly values = model<V[]>([]);

  /** Whether the menu should wrap its items. */
  readonly wrap = input(true, {transform: booleanAttribute});

  /** The delay in milliseconds before the typeahead buffer is cleared. */
  readonly typeaheadDelay = input<number>(500);

  /** The menu ui pattern instance. */
  readonly _pattern: MenuBarPattern<V>;

  /** The menu items as a writable signal. */
  private readonly _itemPatterns = signal<any[]>([]);

  /** A callback function triggered when a menu item is selected. */
  readonly itemSelected = output<V>();

  constructor() {
    this._pattern = new MenuBarPattern({
      ...this,
      items: this._itemPatterns,
      multi: () => false,
      softDisabled: () => true,
      focusMode: () => 'roving',
      orientation: () => 'horizontal',
      selectionMode: () => 'explicit',
      itemSelected: (value: V) => this.itemSelected.emit(value),
      activeItem: signal(undefined),
      element: computed(() => this._elementRef.nativeElement),
    });

    afterRenderEffect(() => {
      this._itemPatterns.set(this._items().map(i => i._pattern));
    });

    afterRenderEffect(() => {
      if (!this._pattern.hasBeenFocused()) {
        this._pattern.setDefaultState();
      }
    });
  }

  /** Closes the menubar. */
  close() {
    this._pattern.close();
  }
}
