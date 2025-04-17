/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {signal} from '@angular/core';
import {SignalLike, WritableSignalLike} from '../signal-like/signal-like';
import {ListNavigation, ListNavigationItem} from '../list-navigation/list-navigation';

/** Represents an item in a collection, such as a listbox option, than can be selected. */
export interface ListSelectionItem<V> extends ListNavigationItem {
  /** The value of the item. */
  value: SignalLike<V>;

  /** Whether an item is disabled. */
  disabled: SignalLike<boolean>;
}

/** Represents the required inputs for a collection that contains selectable items. */
export interface ListSelectionInputs<T extends ListSelectionItem<V>, V> {
  /** The items in the list. */
  items: SignalLike<T[]>;

  /** Whether multiple items in the list can be selected at once. */
  multi: SignalLike<boolean>;

  /** The current value of the list selection. */
  value: WritableSignalLike<V[]>;

  /** The selection strategy used by the list. */
  selectionMode: SignalLike<'follow' | 'explicit'>;
}

/** Controls selection for a list of items. */
export class ListSelection<T extends ListSelectionItem<V>, V> {
  /** The start index to use for range selection. */
  rangeStartIndex = signal<number>(0);

  /** The end index to use for range selection. */
  rangeEndIndex = signal<number>(0);

  /** The navigation controller of the parent list. */
  navigation: ListNavigation<T>;

  constructor(readonly inputs: ListSelectionInputs<T, V> & {navigation: ListNavigation<T>}) {
    this.navigation = inputs.navigation;
  }

  /** Selects the item at the current active index. */
  select(item?: T, opts = {anchor: true}) {
    item = item ?? this.inputs.navigation.activeItem();

    if (item.disabled() || this.inputs.value().includes(item.value())) {
      return;
    }

    if (!this.inputs.multi()) {
      this.deselectAll();
    }

    const index = this.inputs.items().findIndex(i => i === item);
    if (opts.anchor) {
      this.beginRangeSelection(index);
    }
    this.inputs.value.update(values => values.concat(item.value()));
  }

  /** Deselects the item at the current active index. */
  deselect(item?: T) {
    item = item ?? this.inputs.navigation.activeItem();

    if (!item.disabled()) {
      this.inputs.value.update(values => values.filter(value => value !== item.value()));
    }
  }

  /** Toggles the item at the current active index. */
  toggle() {
    const item = this.inputs.navigation.activeItem();
    this.inputs.value().includes(item.value()) ? this.deselect() : this.select();
  }

  /** Toggles only the item at the current active index. */
  toggleOne() {
    const item = this.inputs.navigation.activeItem();
    this.inputs.value().includes(item.value()) ? this.deselect() : this.selectOne();
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
    for (const item of this.inputs.items()) {
      this.deselect(item);
    }
  }

  /**
   * Selects all items in the list or deselects all
   * items in the list if all items are already selected.
   */
  toggleAll() {
    const selectableValues = this.inputs
      .items()
      .filter(i => !i.disabled())
      .map(i => i.value());

    selectableValues.every(i => this.inputs.value().includes(i))
      ? this.deselectAll()
      : this.selectAll();
  }

  /** Sets the selection to only the current active item. */
  selectOne() {
    this.deselectAll();
    this.select();
  }

  /**
   * Selects all items in the list up to the anchor item.
   *
   * Deselects all items that were previously within the
   * selected range that are now outside of the selected range
   */
  selectRange(opts = {anchor: true}) {
    const isStartOfRange = this.navigation.prevActiveIndex() === this.rangeStartIndex();

    if (isStartOfRange && opts.anchor) {
      this.beginRangeSelection(this.navigation.prevActiveIndex());
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
  beginRangeSelection(index: number = this.navigation.inputs.activeIndex()) {
    this.rangeStartIndex.set(index);
    this.rangeEndIndex.set(index);
  }

  /** Returns the items in the list starting from the given index.  */
  private _getItemsFromIndex(index: number) {
    if (index === -1) {
      return [];
    }

    const upper = Math.max(this.inputs.navigation.inputs.activeIndex(), index);
    const lower = Math.min(this.inputs.navigation.inputs.activeIndex(), index);

    const items = [];
    for (let i = lower; i <= upper; i++) {
      items.push(this.inputs.items()[i]);
    }

    if (this.inputs.navigation.inputs.activeIndex() < index) {
      return items.reverse();
    }

    return items;
  }
}
