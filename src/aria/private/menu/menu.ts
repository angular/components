/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, Signal, signal} from '@angular/core';
import {KeyboardEventManager} from '../behaviors/event-manager';
import {SignalLike} from '../behaviors/signal-like/signal-like';
import {List, ListInputs, ListItem} from '../behaviors/list/list';

/** The inputs for the MenuBarPattern class. */
export interface MenuBarInputs<V> extends Omit<ListInputs<MenuItemPattern<V>, V>, 'disabled'> {
  /** The menu items contained in the menu. */
  items: SignalLike<MenuItemPattern<V>[]>;

  /** Callback function triggered when a menu item is selected. */
  onSelect?: (value: V) => void;
}

/** The inputs for the MenuPattern class. */
export interface MenuInputs<V>
  extends Omit<ListInputs<MenuItemPattern<V>, V>, 'value' | 'disabled'> {
  /** The unique ID of the menu. */
  id: SignalLike<string>;

  /** The menu items contained in the menu. */
  items: SignalLike<MenuItemPattern<V>[]>;

  /** A reference to the parent menu or menu trigger. */
  parent: SignalLike<MenuTriggerPattern<V> | MenuItemPattern<V> | undefined>;

  /** Callback function triggered when a menu item is selected. */
  onSelect?: (value: V) => void;
}

/** The inputs for the MenuTriggerPattern class. */
export interface MenuTriggerInputs<V> {
  /** A reference to the menu trigger element. */
  element: SignalLike<HTMLElement | undefined>;

  /** A reference to the menu associated with the trigger. */
  menu: SignalLike<MenuPattern<V> | undefined>;
}

/** The inputs for the MenuItemPattern class. */
export interface MenuItemInputs<V> extends Omit<ListItem<V>, 'index' | 'selectable'> {
  /** A reference to the parent menu or menu trigger. */
  parent: SignalLike<MenuPattern<V> | MenuBarPattern<V> | undefined>;

  /** A reference to the submenu associated with the menu item. */
  submenu: SignalLike<MenuPattern<V> | undefined>;
}

/** The menu ui pattern class. */
export class MenuPattern<V> {
  /** The unique ID of the menu. */
  id: SignalLike<string>;

  /** The role of the menu. */
  role = () => 'menu';

  /** Whether the menu is visible. */
  isVisible = computed(() => (this.inputs.parent() ? !!this.inputs.parent()?.expanded() : true));

  /** Controls list behavior for the menu items. */
  listBehavior: List<MenuItemPattern<V>, V>;

  /** Whether the menu or any of its child elements are currently focused. */
  isFocused = signal(false);

  /** Whether the menu has received focus. */
  hasBeenFocused = signal(false);

  /** Whether the menu should be focused on mouse over. */
  shouldFocus = computed(() => {
    const root = this.root();

    if (root instanceof MenuTriggerPattern) {
      return true;
    }

    if (root instanceof MenuBarPattern || root instanceof MenuPattern) {
      return root.isFocused();
    }

    return false;
  });

  /** The key used to expand sub-menus. */
  private _expandKey = computed(() => {
    return this.inputs.textDirection() === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
  });

  /** The key used to collapse sub-menus. */
  private _collapseKey = computed(() => {
    return this.inputs.textDirection() === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
  });

  /** Represents the space key. Does nothing when the user is actively using typeahead. */
  dynamicSpaceKey = computed(() => (this.listBehavior.isTyping() ? '' : ' '));

  /** The regexp used to decide if a key should trigger typeahead. */
  typeaheadRegexp = /^.$/;

  /** The root of the menu. */
  root: Signal<MenuTriggerPattern<V> | MenuBarPattern<V> | MenuPattern<V> | undefined> = computed(
    () => {
      const parent = this.inputs.parent();

      if (!parent) {
        return this;
      }

      if (parent instanceof MenuTriggerPattern) {
        return parent;
      }

      const grandparent = parent.inputs.parent();

      if (grandparent instanceof MenuBarPattern) {
        return grandparent;
      }

      return grandparent?.root();
    },
  );

