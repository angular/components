/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, signal} from '@angular/core';
import {SignalLike} from '../signal-like/signal-like';
import {ListFocus, ListFocusInputs, ListFocusItem} from '../list-focus/list-focus';

/**
 * Represents an item in a collection, such as a listbox option, than can be navigated to by
 * typeahead.
 */
export interface ListTypeaheadItem extends ListFocusItem {
  /** The text used by the typeahead search. */
  searchTerm: SignalLike<string>;
}

/**
 * Represents the required inputs for a collection that contains items that can be navigated to by
 * typeahead.
 */
export interface ListTypeaheadInputs<T extends ListTypeaheadItem> extends ListFocusInputs<T> {
  /** The amount of time before the typeahead search is reset. */
  typeaheadDelay: SignalLike<number>;
}

/** Controls typeahead for a list of items. */
export class ListTypeahead<T extends ListTypeaheadItem> {
  /** A reference to the timeout for resetting the typeahead search. */
  timeout?: ReturnType<typeof setTimeout> | undefined;

  /** The focus controller of the parent list. */
  focusManager: ListFocus<T>;

  /** Whether the user is actively typing a typeahead search query. */
  isTyping = computed(() => this._query().length > 0);

  /** Keeps track of the characters that typeahead search is being called with. */
  private _query = signal('');

  /** The index where that the typeahead search was initiated from. */
  private _startIndex = signal<number | undefined>(undefined);

  constructor(readonly inputs: ListTypeaheadInputs<T> & {focusManager: ListFocus<T>}) {
    this.focusManager = inputs.focusManager;
  }

  /** Performs a typeahead search, appending the given character to the search string. */
  search(char: string): boolean {
    if (char.length !== 1) {
      return false;
    }

    if (!this.isTyping() && char === ' ') {
      return false;
    }

    if (this._startIndex() === undefined) {
      this._startIndex.set(this.focusManager.inputs.activeIndex());
    }

    clearTimeout(this.timeout);
    this._query.update(q => q + char.toLowerCase());
    const item = this._getItem();

    if (item) {
      this.focusManager.focus(item);
    }

    this.timeout = setTimeout(() => {
      this._query.set('');
      this._startIndex.set(undefined);
    }, this.inputs.typeaheadDelay() * 1000);

    return true;
  }

  /**
   * Returns the first item whose search term matches the
   * current query starting from the the current anchor index.
   */
  private _getItem() {
    let items = this.focusManager.inputs.items();
    const after = items.slice(this._startIndex()! + 1);
    const before = items.slice(0, this._startIndex()!);
    items = after.concat(before);
    items.push(this.inputs.items()[this._startIndex()!]);

    const focusableItems = [];
    for (const item of items) {
      if (this.focusManager.isFocusable(item)) {
        focusableItems.push(item);
      }
    }

    return focusableItems.find(i => i.searchTerm().toLowerCase().startsWith(this._query()));
  }
}
