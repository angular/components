/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, signal} from '@angular/core';
import {ListFocus, ListFocusInputs, ListFocusItem} from '../list-focus/list-focus';
import {
  ListNavigation,
  ListNavigationInputs,
  ListNavigationItem,
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

/** The selection operations that the list can perform. */
interface SelectOptions {
  toggle?: boolean;
  select?: boolean;
  selectOne?: boolean;
  selectRange?: boolean;
  anchor?: boolean;
}

/** Represents an item in the list. */
export type ListItem<V> = ListTypeaheadItem &
  ListNavigationItem &
  ListSelectionItem<V> &
  ListFocusItem;

/** The necessary inputs for the list behavior. */
export type ListInputs<T extends ListItem<V>, V> = ListFocusInputs<T> &
  ListNavigationInputs<T> &
  ListSelectionInputs<T, V> &
  ListTypeaheadInputs<T>;

/** Controls the state of a list. */
export class List<T extends ListItem<V>, V> {
  /** Controls navigation for the list. */
  navigationBehavior: ListNavigation<T>;

  /** Controls selection for the list. */
  selectionBehavior: ListSelection<T, V>;

  /** Controls typeahead for the list. */
  typeaheadBehavior: ListTypeahead<T>;

  /** Controls focus for the list. */
  focusBehavior: ListFocus<T>;

  /** Whether the list is disabled. */
  disabled = computed(() => this.focusBehavior.isListDisabled());

  /** The id of the current active item. */
  activedescendant = computed(() => this.focusBehavior.getActiveDescendant());

  /** The tabindex of the list. */
  tabindex = computed(() => this.focusBehavior.getListTabindex());

  /** The index of the currently active item in the list. */
  activeIndex = computed(() => this.focusBehavior.activeIndex());

  /**
   * The uncommitted index for selecting a range of options.
   *
   * NOTE: This is subtly distinct from the "rangeStartIndex" in the ListSelection behavior.
   * The anchorIndex does not necessarily represent the start of a range, but represents the most
   * recent index where the user showed intent to begin a range selection. Usually, this is wherever
   * the user most recently pressed the "Shift" key, but if the user presses shift + space to select
   * from the anchor, the user is not intending to start a new range from this index.
   *
   * In other words, "rangeStartIndex" is only set when a user commits to starting a range selection
   * while "anchorIndex" is set whenever a user indicates they may be starting a range selection.
   */
  private _anchorIndex = signal(0);

  /** Whether the list should wrap. Used to disable wrapping while range selecting. */
  private _wrap = signal(true);

  constructor(readonly inputs: ListInputs<T, V>) {
    this.focusBehavior = new ListFocus(inputs);
    this.selectionBehavior = new ListSelection({...inputs, focusManager: this.focusBehavior});
    this.typeaheadBehavior = new ListTypeahead({...inputs, focusManager: this.focusBehavior});
    this.navigationBehavior = new ListNavigation({
      ...inputs,
      focusManager: this.focusBehavior,
      wrap: computed(() => this._wrap() && this.inputs.wrap()),
    });
  }

  /** Returns the tabindex for the given item. */
  getItemTabindex(item: T) {
    return this.focusBehavior.getItemTabindex(item);
  }

  /** Navigates to the first option in the list. */
  first(opts?: SelectOptions) {
    this._navigate(opts, () => this.navigationBehavior.first());
  }

  /** Navigates to the last option in the list. */
  last(opts?: SelectOptions) {
    this._navigate(opts, () => this.navigationBehavior.last());
  }

  /** Navigates to the next option in the list. */
  next(opts?: SelectOptions) {
    this._navigate(opts, () => this.navigationBehavior.next());
  }

  /** Navigates to the previous option in the list. */
  prev(opts?: SelectOptions) {
    this._navigate(opts, () => this.navigationBehavior.prev());
  }

  /** Navigates to the given item in the list. */
  goto(item: T, opts?: SelectOptions) {
    this._navigate(opts, () => this.navigationBehavior.goto(item));
  }

  /** Marks the given index as the potential start of a range selection. */
  anchor(index: number) {
    this._anchorIndex.set(index);
  }

  /** Handles typeahead search navigation for the list. */
  search(char: string, opts?: SelectOptions) {
    this._navigate(opts, () => this.typeaheadBehavior.search(char));
  }

  /** Checks if the list is currently typing for typeahead search. */
  isTyping() {
    return this.typeaheadBehavior.isTyping();
  }

  /** Selects the currently active item in the list. */
  select() {
    this.selectionBehavior.select();
  }

  /** Sets the selection to only the current active item. */
  selectOne() {
    this.selectionBehavior.selectOne();
  }

  /** Deselects the currently active item in the list. */
  deselect() {
    this.selectionBehavior.deselect();
  }

  /** Deselects all items in the list. */
  deselectAll() {
    this.selectionBehavior.deselectAll();
  }

  /** Toggles the currently active item in the list. */
  toggle() {
    this.selectionBehavior.toggle();
  }

  /** Toggles the currently active item in the list, deselecting all other items. */
  toggleOne() {
    this.selectionBehavior.toggleOne();
  }

  /** Toggles the selection of all items in the list. */
  toggleAll() {
    this.selectionBehavior.toggleAll();
  }

  /** Checks if the given item is able to receive focus. */
  isFocusable(item: T) {
    return this.focusBehavior.isFocusable(item);
  }

  /** Handles updating selection for the list. */
  updateSelection(opts: SelectOptions = {anchor: true}) {
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
   *
   * Handles conditionally disabling wrapping for when a navigation
   * operation is occurring while the user is selecting a range of options.
   *
   * Handles boilerplate calling of focus & selection operations. Also ensures these
   * additional operations are only called if the navigation operation moved focus to a new option.
   */
  private _navigate(opts: SelectOptions = {}, operation: () => boolean) {
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
}