  /** Handles keyboard events for the menu. */
  keydownManager = computed(() => {
    return new KeyboardEventManager()
      .on('ArrowDown', () => this.next())
      .on('ArrowUp', () => this.prev())
      .on('Home', () => this.first())
      .on('End', () => this.last())
      .on('Enter', () => this.trigger())
      .on('Escape', () => this.closeAll())
      .on(this._expandKey, () => this.expand())
      .on(this._collapseKey, () => this.collapse())
      .on(this.dynamicSpaceKey, () => this.trigger())
      .on(this.typeaheadRegexp, e => this.listBehavior.search(e.key));
  });

  constructor(readonly inputs: MenuInputs<V>) {
    this.id = inputs.id;
    this.listBehavior = new List<MenuItemPattern<V>, V>({
      ...inputs,
      value: signal([]),
      disabled: () => false,
    });
  }

  /** Sets the default state for the menu. */
  setDefaultState() {
    if (!this.inputs.parent()) {
      this.inputs.activeItem.set(this.inputs.items()[0]);
    }
  }

  /** Handles keyboard events for the menu. */
  onKeydown(event: KeyboardEvent) {
    this.keydownManager().handle(event);
  }

  /** Handles mouseover events for the menu. */
  onMouseOver(event: MouseEvent) {
    if (!this.isVisible()) {
      return;
    }

    const item = this.inputs.items().find(i => i.element()?.contains(event.target as Node));

    if (!item) {
      return;
    }

    const activeItem = this?.inputs.activeItem();

    if (activeItem && activeItem !== item) {
      activeItem.close();
    }

    if (item.expanded() && item.submenu()?.inputs.activeItem()) {
      item.submenu()?.inputs.activeItem()?.close();
      item.submenu()?.listBehavior.unfocus();
    }

    item.open();
    this.listBehavior.goto(item, {focusElement: this.shouldFocus()});
  }

  /** Handles mouseout events for the menu. */
  onMouseOut(event: MouseEvent) {
    if (this.isFocused()) {
      return;
    }

    const root = this.root();
    const parent = this.inputs.parent();
    const relatedTarget = event.relatedTarget as Node | null;

    if (!root || !parent || parent instanceof MenuTriggerPattern) {
      return;
    }

    const grandparent = parent.inputs.parent();

    if (!grandparent || grandparent instanceof MenuBarPattern) {
      return;
    }

    if (!grandparent.inputs.element()?.contains(relatedTarget)) {
      parent.close();
    }
  }

  /** Handles click events for the menu. */
  onClick(event: MouseEvent) {
    const relatedTarget = event.target as Node | null;
    const item = this.inputs.items().find(i => i.element()?.contains(relatedTarget));

    if (item) {
      item.open();
      this.listBehavior.goto(item);
      this.submit(item);
    }
  }

  /** Handles focusin events for the menu. */
  onFocusIn() {
    this.isFocused.set(true);
    this.hasBeenFocused.set(true);
  }

  /** Handles the focusout event for the menu. */
  onFocusOut(event: FocusEvent) {
    const parent = this.inputs.parent();
    const parentEl = parent?.inputs.element();
    const relatedTarget = event.relatedTarget as Node | null;

    if (!relatedTarget) {
      this.isFocused.set(false);
      this.inputs.parent()?.close({refocus: true});
    }

    if (parent instanceof MenuItemPattern) {
      const grandparent = parent.inputs.parent();
      const siblings = grandparent?.inputs.items().filter(i => i !== parent);
      const item = siblings?.find(i => i.element().contains(relatedTarget));

      if (item) {
        return;
      }
    }

    if (
      this.isVisible() &&
      !parentEl?.contains(relatedTarget) &&
      !this.inputs.element()?.contains(relatedTarget)
    ) {
      this.isFocused.set(false);
      this.inputs.parent()?.close();
    }
  }

  /** Focuses the previous menu item. */
  prev() {
    this.inputs.activeItem()?.close();
    this.listBehavior.prev();
  }

  /** Focuses the next menu item. */
  next() {
    this.inputs.activeItem()?.close();
    this.listBehavior.next();
  }

