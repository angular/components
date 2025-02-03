/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {signal, Signal, WritableSignal} from '@angular/core';
import {ListSelectionController} from './controller';
import {ListNavigation, ListNavigationItem} from '../list-navigation/list-navigation';

/** The required properties for selection items. */
export interface ListSelectionItem extends ListNavigationItem {
  /** A unique identifier for the item. */
  id: Signal<string>;

  /** Whether an item is disabled. */
  disabled: Signal<boolean>;
}

/** The required inputs for list selection. */
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
  /** The id of the previous selected item. */
  anchorId = signal<string | null>(null);

  /** The navigation controller of the parent list. */
  navigation: ListNavigation<T>;

  get controller(): Promise<ListSelectionController<T>> {
    if (this._controller === null) {
      return this.loadController();
    }
    return Promise.resolve(this._controller);
  }
  private _controller: ListSelectionController<T> | null = null;

  constructor(readonly inputs: ListSelectionInputs<T> & {navigation: ListNavigation<T>}) {
    this.navigation = inputs.navigation;
  }

  /** Loads the controller for list selection. */
  async loadController(): Promise<ListSelectionController<T>> {
    return import('./controller').then(m => {
      this._controller = new m.ListSelectionController(this);
      return this._controller;
    });
  }

  /** Selects the item at the current active index. */
  async select(item?: T) {
    return (await this.controller).select(item);
  }

  /** Deselects the item at the current active index. */
  async deselect(item?: T) {
    return (await this.controller).deselect(item);
  }

  /** Toggles the item at the current active index. */
  async toggle() {
    return (await this.controller).toggle();
  }

  /** Toggles only the item at the current active index. */
  async toggleOne() {
    return (await this.controller).toggleOne();
  }

  /** Selects all items in the list. */
  async selectAll() {
    return (await this.controller).selectAll();
  }

  /** Deselects all items in the list. */
  async deselectAll() {
    return (await this.controller).deselectAll();
  }

  /** Selects the items in the list starting at the last selected item. */
  async selectFromAnchor() {
    return (await this.controller).selectFromAnchor();
  }

  /** Selects the items in the list starting at the last active item. */
  async selectFromActive() {
    return (await this.controller).selectFromActive();
  }

  /** Sets the selection to only the current active item. */
  async selectOne() {
    return (await this.controller).selectOne();
  }
}
