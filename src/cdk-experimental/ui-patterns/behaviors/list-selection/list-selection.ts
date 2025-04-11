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
  /** The value of the most recently selected item. */
  previousValue = signal<V | undefined>(undefined);

  /** The navigation controller of the parent list. */
  navigation: ListNavigation<T>;

  constructor(readonly inputs: ListSelectionInputs<T, V> & {navigation: ListNavigation<T>}) {
    this.navigation = inputs.navigation;
  }

  /** Selects the item at the current active index. */
  select(item?: T) {
    item = item ?? this.inputs.items()[this.inputs.navigation.inputs.activeIndex()];

    if (item.disabled() || this.inputs.value().includes(item.value())) {
      return;
    }

    if (!this.inputs.multi()) {
      this.deselectAll();
    }

    // TODO: Need to discuss when to drop this.
    this._anchor();
    this.inputs.value.update(values => values.concat(item.value()));
  }

  /** Deselects the item at the current active index. */
  deselect(item?: T) {
    item = item ?? this.inputs.items()[this.inputs.navigation.inputs.activeIndex()];

    if (!item.disabled()) {
      this.inputs.value.update(values => values.filter(value => value !== item.value()));
    }
  }

  /** Toggles the item at the current active index. */
  toggle() {
    const item = this.inputs.items()[this.inputs.navigation.inputs.activeIndex()];
    this.inputs.value().includes(item.value()) ? this.deselect() : this.select();
  }

  /** Toggles only the item at the current active index. */
  toggleOne() {
    const item = this.inputs.items()[this.inputs.navigation.inputs.activeIndex()];
    this.inputs.value().includes(item.value()) ? this.deselect() : this.selectOne();
  }

  /** Selects all items in the list. */
  selectAll() {
    if (!this.inputs.multi()) {
      return; // Should we log a warning?
    }

    for (const item of this.inputs.items()) {
      this.select(item);
    }

    this._anchor();
  }

  /** Deselects all items in the list. */
  deselectAll() {
    for (const item of this.inputs.items()) {
      this.deselect(item);
    }
  }

  /** Selects the items in the list starting at the last selected item. */
  selectFromPrevSelectedItem() {
    const previousValue = this.inputs.items().findIndex(i => this.previousValue() === i.value());
    this._selectFromIndex(previousValue);
  }

  /** Selects the items in the list starting at the last active item. */
  selectFromActive() {
    this._selectFromIndex(this.inputs.navigation.prevActiveIndex());
  }

  /** Sets the selection to only the current active item. */
  selectOne() {
    this.deselectAll();
    this.select();
  }

  /** Toggles the items in the list starting at the last selected item. */
  toggleFromPrevSelectedItem() {
    const prevIndex = this.inputs.items().findIndex(i => this.previousValue() === i.value());
    const currIndex = this.inputs.navigation.inputs.activeIndex();
    const currValue = this.inputs.items()[currIndex].value();
    const items = this._getItemsFromIndex(prevIndex);

    const operation = this.inputs.value().includes(currValue)
      ? this.deselect.bind(this)
      : this.select.bind(this);

    for (const item of items) {
      operation(item);
    }
  }

  /** Sets the anchor to the current active index. */
  private _anchor() {
    const item = this.inputs.items()[this.inputs.navigation.inputs.activeIndex()];
    this.previousValue.set(item.value());
  }

  /** Selects the items in the list starting at the given index. */
  private _selectFromIndex(index: number) {
    const items = this._getItemsFromIndex(index);

    for (const item of items) {
      this.select(item);
    }
  }

  /** Returns all items from the given index to the current active index. */
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
    return items;
  }
}