  /** Focuses the first menu item. */
  first() {
    this.inputs.activeItem()?.close();
    this.listBehavior.first();
  }

  /** Focuses the last menu item. */
  last() {
    this.inputs.activeItem()?.close();
    this.listBehavior.last();
  }

  /** Triggers the active menu item. */
  trigger() {
    this.inputs.activeItem()?.hasPopup()
      ? this.inputs.activeItem()?.open({first: true})
      : this.submit();
  }

  /** Submits the menu. */
  submit(item = this.inputs.activeItem()) {
    const root = this.root();

    if (item && !item.disabled()) {
      const isMenu = root instanceof MenuPattern;
      const isMenuBar = root instanceof MenuBarPattern;
      const isMenuTrigger = root instanceof MenuTriggerPattern;

      if (!item.submenu() && isMenuTrigger) {
        root.close({refocus: true});
      }

      if (!item.submenu() && isMenuBar) {
        root.close();
        root?.inputs.onSelect?.(item.value());
      }

      if (!item.submenu() && isMenu) {
        root.inputs.activeItem()?.close({refocus: true});
        root?.inputs.onSelect?.(item.value());
      }
    }
  }

  /** Collapses the current menu or focuses the previous item in the menubar. */
  collapse() {
    const root = this.root();
    const parent = this.inputs.parent();

    if (parent instanceof MenuItemPattern && !(parent.inputs.parent() instanceof MenuBarPattern)) {
      parent.close({refocus: true});
    } else if (root instanceof MenuBarPattern) {
      root.prev();
    }
  }

  /** Expands the current menu or focuses the next item in the menubar. */
  expand() {
    const root = this.root();
    const activeItem = this.inputs.activeItem();

    if (activeItem?.submenu()) {
      activeItem.open({first: true});
    } else if (root instanceof MenuBarPattern) {
      root.next();
    }
  }

  /** Closes the menu and all parent menus. */
  closeAll() {
    const root = this.root();

    if (root instanceof MenuTriggerPattern) {
      root.close({refocus: true});
    }

    if (root instanceof MenuBarPattern) {
      root.close();
    }

    if (root instanceof MenuPattern) {
      root.inputs.activeItem()?.close({refocus: true});
    }
  }
}

/** The menubar ui pattern class. */
export class MenuBarPattern<V> {
  /** Controls list behavior for the menu items. */
  listBehavior: List<MenuItemPattern<V>, V>;

  /** The key used to navigate to the next item. */
  private _nextKey = computed(() => {
    return this.inputs.textDirection() === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
  });

  /** The key used to navigate to the previous item. */
  private _previousKey = computed(() => {
    return this.inputs.textDirection() === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
  });

  /** Represents the space key. Does nothing when the user is actively using typeahead. */
  dynamicSpaceKey = computed(() => (this.listBehavior.isTyping() ? '' : ' '));

  /** The regexp used to decide if a key should trigger typeahead. */
  typeaheadRegexp = /^.$/;

  /** Whether the menubar or any of its children are currently focused. */
  isFocused = signal(false);

  /** Whether the menubar has been focused. */
  hasBeenFocused = signal(false);

  /** Handles keyboard events for the menu. */
  keydownManager = computed(() => {
    return new KeyboardEventManager()
      .on(this._nextKey, () => this.next())
      .on(this._previousKey, () => this.prev())
      .on('End', () => this.listBehavior.last())
      .on('Home', () => this.listBehavior.first())
      .on('Enter', () => this.inputs.activeItem()?.open({first: true}))
      .on('ArrowUp', () => this.inputs.activeItem()?.open({last: true}))
      .on('ArrowDown', () => this.inputs.activeItem()?.open({first: true}))
      .on(this.dynamicSpaceKey, () => this.inputs.activeItem()?.open({first: true}))
      .on(this.typeaheadRegexp, e => this.listBehavior.search(e.key));
  });

  constructor(readonly inputs: MenuBarInputs<V>) {
    this.listBehavior = new List<MenuItemPattern<V>, V>({...inputs, disabled: () => false});
  }

