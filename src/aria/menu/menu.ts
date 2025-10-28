/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  afterRenderEffect,
  computed,
  contentChildren,
  Directive,
  ElementRef,
  inject,
  input,
  model,
  output,
  Signal,
  signal,
  untracked,
} from '@angular/core';
import {
  SignalLike,
  MenuBarPattern,
  MenuItemPattern,
  MenuPattern,
  MenuTriggerPattern,
} from '@angular/aria/private';
import {toSignal} from '@angular/core/rxjs-interop';
import {Directionality} from '@angular/cdk/bidi';
import {DeferredContent, DeferredContentAware} from '@angular/aria/deferred-content';

/**
 * A trigger for a menu.
 *
 * The menu trigger is used to open and close menus, and can be placed on menu items to connect
 * sub-menus.
 */
@Directive({
  selector: 'button[ngMenuTrigger]',
  exportAs: 'ngMenuTrigger',
  host: {
    'class': 'ng-menu-trigger',
    '[attr.tabindex]': '_pattern.tabindex()',
    '[attr.aria-haspopup]': '_pattern.hasPopup()',
    '[attr.aria-expanded]': '_pattern.expanded()',
    '[attr.aria-controls]': '_pattern.menu()?.id()',
    '(click)': '_pattern.onClick()',
    '(keydown)': '_pattern.onKeydown($event)',
    '(focusout)': '_pattern.onFocusOut($event)',
  },
})
export class MenuTrigger<V> {
  /** A reference to the menu trigger element. */
  private readonly _elementRef = inject(ElementRef);

  /** A reference to the menu element. */
  readonly element: HTMLButtonElement = this._elementRef.nativeElement;

  // TODO(wagnermaciel): See we can remove the need to pass in a submenu.

  /** The menu associated with the trigger. */
  menu = input<Menu<V> | undefined>(undefined);

  /** A callback function triggered when a menu item is selected. */
  onSubmit = output<V>();

  /** The menu trigger ui pattern instance. */
  _pattern: MenuTriggerPattern<V> = new MenuTriggerPattern({
    element: computed(() => this._elementRef.nativeElement),
    menu: computed(() => this.menu()?._pattern),
  });
}

/**
 * A list of menu items.
 *
 * A menu is used to offer a list of menu item choices to users. Menus can be nested within other
 * menus to create sub-menus.
 *
 * ```html
 * <button ngMenuTrigger menu="menu">Options</button>
 *
 * <div ngMenu #menu="ngMenu">
 *   <div ngMenuItem>Star</div>
 *   <div ngMenuItem>Edit</div>
 *   <div ngMenuItem>Delete</div>
 * </div>
 * ```
 */
