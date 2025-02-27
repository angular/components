/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {signal, Signal, WritableSignal} from '@angular/core';

/** Represents an item in a collection, such as a listbox option, than can be navigated to. */
export interface ListNavigationItem {
  /** Whether an item is disabled. */
  disabled: Signal<boolean>;
}

/** Represents the required inputs for a collection that has navigable items. */
export interface ListNavigationInputs<T extends ListNavigationItem> {
  /** Whether focus should wrap when navigating. */
  wrap: Signal<boolean>;

  /** The items in the list. */
  items: Signal<T[]>;

  /** Whether disabled items in the list should be skipped when navigating. */
  skipDisabled: Signal<boolean>;

  /** The current index that has been navigated to. */
  activeIndex: WritableSignal<number>;

  /** Whether the list is vertically or horizontally oriented. */
  orientation: Signal<'vertical' | 'horizontal'>;

  /** The direction that text is read based on the users locale. */
  textDirection: Signal<'rtl' | 'ltr'>;
}

/** Controls navigation for a list of items. */
export class ListNavigation<T extends ListNavigationItem> {
  /** The last index that was active. */
  prevActiveIndex = signal(0);

  constructor(readonly inputs: ListNavigationInputs<T>) {
    this.prevActiveIndex.set(inputs.activeIndex());
  }

  /** Navigates to the given item. */
  goto(item: T) {
    if (this.isFocusable(item)) {
      this.prevActiveIndex.set(this.inputs.activeIndex());
      const index = this.inputs.items().indexOf(item);
      this.inputs.activeIndex.set(index);
    }
  }

  /** Navigates to the next item in the list. */
  next() {
    this.advance(1);
  }

  /** Navigates to the previous item in the list. */
  prev() {
    this.advance(-1);
  }

  /** Navigates to the first item in the list. */
  first() {
    const item = this.inputs.items().find(i => this.isFocusable(i));

    if (item) {
      this.goto(item);
    }
  }

  /** Navigates to the last item in the list. */
  last() {
    const items = this.inputs.items();
    for (let i = items.length - 1; i >= 0; i--) {
      if (this.isFocusable(items[i])) {
        this.goto(items[i]);
        return;
      }
    }
  }

  /** Returns true if the given item can be navigated to. */
  isFocusable(item: T): boolean {
    return !item.disabled() || !this.inputs.skipDisabled();
  }

  /** Advances to the next or previous focusable item in the list based on the given delta. */
  private advance(delta: 1 | -1) {
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
        this.goto(items[i]);
        return;
      }
    }
  }
}