  /** Sets the default state for the menubar. */
  setDefaultState() {
    this.inputs.activeItem.set(this.inputs.items()[0]);
  }

  /** Handles keyboard events for the menu. */
  onKeydown(event: KeyboardEvent) {
    this.keydownManager().handle(event);
  }

  /** Handles click events for the menu bar. */
  onClick(event: MouseEvent) {
    const item = this.inputs.items().find(i => i.element()?.contains(event.target as Node));

    if (!item) {
      return;
    }

    this.goto(item);
    item.expanded() ? item.close() : item.open();
  }

  /** Handles mouseover events for the menu bar. */
  onMouseOver(event: MouseEvent) {
    const item = this.inputs.items().find(i => i.element()?.contains(event.target as Node));

    if (item) {
      this.goto(item, {focusElement: this.isFocused()});
    }
  }

  /** Handles focusin events for the menu bar. */
  onFocusIn() {
    this.isFocused.set(true);
    this.hasBeenFocused.set(true);
  }

  /** Handles focusout events for the menu bar. */
  onFocusOut(event: FocusEvent) {
    const relatedTarget = event.relatedTarget as Node | null;

    if (!this.inputs.element()?.contains(relatedTarget)) {
      this.isFocused.set(false);
      this.close();
    }
  }

  /** Goes to and optionally focuses the specified menu item. */
  goto(item: MenuItemPattern<V>, opts?: {focusElement?: boolean}) {
    const prevItem = this.inputs.activeItem();
    this.listBehavior.goto(item, opts);

    if (prevItem?.expanded()) {
      prevItem?.close();
      this.inputs.activeItem()?.open();
    }

    if (item === prevItem) {
      if (item.expanded() && item.submenu()?.inputs.activeItem()) {
        item.submenu()?.inputs.activeItem()?.close();
        item.submenu()?.listBehavior.unfocus();
      }
    }
  }

  /** Focuses the next menu item. */
  next() {
    const prevItem = this.inputs.activeItem();
    this.listBehavior.next();

    if (prevItem?.expanded()) {
      prevItem?.close();
      this.inputs.activeItem()?.open({first: true});
    }
  }

  /** Focuses the previous menu item. */
  prev() {
    const prevItem = this.inputs.activeItem();
    this.listBehavior.prev();

    if (prevItem?.expanded()) {
      prevItem?.close();
      this.inputs.activeItem()?.open({first: true});
    }
  }

  /** Closes the menubar and refocuses the root menu bar item. */
  close() {
    this.inputs.activeItem()?.close({refocus: this.isFocused()});
  }
}

/** The menu trigger ui pattern class. */
export class MenuTriggerPattern<V> {
  /** Whether the menu is expanded. */
  expanded = signal(false);

  /** The role of the menu trigger. */
  role = () => 'button';

  /** Whether the menu trigger has a popup. */
  hasPopup = () => true;

  /** The menu associated with the trigger. */
  menu: SignalLike<MenuPattern<V> | undefined>;

  /** The tabindex of the menu trigger. */
  tabindex = computed(() => (this.expanded() && this.menu()?.inputs.activeItem() ? -1 : 0));

  /** Handles keyboard events for the menu trigger. */
  keydownManager = computed(() => {
    return new KeyboardEventManager()
      .on(' ', () => this.open({first: true}))
      .on('Enter', () => this.open({first: true}))
      .on('ArrowDown', () => this.open({first: true}))
      .on('ArrowUp', () => this.open({last: true}))
      .on('Escape', () => this.close({refocus: true}));
  });

  constructor(readonly inputs: MenuTriggerInputs<V>) {
    this.menu = this.inputs.menu;
  }

  /** Handles keyboard events for the menu trigger. */
  onKeydown(event: KeyboardEvent) {
    this.keydownManager().handle(event);
  }

  /** Handles click events for the menu trigger. */
  onClick() {
    this.expanded() ? this.close() : this.open({first: true});
  }

