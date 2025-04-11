/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, signal} from '@angular/core';
import {SignalLike} from '../signal-like/signal-like';
import {ListNavigationItem, ListNavigation} from '../list-navigation/list-navigation';

/**
 * Represents an item in a collection, such as a listbox option, than can be navigated to by
 * typeahead.
 */
export interface ListTypeaheadItem extends ListNavigationItem {
  /** The text used by the typeahead search. */
  searchTerm: SignalLike<string>;
}

/**
 * Represents the required inputs for a collection that contains items that can be navigated to by
 * typeahead.
 */
export interface ListTypeaheadInputs {
  /** The amount of time before the typeahead search is reset. */
  typeaheadDelay: SignalLike<number>;
}

/** Controls typeahead for a list of items. */
export class ListTypeahead<T extends ListTypeaheadItem> {
  /** A reference to the timeout for resetting the typeahead search. */
  timeout?: ReturnType<typeof setTimeout> | undefined;

  /** The navigation controller of the parent list. */
  navigation: ListNavigation<T>;

  /** Whether the user is actively typing a typeahead search query. */
  isTyping = computed(() => this._query().length > 0);

  /** Keeps track of the characters that typeahead search is being called with. */
  private _query = signal('');

  /** The index where that the typeahead search was initiated from. */
  private _startIndex = signal<number | undefined>(undefined);

  constructor(readonly inputs: ListTypeaheadInputs & {navigation: ListNavigation<T>}) {
    this.navigation = inputs.navigation;
  }

  /** Performs a typeahead search, appending the given character to the search string. */
  search(char: string) {
    if (char.length !== 1) {
      return;
    }

    if (!this.isTyping() && char === ' ') {
      return;
    }

    if (this._startIndex() === undefined) {
      this._startIndex.set(this.navigation.inputs.activeIndex());
    }

    clearTimeout(this.timeout);
    this._query.update(q => q + char.toLowerCase());
    const item = this._getItem();

    if (item) {
      this.navigation.goto(item);
    }

    this.timeout = setTimeout(() => {
      this._query.set('');
      this._startIndex.set(undefined);
    }, this.inputs.typeaheadDelay() * 1000);
  }

  /**
   * Returns the first item whose search term matches the
   * current query starting from the the current anchor index.
   */
  private _getItem() {
    let items = this.navigation.inputs.items();
    const after = items.slice(this._startIndex()! + 1);
    const before = items.slice(0, this._startIndex()!);
    items = this.navigation.inputs.wrap() ? after.concat(before) : after; // TODO: Always wrap?
    items.push(this.navigation.inputs.items()[this._startIndex()!]);

    const focusableItems = [];
    for (const item of items) {
      if (this.navigation.isFocusable(item)) {
        focusableItems.push(item);
      }
    }

    return focusableItems.find(i => i.searchTerm().toLowerCase().startsWith(this._query()));
  }
}
