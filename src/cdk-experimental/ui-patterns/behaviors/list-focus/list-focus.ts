/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, signal} from '@angular/core';
import {SignalLike, WritableSignalLike} from '../signal-like/signal-like';

/** Represents an item in a collection, such as a listbox option, than may receive focus. */
export interface ListFocusItem {
  /** A unique identifier for the item. */
  id: SignalLike<string>;

  /** The html element that should receive focus. */
  element: SignalLike<HTMLElement>;

  /** Whether an item is disabled. */
  disabled: SignalLike<boolean>;
}

/** Represents the required inputs for a collection that contains focusable items. */
export interface ListFocusInputs<T extends ListFocusItem> {
  /** The focus strategy used by the list. */
  focusMode: SignalLike<'roving' | 'activedescendant'>;

  /** Whether the list is disabled. */
  disabled: SignalLike<boolean>;

  /** The items in the list. */
  items: SignalLike<T[]>;

  /** The index of the current active item. */
  activeIndex: WritableSignalLike<number>;

  /** Whether disabled items in the list should be skipped when navigating. */
  skipDisabled: SignalLike<boolean>;
}

/** Controls focus for a list of items. */
export class ListFocus<T extends ListFocusItem> {
  /** The last index that was active. */
  prevActiveIndex = signal(0);

  /** The current active item. */
  activeItem = computed(() => this.inputs.items()[this.inputs.activeIndex()]);

  constructor(readonly inputs: ListFocusInputs<T>) {}

  /** Whether the list is in a disabled state. */
  isListDisabled(): boolean {
    return this.inputs.disabled() || this.inputs.items().every(i => i.disabled());
  }

  /** The id of the current active item. */
  getActiveDescendant(): string | undefined {
    if (this.isListDisabled()) {
      return undefined;
    }
    if (this.inputs.focusMode() === 'roving') {
      return undefined;
    }
    return this.inputs.items()[this.inputs.activeIndex()].id();
  }

  /** The tabindex for the list. */
  getListTabindex(): -1 | 0 {
    if (this.isListDisabled()) {
      return 0;
    }
    return this.inputs.focusMode() === 'activedescendant' ? 0 : -1;
  }

  /** Returns the tabindex for the given item. */
  getItemTabindex(item: T): -1 | 0 {
    if (this.inputs.disabled()) {
      return -1;
    }
    if (this.inputs.focusMode() === 'activedescendant') {
      return -1;
    }
    const index = this.inputs.items().indexOf(item);
    return this.inputs.activeIndex() === index ? 0 : -1;
  }

  /** Focuses the current active item. */
  focus(item: T): boolean {
    if (this.isListDisabled() || !this.isFocusable(item)) {
      return false;
    }

    this.prevActiveIndex.set(this.inputs.activeIndex());
    const index = this.inputs.items().indexOf(item);
    this.inputs.activeIndex.set(index);

    if (this.inputs.focusMode() === 'roving') {
      item.element().focus();
    }

    return true;
  }

  /** Returns true if the given item can be navigated to. */
  isFocusable(item: T): boolean {
    return !item.disabled() || !this.inputs.skipDisabled();
  }
}