  /** Handles focusout events for the menu trigger. */
  onFocusOut(event: FocusEvent) {
    const element = this.inputs.element();
    const relatedTarget = event.relatedTarget as Node | null;

    if (
      this.expanded() &&
      !element?.contains(relatedTarget) &&
      !this.inputs.menu()?.inputs.element()?.contains(relatedTarget)
    ) {
      this.close();
    }
  }

  /** Opens the menu. */
  open(opts?: {first?: boolean; last?: boolean}) {
    this.expanded.set(true);

    if (opts?.first) {
      this.inputs.menu()?.first();
    } else if (opts?.last) {
      this.inputs.menu()?.last();
    }
  }

  /** Closes the menu. */
  close(opts: {refocus?: boolean} = {}) {
    this.expanded.set(false);
    this.menu()?.listBehavior.unfocus();

    if (opts.refocus) {
      this.inputs.element()?.focus();
    }

    let menuitems = this.inputs.menu()?.inputs.items() ?? [];

    while (menuitems.length) {
      const menuitem = menuitems.pop();
      menuitem?._expanded.set(false);
      menuitem?.inputs.parent()?.listBehavior.unfocus();
      menuitems = menuitems.concat(menuitem?.submenu()?.inputs.items() ?? []);
    }
  }
}

/** The menu item ui pattern class. */
export class MenuItemPattern<V> implements ListItem<V> {
  /** The value of the menu item. */
  value: SignalLike<V>;

  /** The unique ID of the menu item. */
  id: SignalLike<string>;

  /** Whether the menu item is disabled. */
  disabled: SignalLike<boolean>;

  /** The search term for the menu item. */
  searchTerm: SignalLike<string>;

  /** The element of the menu item. */
  element: SignalLike<HTMLElement>;

  /** Whether the menu item is active. */
  isActive = computed(() => this.inputs.parent()?.inputs.activeItem() === this);

  /** The tabindex of the menu item. */
  tabindex = computed(() => {
    if (this.submenu() && this.submenu()?.inputs.activeItem()) {
      return -1;
    }
    return this.inputs.parent()?.listBehavior.getItemTabindex(this) ?? -1;
  });

  /** The position of the menu item in the menu. */
  index = computed(() => this.inputs.parent()?.inputs.items().indexOf(this) ?? -1);

  /** Whether the menu item is expanded. */
  expanded = computed(() => (this.submenu() ? this._expanded() : null));

  /** Whether the menu item is expanded. */
  _expanded = signal(false);

  /** The ID of the menu that the menu item controls. */
  controls = signal<string | undefined>(undefined);

  /** The role of the menu item. */
  role = () => 'menuitem';

  /** Whether the menu item has a popup. */
  hasPopup = computed(() => !!this.submenu());

  /** The submenu associated with the menu item. */
  submenu: SignalLike<MenuPattern<V> | undefined>;

  /** Whether the menu item is selectable. */
  selectable: SignalLike<boolean>;

  constructor(readonly inputs: MenuItemInputs<V>) {
    this.id = inputs.id;
    this.value = inputs.value;
    this.element = inputs.element;
    this.disabled = inputs.disabled;
    this.submenu = this.inputs.submenu;
    this.searchTerm = inputs.searchTerm;
    this.selectable = computed(() => !this.submenu());
  }

  /** Opens the submenu. */
  open(opts?: {first?: boolean; last?: boolean}) {
    this._expanded.set(true);

    if (opts?.first) {
      this.submenu()?.first();
    }
    if (opts?.last) {
      this.submenu()?.last();
    }
  }

  /** Closes the submenu. */
  close(opts: {refocus?: boolean} = {}) {
    this._expanded.set(false);

    if (opts.refocus) {
      this.inputs.parent()?.listBehavior.goto(this);
    }

    let menuitems = this.inputs.submenu()?.inputs.items() ?? [];

    while (menuitems.length) {
      const menuitem = menuitems.pop();
      menuitem?._expanded.set(false);
      menuitem?.inputs.parent()?.listBehavior.unfocus();
      menuitems = menuitems.concat(menuitem?.submenu()?.inputs.items() ?? []);
    }
  }
}
