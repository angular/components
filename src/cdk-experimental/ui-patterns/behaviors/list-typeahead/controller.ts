/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {signal} from '@angular/core';
import {ListTypeaheadItem, ListTypeahead} from './list-typeahead';

/** Controls typeahead for a list of items. */
export class ListTypeaheadController<T extends ListTypeaheadItem> {
  /** A reference to the timeout for resetting the typeahead search. */
  timeout?: any;

  /** Keeps track of the characters that typeahead search is being called with. */
  query = signal('');

  /** The index where that the typeahead search was initiated from. */
  anchorIndex = signal<number | null>(null);

  constructor(readonly state: ListTypeahead<T>) {}

  /** Performs a typeahead search, appending the given character to the search string. */
  async search(char: string) {
    if (char.length !== 1) {
      return;
    }

    if (this.anchorIndex() === null) {
      this.anchorIndex.set(this.state.navigation.inputs.activeIndex());
    }

    clearTimeout(this.timeout);
    this.query.update(q => q + char.toLowerCase());
    const item = await this._getItem();

    if (item) {
      await this.state.navigation.goto(item);
    }

    this.timeout = setTimeout(() => {
      this.query.set('');
      this.anchorIndex.set(null);
    }, this.state.inputs.typeaheadDelay() * 1000);
  }

  /**
   * Returns the first item whose search term matches the
   * current query starting from the the current anchor index.
   */
  private async _getItem() {
    let items = this.state.navigation.inputs.items();
    const after = items.slice(this.anchorIndex()! + 1);
    const before = items.slice(0, this.anchorIndex()!);
    items = this.state.navigation.inputs.wrap() ? after.concat(before) : after; // TODO: Always wrap?
    items.push(this.state.navigation.inputs.items()[this.anchorIndex()!]);

    const focusableItems = [];
    for (const item of items) {
      if (await this.state.navigation.isFocusable(item)) {
        focusableItems.push(item);
      }
    }

    return focusableItems.find(i => i.searchTerm().toLowerCase().startsWith(this.query()));
  }
}
