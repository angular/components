/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {signal, Signal} from '@angular/core';
import {sortDirectives, HasElement} from './element';

/**
 * A collection that lazily sorts its items based on their DOM position.
 * It uses manual registration and updates its order when items are added/removed
 * or when structural DOM changes are detected via MutationObserver.
 *
 * TODO(ok7sai): replace Mutation Observer with internal API.
 */
export class SortedCollection<T extends HasElement> {
  private readonly _items = new Set<T>();
  private readonly _sortedItems = signal<T[]>([]);
  private _observer?: MutationObserver;

  readonly orderedItems: Signal<T[]> = this._sortedItems.asReadonly();

  register(item: T) {
    if (!this._items.has(item)) {
      this._items.add(item);
      this._sortedItems.set(this._getSortedItems());
    }
  }

  unregister(item: T) {
    if (this._items.has(item)) {
      this._items.delete(item);
      this._sortedItems.set(this._getSortedItems());
    }
  }

  startObserving(element: HTMLElement) {
    this.stopObserving();
    this._observer = new MutationObserver(mutations => {
      const hasStructuralChange = mutations.some(m => m.addedNodes.length || m.removedNodes.length);

      if (hasStructuralChange) {
        const newItems = this._getSortedItems();
        const currentItems = this._sortedItems();
        const hasChanged =
          newItems.length !== currentItems.length ||
          newItems.some((item, index) => currentItems[index] !== item);

        if (hasChanged) {
          this._sortedItems.set(newItems);
        }
      }
    });

    this._observer.observe(element, {childList: true, subtree: true, attributes: false});
  }

  stopObserving() {
    this._observer?.disconnect();
    this._observer = undefined;
  }

  private _getSortedItems() {
    return Array.from(this._items).sort(sortDirectives);
  }
}
