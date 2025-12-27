/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, signal, SignalLike, WritableSignalLike} from '../signal-like/signal-like';
import {ListFocus, ListFocusInputs, ListFocusItem} from '../list-focus/list-focus';

/** Represents an item in a collection, such as a listbox option, that can be selected. */
export interface ListSelectionItem<V> extends ListFocusItem {
  /** The value of the item. */
  value: SignalLike<V>;

  /** Whether the item is selectable. */
  selectable: SignalLike<boolean>;
}

/** Represents the required inputs for a collection that contains selectable items. */
export interface ListSelectionInputs<T extends ListSelectionItem<V>, V> extends ListFocusInputs<T> {
  /** Whether multiple items in the list can be selected at once. */
  multi: SignalLike<boolean>;

  /** The current value of the list selection. */
  values: WritableSignalLike<V[]>;

  /** The selection strategy used by the list. */
  selectionMode: SignalLike<'follow' | 'explicit'>;
}

/** Controls selection for a list of items. */
export class ListSelection<T extends ListSelectionItem<V>, V> {
  /** The start index to use for range selection. */
  rangeStartIndex = signal<number>(0);

  /** The end index to use for range selection. */
  rangeEndIndex = signal<number>(0);

  /** The currently selected items. */
  selectedItems = computed(() =>
    this.inputs.items().filter(item => this.inputs.values().includes(item.value())),
  );

  constructor(readonly inputs: ListSelectionInputs<T, V> & {focusManager: ListFocus<T>}) {}

  /** Selects the item at the current active index. */
  select(item?: ListSelectionItem<V>, opts = {anchor: true}) {
    item = item ?? (this.inputs.focusManager.inputs.activeItem() as ListSelectionItem<V>);

    if (
      !item ||
      item.disabled() ||
      !item.selectable() ||
      !this.inputs.focusManager.isFocusable(item as T) ||
      this.inputs.values().includes(item.value())
    ) {
      return;
    }

    if (!this.inputs.multi()) {
      this.deselectAll();
    }

    const index = this.inputs.items().findIndex(i => i === item);
    if (opts.anchor) {
      this.beginRangeSelection(index);
    }
    this.inputs.values.update(values => values.concat(item.value()));
  }

  /** Deselects the item at the current active index. */
  deselect(item?: ListSelectionItem<V>) {
    item = item ?? this.inputs.focusManager.inputs.activeItem();

    if (item && !item.disabled() && item.selectable()) {
      this.inputs.values.update(values => values.filter(value => value !== item.value()));
    }
  }

  /** Toggles the item at the current active index. */
  toggle(item?: ListSelectionItem<V>) {
    item = item ?? this.inputs.focusManager.inputs.activeItem();
    if (item) {
      this.inputs.values().includes(item.value()) ? this.deselect(item) : this.select(item);
    }
  }

  /** Toggles only the item at the current active index. */
  toggleOne() {
    const item = this.inputs.focusManager.inputs.activeItem();
    if (item) {
      this.inputs.values().includes(item.value()) ? this.deselect() : this.selectOne();
    }
  }

  /** Selects all items in the list. */
  selectAll() {
    if (!this.inputs.multi()) {
      return; // Should we log a warning?
    }

    for (const item of this.inputs.items()) {
      this.select(item, {anchor: false});
    }

    this.beginRangeSelection();
  }

  /** Deselects all items in the list. */
  deselectAll() {
    // If an item is not in the list, it forcefully gets deselected.
    // This actually creates a bug for the following edge case:
    //
    // Setup: An item is not in the list (maybe it's lazily loaded), and it is disabled & selected.
    // Expected: If deselectAll() is called, it should NOT get deselected (because it is disabled).
    // Actual: Calling deselectAll() will still deselect the item.
    //
    // Why? Because we can't check if the item is disabled if it's not in the list.
    //
    // Alternatively, we could NOT deselect items that are not in the list, but this has the
    // inverse (and more common) effect of keeping enabled items selected when they aren't in the
    // list.

    for (const value of this.inputs.values()) {
      const item = this.inputs.items().find(i => i.value() === value);

      item
        ? this.deselect(item)
        : this.inputs.values.update(values => values.filter(v => v !== value));
    }
  }

  /**
   * Selects all items in the list or deselects all
   * items in the list if all items are already selected.
   */
  toggleAll() {
    const selectableValues = this.inputs
      .items()
      .filter(i => !i.disabled() && i.selectable() && this.inputs.focusManager.isFocusable(i))
      .map(i => i.value());

    selectableValues.every(i => this.inputs.values().includes(i))
      ? this.deselectAll()
      : this.selectAll();
  }

  /** Sets the selection to only the current active item. */
  selectOne() {
    const item = this.inputs.focusManager.inputs.activeItem();
    if (item && (item.disabled() || !item.selectable())) {
      return;
    }

    this.deselectAll();

    if (this.inputs.values().length > 0 && !this.inputs.multi()) {
      return;
    }

    this.select();
  }

  /**
   * Selects all items in the list up to the anchor item.
   *
   * Deselects all items that were previously within the
   * selected range that are now outside of the selected range
   */
  selectRange(opts = {anchor: true}) {
    const isStartOfRange = this.inputs.focusManager.prevActiveIndex() === this.rangeStartIndex();

    if (isStartOfRange && opts.anchor) {
      this.beginRangeSelection(this.inputs.focusManager.prevActiveIndex());
    }

    const itemsInRange = this._getItemsFromIndex(this.rangeStartIndex());
    const itemsOutOfRange = this._getItemsFromIndex(this.rangeEndIndex()).filter(
      i => !itemsInRange.includes(i),
    );

    for (const item of itemsOutOfRange) {
      this.deselect(item);
    }

    for (const item of itemsInRange) {
      this.select(item, {anchor: false});
    }

    if (itemsInRange.length) {
      const item = itemsInRange.pop();
      const index = this.inputs.items().findIndex(i => i === item);
      this.rangeEndIndex.set(index);
    }
  }

  /** Marks the given index as the start of a range selection. */
  beginRangeSelection(index: number = this.inputs.focusManager.activeIndex()) {
    this.rangeStartIndex.set(index);
    this.rangeEndIndex.set(index);
  }

  /** Returns the items in the list starting from the given index.  */
  private _getItemsFromIndex(index: number) {
    if (index === -1) {
      return [];
    }

    const upper = Math.max(this.inputs.focusManager.activeIndex(), index);
    const lower = Math.min(this.inputs.focusManager.activeIndex(), index);

    const items = [];
    for (let i = lower; i <= upper; i++) {
      items.push(this.inputs.items()[i]);
    }

    if (this.inputs.focusManager.activeIndex() < index) {
      return items.reverse();
    }

    return items;
  }
}
