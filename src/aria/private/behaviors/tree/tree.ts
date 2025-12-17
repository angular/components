/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, signal, SignalLike} from '../signal-like/signal-like';
import {ListFocus, ListFocusInputs, ListFocusItem} from '../list-focus/list-focus';
import {
  ListNavigation,
  ListNavigationInputs,
  ListNavigationItem,
  ListNavigationOpts,
} from '../list-navigation/list-navigation';
import {
  ListSelection,
  ListSelectionInputs,
  ListSelectionItem,
} from '../list-selection/list-selection';
import {
  ListTypeahead,
  ListTypeaheadInputs,
  ListTypeaheadItem,
} from '../list-typeahead/list-typeahead';
import {NavOptions} from '../list/list';

/** Represents an item in the tree. */
export interface TreeItem<V, T extends TreeItem<V, T>>
  extends ListTypeaheadItem, ListNavigationItem, ListSelectionItem<V>, ListFocusItem {
  /** The children of this item. */
  children?: SignalLike<T[]>;

  /** Whether this item is expanded. */
  expanded?: SignalLike<boolean>;

  /** The parent of this item. */
  parent?: T;

  /** Whether this item is visible. */
  visible: SignalLike<boolean>;
}

/** The necessary inputs for the tree behavior. */
export type TreeInputs<T extends TreeItem<V, T>, V> = ListFocusInputs<T> &
  ListNavigationInputs<T> &
  ListSelectionInputs<T, V> &
  ListTypeaheadInputs<T>;

/** Controls the state of a tree. */
export class Tree<T extends TreeItem<V, T>, V> {
  /** Controls navigation for the tree. */
  navigationBehavior: ListNavigation<T>;

  /** Controls selection for the tree. */
  selectionBehavior: ListSelection<T, V>;

  /** Controls typeahead for the tree. */
  typeaheadBehavior: ListTypeahead<T>;

  /** Controls focus for the tree. */
  focusBehavior: ListFocus<T>;

  /** Whether the tree is disabled. */
  disabled = computed(() => this.focusBehavior.isListDisabled());

  /** The id of the current active item. */
  activeDescendant = computed(() => this.focusBehavior.getActiveDescendant());

  /** The tab index of the tree. */
  tabIndex = computed(() => this.focusBehavior.getListTabIndex());

  /** The index of the currently active item in the tree (within the flattened list). */
  activeIndex = computed(() => this.focusBehavior.activeIndex());

  /** The uncommitted index for selecting a range of options. */
  private _anchorIndex = signal(0);

  /** Whether the list should wrap. */
  private _wrap = signal(true);

  constructor(readonly inputs: TreeInputs<T, V>) {
    this.focusBehavior = new ListFocus(inputs);
    this.selectionBehavior = new ListSelection({...inputs, focusManager: this.focusBehavior});
    this.typeaheadBehavior = new ListTypeahead({...inputs, focusManager: this.focusBehavior});
    this.navigationBehavior = new ListNavigation({
      ...inputs,
      focusManager: this.focusBehavior,
      wrap: computed(() => this._wrap() && this.inputs.wrap()),
    });
  }

  /** Returns the tab index for the given item. */
  getItemTabindex(item: T) {
    return this.focusBehavior.getItemTabIndex(item);
  }

  /** Navigates to the first option in the tree. */
  first(opts?: NavOptions<T>) {
    this._navigate(opts, () => this.navigationBehavior.first(this._getNavOpts(opts)));
  }

  /** Navigates to the last option in the tree. */
  last(opts?: NavOptions<T>) {
    this._navigate(opts, () => this.navigationBehavior.last(this._getNavOpts(opts)));
  }

  /** Navigates to the next option in the tree. */
  next(opts?: NavOptions<T>) {
    this._navigate(opts, () => this.navigationBehavior.next(this._getNavOpts(opts)));
  }

  /** Navigates to the previous option in the tree. */
  prev(opts?: NavOptions<T>) {
    this._navigate(opts, () => this.navigationBehavior.prev(this._getNavOpts(opts)));
  }

  /** Navigates to the first child of the current active item. */
  firstChild(opts?: NavOptions<T>) {
    this._navigate(opts, () => {
      const item = this.inputs.activeItem();
      const items = item?.children?.()?.filter(c => c.visible() !== false) ?? [];
      return this.navigationBehavior.first({items, ...opts});
    });
  }

