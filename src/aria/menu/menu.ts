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
  effect,
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
  DeferredContent,
  DeferredContentAware,
} from '@angular/aria/private';
import {_IdGenerator} from '@angular/cdk/a11y';
import {Directionality} from '@angular/cdk/bidi';

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
  /** A reference to the menu trigger element. */
  private readonly _elementRef = inject(ElementRef);

  /** The directionality (LTR / RTL) context for the application (or a subtree of it). */
  readonly textDirection = inject(Directionality).valueSignal;

  /** A reference to the menu element. */
  readonly element: HTMLButtonElement = this._elementRef.nativeElement;

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
    '[attr.data-visible]': 'isVisible()',
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
  readonly items = () => this._items().map(i => i._pattern);

  /** Whether the menu is visible. */
  readonly isVisible = computed(() => this._pattern.isVisible());

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
          this._pattern.isVisible() || !!this.parent()?._pattern.hasBeenFocused(),
        );
      }
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
      if (!this._pattern.hasBeenFocused() && this._items().length) {
        untracked(() => this._pattern.setDefaultState());
      }
    });
  }

  /** Closes the menu. */
  close() {
    this._pattern.close();
  }
}

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
  readonly items = signal<MenuItemPattern<V>[]>([]);

  /** A callback function triggered when a menu item is selected. */
  onSelect = output<V>();

  constructor() {
    this._pattern = new MenuBarPattern({
      ...this,
      multi: () => false,
      softDisabled: () => true,
      focusMode: () => 'roving',
      orientation: () => 'horizontal',
      selectionMode: () => 'explicit',
      onSelect: (value: V) => this.onSelect.emit(value),
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

  /** Closes the menubar. */
  close() {
    this._pattern.close();
  }
}

/**
 * An item in a Menu.
 *
 * `ngMenuItem` directives can be used in `ngMenu` and `ngMenuBar` to represent a choice
 * or action a user can take. They can also act as triggers for sub-menus.
 *
 * ```html
 * <div ngMenuItem (onSelect)="doAction()">Action Item</div>
 *
 * <div ngMenuItem [submenu]="anotherMenu">Submenu Trigger</div>
 * ```
 *
 * @developerPreview 21.0
 */
@Directive({
  selector: '[ngMenuItem]',
  exportAs: 'ngMenuItem',
  host: {
    'role': 'menuitem',
    '(focusin)': '_pattern.onFocusIn()',
    '[attr.tabindex]': '_pattern.tabIndex()',
    '[attr.data-active]': 'active()',
    '[attr.aria-haspopup]': 'hasPopup()',
    '[attr.aria-expanded]': 'expanded()',
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
  readonly id = input(inject(_IdGenerator).getId('ng-menu-item-', true));

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
  });

  constructor() {
    effect(() => this.submenu()?.parent.set(this));
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

/**
 * Defers the rendering of the menu content.
 *
 * This structural directive should be applied to an `ng-template` within a `ngMenu`
 * or `ngMenuBar` to lazily render its content only when the menu is opened.
 *
 * ```html
 * <div ngMenu #myMenu="ngMenu">
 *   <ng-template ngMenuContent>
 *     <div ngMenuItem>Lazy Item 1</div>
 *     <div ngMenuItem>Lazy Item 2</div>
 *   </ng-template>
 * </div>
 * ```
 *
 * @developerPreview 21.0
 */
@Directive({
  selector: 'ng-template[ngMenuContent]',
  exportAs: 'ngMenuContent',
  hostDirectives: [DeferredContent],
})
export class MenuContent {}