@Directive({
  selector: '[ngMenu]',
  exportAs: 'ngMenu',
  host: {
    'role': 'menu',
    'class': 'ng-menu',
    '[attr.id]': '_pattern.id()',
    '[attr.data-visible]': '_pattern.isVisible()',
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

  /** A reference to the menu element. */
  private readonly _elementRef = inject(ElementRef);

  /** A reference to the menu element. */
  readonly element: HTMLElement = this._elementRef.nativeElement;

  /** The directionality (LTR / RTL) context for the application (or a subtree of it). */
  private readonly _directionality = inject(Directionality);

  /** A signal wrapper for directionality. */
  readonly textDirection = toSignal(this._directionality.change, {
    initialValue: this._directionality.value,
  });

  /** The submenu associated with the menu. */
  readonly submenu = input<Menu<V> | undefined>(undefined);

  /** The unique ID of the menu. */
  readonly id = input<string>(Math.random().toString(36).substring(2, 10));

  /** Whether the menu should wrap its items. */
  readonly wrap = input<boolean>(true);

  /** The delay in seconds before the typeahead buffer is cleared. */
  readonly typeaheadDelay = input<number>(0.5); // Picked arbitrarily.

  /** A reference to the parent menu item or menu trigger. */
  readonly parent = input<MenuTrigger<V> | MenuItem<V>>();

  /** The menu ui pattern instance. */
  readonly _pattern: MenuPattern<V>;

  /**
   * The menu items as a writable signal.
   *
   * TODO(wagnermaciel): This would normally be a computed, but using a computed causes a bug where
   * sometimes the items array is empty. The bug can be reproduced by switching this to use a
   * computed and then quickly opening and closing menus in the dev app.
   */
  readonly items = () => this._items().map(i => i._pattern);

  /** Whether the menu is visible. */
  isVisible = computed(() => this._pattern.isVisible());

  /** A callback function triggered when a menu item is selected. */
  onSubmit = output<V>();

  constructor() {
    this._pattern = new MenuPattern({
      ...this,
      parent: computed(() => this.parent()?._pattern),
      multi: () => false,
      skipDisabled: () => false,
      focusMode: () => 'roving',
      orientation: () => 'vertical',
      selectionMode: () => 'explicit',
      activeItem: signal(undefined),
      element: computed(() => this._elementRef.nativeElement),
      onSubmit: (value: V) => this.onSubmit.emit(value),
    });

    afterRenderEffect(() => {
      this._deferredContentAware?.contentVisible.set(this._pattern.isVisible());
    });

    // TODO(wagnermaciel): This is a redundancy needed for if the user uses display: none to hide
    // submenus. In those cases, the ui pattern is calling focus() before the ui has a chance to
    // update the display property. The result is focus() being called on an element that is not
    // focusable. This simply retries focusing the element after render.
    afterRenderEffect(() => {
      if (this._pattern.isVisible()) {
        const activeItem = untracked(() => this._pattern.inputs.activeItem());
        this._pattern.listBehavior.goto(activeItem!);
      }
    });

    afterRenderEffect(() => {
      if (!this._pattern.hasBeenFocused()) {
        this._pattern.setDefaultState();
      }
    });
  }

  // TODO(wagnermaciel): Author close, closeAll, and open methods for each directive.

  /** Closes the menu. */
  close(opts?: {refocus?: boolean}) {
    this._pattern.inputs.parent()?.close(opts);
  }

  /** Closes all parent menus. */
  closeAll(opts?: {refocus?: boolean}) {
    const root = this._pattern.root();

    if (root instanceof MenuTriggerPattern) {
      root.close(opts);
    }

    if (root instanceof MenuPattern || root instanceof MenuBarPattern) {
      root.inputs.activeItem()?.close(opts);
    }
  }
}

/**
 * A menu bar of menu items.
 *
 * Like the menu, a menubar is used to offer a list of menu item choices to users. However, a
 * menubar is used to display a persistent, top-level,
 * always-visible set of menu item choices.
 */
@Directive({
  selector: '[ngMenuBar]',
  exportAs: 'ngMenuBar',
  host: {
    'role': 'menubar',
    'class': 'ng-menu-bar',
    '(keydown)': '_pattern.onKeydown($event)',
    '(mouseover)': '_pattern.onMouseOver($event)',
    '(click)': '_pattern.onClick($event)',
    '(focusin)': '_pattern.onFocusIn()',
    '(focusout)': '_pattern.onFocusOut($event)',
  },
})
export class MenuBar<V> {
  /** The menu items contained in the menubar. */
  readonly _allItems = contentChildren<MenuItem<V>>(MenuItem, {descendants: true});

  readonly _items: SignalLike<MenuItem<V>[]> = () =>
    this._allItems().filter(i => i.parent === this);

  /** A reference to the menu element. */
  private readonly _elementRef = inject(ElementRef);

  /** A reference to the menubar element. */
  readonly element: HTMLElement = this._elementRef.nativeElement;

  /** The directionality (LTR / RTL) context for the application (or a subtree of it). */
  private readonly _directionality = inject(Directionality);

  /** A signal wrapper for directionality. */
  readonly textDirection = toSignal(this._directionality.change, {
    initialValue: this._directionality.value,
  });

  /** The value of the menu. */
  readonly value = model<V[]>([]);

  /** Whether the menu should wrap its items. */
  readonly wrap = input<boolean>(true);

  /** The delay in seconds before the typeahead buffer is cleared. */
  readonly typeaheadDelay = input<number>(0.5);

  /** The menu ui pattern instance. */
  readonly _pattern: MenuBarPattern<V>;

  /** The menu items as a writable signal. */
  readonly items = signal<MenuItemPattern<V>[]>([]);

  /** A callback function triggered when a menu item is selected. */
  onSubmit = output<V>();

  constructor() {
    this._pattern = new MenuBarPattern({
      ...this,
      multi: () => false,
      skipDisabled: () => false,
      focusMode: () => 'roving',
      orientation: () => 'horizontal',
      selectionMode: () => 'explicit',
      onSubmit: (value: V) => this.onSubmit.emit(value),
      activeItem: signal(undefined),
      element: computed(() => this._elementRef.nativeElement),
    });

    afterRenderEffect(() => {
      this.items.set(this._items().map(i => i._pattern));
    });

    afterRenderEffect(() => {
      if (!this._pattern.hasBeenFocused()) {
        this._pattern.setDefaultState();
      }
    });
  }
}

/**
 * An item in a Menu.
 *
 * Menu items can be used in menus and menubars to represent a choice or action a user can take.
 */
@Directive({
  selector: '[ngMenuItem]',
  exportAs: 'ngMenuItem',
  host: {
    'role': 'menuitem',
    'class': 'ng-menu-item',
    '[attr.tabindex]': '_pattern.tabindex()',
    '[attr.data-active]': '_pattern.isActive()',
    '[attr.aria-haspopup]': '_pattern.hasPopup()',
    '[attr.aria-expanded]': '_pattern.expanded()',
    '[attr.aria-disabled]': '_pattern.disabled()',
    '[attr.aria-controls]': '_pattern.submenu()?.id()',
  },
})
export class MenuItem<V> {
  /** A reference to the menu item element. */
  private readonly _elementRef = inject(ElementRef);

  /** A reference to the menu element. */
  readonly element: HTMLElement = this._elementRef.nativeElement;

  /** The unique ID of the menu item. */
  readonly id = input<string>(Math.random().toString(36).substring(2, 10));

  /** The value of the menu item. */
  readonly value = input.required<V>();

  /** Whether the menu item is disabled. */
  readonly disabled = input<boolean>(false);

  // TODO(wagnermaciel): Discuss whether all inputs should be models.

  /** The search term associated with the menu item. */
  readonly searchTerm = model<string>('');

  /** A reference to the parent menu. */
  private readonly _menu = inject<Menu<V>>(Menu, {optional: true});

  /** A reference to the parent menu bar. */
  private readonly _menuBar = inject<MenuBar<V>>(MenuBar, {optional: true});

  /** A reference to the parent menu or menubar. */
  readonly parent = this._menu ?? this._menuBar;

  /** The submenu associated with the menu item. */
  readonly submenu = input<Menu<V> | undefined>(undefined);

  /** The menu item ui pattern instance. */
  readonly _pattern: MenuItemPattern<V> = new MenuItemPattern<V>({
    id: this.id,
    value: this.value,
    element: computed(() => this._elementRef.nativeElement),
    disabled: this.disabled,
    searchTerm: this.searchTerm,
    parent: computed(() => this.parent?._pattern),
    submenu: computed(() => this.submenu()?._pattern),
  });
}

/** Defers the rendering of the menu content. */
@Directive({
  selector: 'ng-template[ngMenuContent]',
  exportAs: 'ngMenuContent',
  hostDirectives: [DeferredContent],
})
export class MenuContent {}
