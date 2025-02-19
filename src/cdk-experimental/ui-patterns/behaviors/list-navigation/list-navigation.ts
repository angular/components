/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {signal, Signal, WritableSignal} from '@angular/core';

/** The required properties for navigation items. */
export interface ListNavigationItem {
  /** Whether an item is disabled. */
  disabled: Signal<boolean>;
}

/** The required inputs for list navigation. */
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
  directionality: Signal<'rtl' | 'ltr'>;
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
    const items = this.inputs.items();
    const after = items.slice(this.inputs.activeIndex() + 1);
    const before = items.slice(0, this.inputs.activeIndex());
    const array = this.inputs.wrap() ? after.concat(before) : after;
    const item = array.find(i => this.isFocusable(i));

    if (item) {
      this.goto(item);
    }
  }

  /** Navigates to the previous item in the list. */
  prev() {
    const items = this.inputs.items();
    const after = items.slice(this.inputs.activeIndex() + 1).reverse();
    const before = items.slice(0, this.inputs.activeIndex()).reverse();
    const array = this.inputs.wrap() ? before.concat(after) : before;
    const item = array.find(i => this.isFocusable(i));

    if (item) {
      this.goto(item);
    }
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
    const item = [...this.inputs.items()].reverse().find(i => this.isFocusable(i));

    if (item) {
      this.goto(item);
    }
  }

  /** Returns true if the given item can be navigated to. */
  isFocusable(item: T): boolean {
    return !item.disabled() || !this.inputs.skipDisabled();
  }
}
