/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ListSelectionItem, ListSelection} from './list-selection';

/** Controls selection for a list of items. */
export class ListSelectionController<T extends ListSelectionItem> {
  constructor(readonly state: ListSelection<T>) {
    if (this.state.inputs.selectedIds()) {
      this._anchor();
    }
  }

  /** Selects the item at the current active index. */
  select(item?: T) {
    item = item ?? this.state.inputs.items()[this.state.inputs.navigation.inputs.activeIndex()];

    if (item.disabled() || this.state.inputs.selectedIds().includes(item.id())) {
      return;
    }

    if (!this.state.inputs.multiselectable()) {
      this.deselectAll();
    }

    // TODO: Need to discuss when to drop this.
    this._anchor();
    this.state.inputs.selectedIds.update(ids => ids.concat(item.id()));
  }

  /** Deselects the item at the current active index. */
  deselect(item?: T) {
    item = item ?? this.state.inputs.items()[this.state.inputs.navigation.inputs.activeIndex()];

    if (!item.disabled()) {
      this.state.inputs.selectedIds.update(ids => ids.filter(id => id !== item.id()));
    }
  }

  /** Toggles the item at the current active index. */
  toggle() {
    const item = this.state.inputs.items()[this.state.inputs.navigation.inputs.activeIndex()];
    this.state.inputs.selectedIds().includes(item.id()) ? this.deselect() : this.select();
  }

  /** Toggles only the item at the current active index. */
  toggleOne() {
    const item = this.state.inputs.items()[this.state.inputs.navigation.inputs.activeIndex()];
    this.state.inputs.selectedIds().includes(item.id()) ? this.deselect() : this.selectOne();
  }

  /** Selects all items in the list. */
  selectAll() {
    if (!this.state.inputs.multiselectable()) {
      return; // Should we log a warning?
    }

    for (const item of this.state.inputs.items()) {
      this.select(item);
    }

    this._anchor();
  }

  /** Deselects all items in the list. */
  deselectAll() {
    for (const item of this.state.inputs.items()) {
      this.deselect(item);
    }
  }

  /** Selects the items in the list starting at the last selected item. */
  selectFromAnchor() {
    const anchorIndex = this.state.inputs.items().findIndex(i => this.state.anchorId() === i.id());
    this._selectFromIndex(anchorIndex);
  }

  /** Selects the items in the list starting at the last active item. */
  selectFromActive() {
    this._selectFromIndex(this.state.inputs.navigation.prevActiveIndex());
  }

  /** Selects the items in the list starting at the given index. */
  private _selectFromIndex(index: number) {
    if (index === -1) {
      return;
    }

    const upper = Math.max(this.state.inputs.navigation.inputs.activeIndex(), index);
    const lower = Math.min(this.state.inputs.navigation.inputs.activeIndex(), index);

    for (let i = lower; i <= upper; i++) {
      this.select(this.state.inputs.items()[i]);
    }
  }

  /** Sets the selection to only the current active item. */
  selectOne() {
    this.deselectAll();
    this.select();
  }

  /** Sets the anchor to the current active index. */
  private _anchor() {
    const item = this.state.inputs.items()[this.state.inputs.navigation.inputs.activeIndex()];
    this.state.anchorId.set(item.id());
  }
}
