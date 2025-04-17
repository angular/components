/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, signal} from '@angular/core';
import {SignalLike, WritableSignalLike} from '../signal-like/signal-like';

/** Represents an item in a collection, such as a listbox option, than can be navigated to. */
export interface ListNavigationItem {
  /** Whether an item is disabled. */
  disabled: SignalLike<boolean>;
}

/** Represents the required inputs for a collection that has navigable items. */
export interface ListNavigationInputs<T extends ListNavigationItem> {
  /** Whether focus should wrap when navigating. */
  wrap: SignalLike<boolean>;

  /** The items in the list. */
  items: SignalLike<T[]>;

  /** Whether disabled items in the list should be skipped when navigating. */
  skipDisabled: SignalLike<boolean>;

  /** The current index that has been navigated to. */
  activeIndex: WritableSignalLike<number>;

  /** Whether the list is vertically or horizontally oriented. */
  orientation: SignalLike<'vertical' | 'horizontal'>;

  /** The direction that text is read based on the users locale. */
  textDirection: SignalLike<'rtl' | 'ltr'>;
}

/** Controls navigation for a list of items. */
export class ListNavigation<T extends ListNavigationItem> {
  /** The last index that was active. */
  prevActiveIndex = signal(0);

  /** The current active item. */
  activeItem = computed(() => this.inputs.items()[this.inputs.activeIndex()]);

  constructor(readonly inputs: ListNavigationInputs<T>) {}

  /** Navigates to the given item. */
  goto(item?: T): boolean {
    if (item && this.isFocusable(item)) {
      this.prevActiveIndex.set(this.inputs.activeIndex());
      const index = this.inputs.items().indexOf(item);
      this.inputs.activeIndex.set(index);
      return true;
    }
    return false;
  }

  /** Navigates to the next item in the list. */
  next(): boolean {
    return this._advance(1);
  }

  /** Navigates to the previous item in the list. */
  prev(): boolean {
    return this._advance(-1);
  }

  /** Navigates to the first item in the list. */
  first(): boolean {
    const item = this.inputs.items().find(i => this.isFocusable(i));
    return item ? this.goto(item) : false;
  }

  /** Navigates to the last item in the list. */
  last(): boolean {
    const items = this.inputs.items();
    for (let i = items.length - 1; i >= 0; i--) {
      if (this.isFocusable(items[i])) {
        return this.goto(items[i]);
      }
    }
    return false;
  }

  /** Returns true if the given item can be navigated to. */
  isFocusable(item: T): boolean {
    return !item.disabled() || !this.inputs.skipDisabled();
  }

  /** Advances to the next or previous focusable item in the list based on the given delta. */
  private _advance(delta: 1 | -1): boolean {
    const items = this.inputs.items();
    const itemCount = items.length;
    const startIndex = this.inputs.activeIndex();
    const step = (i: number) =>
      this.inputs.wrap() ? (i + delta + itemCount) % itemCount : i + delta;

    // If wrapping is enabled, this loop ultimately terminates when `i` gets back to `startIndex`
    // in the case that all options are disabled. If wrapping is disabled, the loop terminates
    // when the index goes out of bounds.
    for (let i = step(startIndex); i !== startIndex && i < itemCount && i >= 0; i = step(i)) {
      if (this.isFocusable(items[i])) {
        return this.goto(items[i]);
      }
    }

    return false;
  }
}
