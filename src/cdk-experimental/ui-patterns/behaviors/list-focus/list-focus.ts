/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, Signal} from '@angular/core';
import {ListNavigation, ListNavigationItem} from '../list-navigation/list-navigation';
import type {ListFocusController} from './controller';

/** The required properties for focus items. */
export interface ListFocusItem extends ListNavigationItem {
  /** A unique identifier for the item. */
  id: Signal<string>;

  /** The html element that should receive focus. */
  element: Signal<HTMLElement>;
}

/** The required inputs for list focus. */
export interface ListFocusInputs<T extends ListFocusItem> {
  /** The focus strategy used by the list. */
  focusMode: Signal<'roving' | 'activedescendant'>;
}

/** Controls focus for a list of items. */
export class ListFocus<T extends ListFocusItem> {
  /** The navigation controller of the parent list. */
  navigation: ListNavigation<ListFocusItem>;

  get controller(): Promise<ListFocusController<T>> {
    if (this._controller === null) {
      return this.loadController();
    }
    return Promise.resolve(this._controller);
  }
  private _controller: ListFocusController<T> | null = null;

  constructor(readonly inputs: ListFocusInputs<T> & {navigation: ListNavigation<T>}) {
    this.navigation = inputs.navigation;
  }

  /** Loads the controller for list focus. */
  async loadController(): Promise<ListFocusController<T>> {
    return import('./controller').then(m => {
      this._controller = new m.ListFocusController(this);
      return this._controller;
    });
  }

  /** Returns the id of the current active item. */
  getActiveDescendant(): Signal<string | null> {
    return computed(() => {
      if (this.inputs.focusMode() === 'roving') {
        return null;
      }
      return this.navigation.inputs.items()[this.navigation.inputs.activeIndex()].id();
    });
  }

  /** Returns a signal that keeps track of the tabindex for the list. */
  getListTabindex(): Signal<-1 | 0> {
    return computed(() => (this.inputs.focusMode() === 'activedescendant' ? 0 : -1));
  }

  /** Returns a signal that keeps track of the tabindex for the given item. */
  getItemTabindex(item: T): Signal<-1 | 0> {
    return computed(() => {
      if (this.inputs.focusMode() === 'activedescendant') {
        return -1;
      }
      const index = this.navigation.inputs.items().indexOf(item);
      return this.navigation.inputs.activeIndex() === index ? 0 : -1;
    });
  }

  /** Focuses the current active item. */
  async focus() {
    (await this.controller).focus();
  }
}
