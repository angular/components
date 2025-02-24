/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {signal, Signal, WritableSignal} from '@angular/core';
import {ListNavigation, ListNavigationItem} from '../list-navigation/list-navigation';

/** Represents an item in a collection, such as a listbox option, than can be selected. */
export interface ListSelectionItem extends ListNavigationItem {
  /** A unique identifier for the item. */
  id: Signal<string>;

  /** Whether an item is disabled. */
  disabled: Signal<boolean>;
}

/** Represents the required inputs for a collection that contains selectable items. */
export interface ListSelectionInputs<T extends ListSelectionItem> {
  /** The items in the list. */
  items: Signal<T[]>;

  /** Whether multiple items in the list can be selected at once. */
  multiselectable: Signal<boolean>;

  /** The ids of the current selected items. */
  selectedIds: WritableSignal<string[]>;

  /** The selection strategy used by the list. */
  selectionMode: Signal<'follow' | 'explicit'>;
}

/** Controls selection for a list of items. */
export class ListSelection<T extends ListSelectionItem> {
  /** The id of the last selected item. */
  lastSelectedId = signal<string | undefined>(undefined);

  /** The navigation controller of the parent list. */
  navigation: ListNavigation<T>;

  constructor(readonly inputs: ListSelectionInputs<T> & {navigation: ListNavigation<T>}) {
    this.navigation = inputs.navigation;
  }

  /** Selects the item at the current active index. */
  select(item?: T) {
    item = item ?? this.inputs.items()[this.inputs.navigation.inputs.activeIndex()];

    if (item.disabled() || this.inputs.selectedIds().includes(item.id())) {
      return;
    }

    if (!this.inputs.multiselectable()) {
      this.deselectAll();
    }

    // TODO: Need to discuss when to drop this.
    this._anchor();
    this.inputs.selectedIds.update(ids => ids.concat(item.id()));
  }

  /** Deselects the item at the current active index. */
  deselect(item?: T) {
    item = item ?? this.inputs.items()[this.inputs.navigation.inputs.activeIndex()];

    if (!item.disabled()) {
      this.inputs.selectedIds.update(ids => ids.filter(id => id !== item.id()));
    }
  }

  /** Toggles the item at the current active index. */
  toggle() {
    const item = this.inputs.items()[this.inputs.navigation.inputs.activeIndex()];
    this.inputs.selectedIds().includes(item.id()) ? this.deselect() : this.select();
  }

  /** Toggles only the item at the current active index. */
  toggleOne() {
    const item = this.inputs.items()[this.inputs.navigation.inputs.activeIndex()];
    this.inputs.selectedIds().includes(item.id()) ? this.deselect() : this.selectOne();
  }

  /** Selects all items in the list. */
  selectAll() {
    if (!this.inputs.multiselectable()) {
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
  selectFromLastSelectedItem() {
    const lastSelectedId = this.inputs.items().findIndex(i => this.lastSelectedId() === i.id());
    this._selectFromIndex(lastSelectedId);
  }

  /** Selects the items in the list starting at the last active item. */
  selectFromActive() {
    this._selectFromIndex(this.inputs.navigation.prevActiveIndex());
  }

  /** Selects the items in the list starting at the given index. */
  private _selectFromIndex(index: number) {
    if (index === -1) {
      return;
    }

    const upper = Math.max(this.inputs.navigation.inputs.activeIndex(), index);
    const lower = Math.min(this.inputs.navigation.inputs.activeIndex(), index);

    for (let i = lower; i <= upper; i++) {
      this.select(this.inputs.items()[i]);
    }
  }

  /** Sets the selection to only the current active item. */
  selectOne() {
    this.deselectAll();
    this.select();
  }

  /** Sets the anchor to the current active index. */
  private _anchor() {
    const item = this.inputs.items()[this.inputs.navigation.inputs.activeIndex()];
    this.lastSelectedId.set(item.id());
  }
}
