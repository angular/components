/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Signal} from '@angular/core';
import {ListNavigation, ListNavigationItem} from '../list-navigation/list-navigation';

/** Represents an item in a collection, such as a listbox option, than may receive focus. */
export interface ListFocusItem extends ListNavigationItem {
  /** A unique identifier for the item. */
  id: Signal<string>;

  /** The html element that should receive focus. */
  element: Signal<HTMLElement>;
}

/** Represents the required inputs for a collection that contains focusable items. */
export interface ListFocusInputs<T extends ListFocusItem> {
  /** The focus strategy used by the list. */
  focusMode: Signal<'roving' | 'activedescendant'>;
}

/** Controls focus for a list of items. */
export class ListFocus<T extends ListFocusItem> {
  /** The navigation controller of the parent list. */
  navigation: ListNavigation<ListFocusItem>;

  constructor(readonly inputs: ListFocusInputs<T> & {navigation: ListNavigation<T>}) {
    this.navigation = inputs.navigation;
  }

  /** The id of the current active item. */
  getActiveDescendant(): String | undefined {
    if (this.inputs.focusMode() === 'roving') {
      return undefined;
    }
    return this.navigation.inputs.items()[this.navigation.inputs.activeIndex()].id();
  }

  /** The tabindex for the list. */
  getListTabindex(): -1 | 0 {
    return this.inputs.focusMode() === 'activedescendant' ? 0 : -1;
  }

  /** Returns the tabindex for the given item. */
  getItemTabindex(item: T): -1 | 0 {
    if (this.inputs.focusMode() === 'activedescendant') {
      return -1;
    }
    const index = this.navigation.inputs.items().indexOf(item);
    return this.navigation.inputs.activeIndex() === index ? 0 : -1;
  }

  /** Focuses the current active item. */
  focus() {
    if (this.inputs.focusMode() === 'activedescendant') {
      return;
    }

    const item = this.navigation.inputs.items()[this.navigation.inputs.activeIndex()];
    item.element().focus();
  }
}
