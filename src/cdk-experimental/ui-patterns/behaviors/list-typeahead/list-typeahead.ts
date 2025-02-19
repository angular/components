/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {signal, Signal} from '@angular/core';
import type {ListTypeaheadController} from './controller';
import {ListNavigationItem, ListNavigation} from '../list-navigation/list-navigation';

/** The required properties for typeahead items. */
export interface ListTypeaheadItem extends ListNavigationItem {
  /** The text used by the typeahead search. */
  searchTerm: Signal<string>;
}

/** The required inputs for list typeahead. */
export interface ListTypeaheadInputs {
  /** The amount of time before the typeahead search is reset. */
  typeaheadDelay: Signal<number>;
}

/** Controls typeahead for a list of items. */
export class ListTypeahead<T extends ListTypeaheadItem> {
  /** A reference to the timeout for resetting the typeahead search. */
  timeout?: any;

  /** The navigation controller of the parent list. */
  navigation: ListNavigation<T>;

  /** Keeps track of the characters that typeahead search is being called with. */
  private query = signal('');

  /** The index where that the typeahead search was initiated from. */
  private anchorIndex = signal<number | null>(null);

  constructor(readonly inputs: ListTypeaheadInputs & {navigation: ListNavigation<T>}) {
    this.navigation = inputs.navigation;
  }

  /** Performs a typeahead search, appending the given character to the search string. */
  search(char: string) {
    if (char.length !== 1) {
      return;
    }

    if (this.anchorIndex() === null) {
      this.anchorIndex.set(this.navigation.inputs.activeIndex());
    }

    clearTimeout(this.timeout);
    this.query.update(q => q + char.toLowerCase());
    const item = this._getItem();

    if (item) {
      this.navigation.goto(item);
    }

    this.timeout = setTimeout(() => {
      this.query.set('');
      this.anchorIndex.set(null);
    }, this.inputs.typeaheadDelay() * 1000);
  }

  /**
   * Returns the first item whose search term matches the
   * current query starting from the the current anchor index.
   */
  private _getItem() {
    let items = this.navigation.inputs.items();
    const after = items.slice(this.anchorIndex()! + 1);
    const before = items.slice(0, this.anchorIndex()!);
    items = this.navigation.inputs.wrap() ? after.concat(before) : after; // TODO: Always wrap?
    items.push(this.navigation.inputs.items()[this.anchorIndex()!]);

    const focusableItems = [];
    for (const item of items) {
      if (this.navigation.isFocusable(item)) {
        focusableItems.push(item);
      }
    }

    return focusableItems.find(i => i.searchTerm().toLowerCase().startsWith(this.query()));
  }
}