  /** Navigates to the last child of the current active item. */
  lastChild(opts?: NavOptions<T>) {
    this._navigate(opts, () => {
      const item = this.inputs.activeItem();
      const items = item?.children?.()?.filter(c => c.visible() !== false) ?? [];
      return this.navigationBehavior.last({items, ...opts});
    });
  }

  /** Navigates to the next sibling of the current active item. */
  nextSibling(opts?: NavOptions<T>) {
    this._navigate(opts, () => {
      const item = this.inputs.activeItem();
      const items = item?.parent?.children?.()?.filter(c => c.visible() !== false) ?? [];
      return this.navigationBehavior.next({items, ...opts});
    });
  }

  /** Navigates to the previous sibling of the current active item. */
  prevSibling(opts?: NavOptions<T>) {
    this._navigate(opts, () => {
      const item = this.inputs.activeItem();
      const items = item?.parent?.children?.()?.filter(c => c.visible() !== false) ?? [];
      return this.navigationBehavior.prev({items, ...opts});
    });
  }

  /** Navigates to the parent of the current active item. */
  parent(opts?: NavOptions<T>) {
    this._navigate(opts, () =>
      this.navigationBehavior.goto(this.inputs.activeItem()?.parent, opts),
    );
  }

  /** Navigates to the given item in the tree. */
  goto(item: T, opts?: NavOptions<T>) {
    this._navigate(opts, () => this.navigationBehavior.goto(item, opts));
  }

  /** Removes focus from the tree. */
  unfocus() {
    this.inputs.activeItem.set(undefined);
  }

  /** Marks the given index as the potential start of a range selection. */
  anchor(index: number) {
    this._anchorIndex.set(index);
  }

  /** Handles typeahead search navigation for the tree. */
  search(char: string, opts?: NavOptions<T>) {
    this._navigate(opts, () => this.typeaheadBehavior.search(char));
  }

  /** Checks if the tree is currently typing for typeahead search. */
  isTyping() {
    return this.typeaheadBehavior.isTyping();
  }

  /** Selects the currently active item in the tree. */
  select(item?: T) {
    this.selectionBehavior.select(item);
  }

  /** Sets the selection to only the current active item. */
  selectOne() {
    this.selectionBehavior.selectOne();
  }

  /** Deselects the currently active item in the tree. */
  deselect(item?: T) {
    this.selectionBehavior.deselect(item);
  }

  /** Deselects all items in the tree. */
  deselectAll() {
    this.selectionBehavior.deselectAll();
  }

  /** Toggles the currently active item in the tree. */
  toggle(item?: T) {
    this.selectionBehavior.toggle(item);
  }

  /** Toggles the currently active item in the tree, deselecting all other items. */
  toggleOne() {
    this.selectionBehavior.toggleOne();
  }

  /** Toggles the selection of all items in the tree. */
  toggleAll() {
    this.selectionBehavior.toggleAll();
  }

  /** Checks if the given item is able to receive focus. */
  isFocusable(item: T) {
    return this.focusBehavior.isFocusable(item);
  }

  /** Handles updating selection for the tree. */
  updateSelection(opts: NavOptions<T> = {anchor: true}) {
    if (opts.toggle) {
      this.selectionBehavior.toggle();
    }
    if (opts.select) {
      this.selectionBehavior.select();
    }
    if (opts.selectOne) {
      this.selectionBehavior.selectOne();
    }
    if (opts.selectRange) {
      this.selectionBehavior.selectRange();
    }
    if (!opts.anchor) {
      this.anchor(this.selectionBehavior.rangeStartIndex());
    }
  }

  /**
   * Safely performs a navigation operation.
   */
  private _navigate(opts: NavOptions<T> = {}, operation: () => boolean) {
    if (opts?.selectRange) {
      this._wrap.set(false);
      this.selectionBehavior.rangeStartIndex.set(this._anchorIndex());
    }

    const moved = operation();

    if (moved) {
      this.updateSelection(opts);
    }

    this._wrap.set(true);
  }

  /**
   * Constructs navigation options with the visible items subset.
   */
  private _getNavOpts(opts?: NavOptions<T>): ListNavigationOpts<T> {
    const visibleItems = this.inputs.items().filter(i => {
      return i.visible() !== false;
    });

    return {
      items: visibleItems,
      ...opts,
    };
  }
}
