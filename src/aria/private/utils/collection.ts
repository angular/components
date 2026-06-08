/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {signal, computed, Signal} from '@angular/core';
import {sortDirectives, HasElement} from './element';

/**
 * A collection that lazily sorts its items based on their DOM position.
 * It uses manual registration and updates its order when items are added/removed
 * or when structural DOM changes are detected via MutationObserver.
 *
 * TODO(ok7sai): replace Mutation Observer with internal API.
 */
export class SortedCollection<T extends HasElement> {
  private readonly _items = signal<Set<T>>(new Set());
  private readonly _version = signal(0);
  private _observer?: MutationObserver;

  readonly orderedItems: Signal<T[]> = computed(() => {
    this._version(); // Track DOM changes
    const itemsArray = Array.from(this._items());
    return itemsArray.sort(sortDirectives);
  });

  register(item: T) {
    this._items.update(set => {
      const newSet = new Set(set);
      newSet.add(item);
      return newSet;
    });
  }

  unregister(item: T) {
    this._items.update(set => {
      const newSet = new Set(set);
      newSet.delete(item);
      return newSet;
    });
  }

  startObserving(element: HTMLElement) {
    if (this._observer) {
      this._observer.disconnect();
    }

    this._observer = new MutationObserver(mutations => {
      const hasStructuralChange = mutations.some(m => m.addedNodes.length || m.removedNodes.length);
      if (hasStructuralChange) {
        this._version.update(v => v + 1);
      }
    });

    this._observer.observe(element, {childList: true, subtree: true});
  }

  stopObserving() {
    this._observer?.disconnect();
    this._observer = undefined;
  }
}
