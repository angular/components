/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ListNavigationItem, ListNavigation} from './list-navigation';

/** Controls navigation for a list of items. */
export class ListNavigationController<T extends ListNavigationItem> {
  constructor(readonly state: ListNavigation<T>) {}

  /** Navigates to the given item. */
  goto(item: T) {
    if (this.isFocusable(item)) {
      this.state.prevActiveIndex.set(this.state.inputs.activeIndex());
      const index = this.state.inputs.items().indexOf(item);
      this.state.inputs.activeIndex.set(index);
    }
  }

  /** Navigates to the next item in the list. */
  next() {
    const items = this.state.inputs.items();
    const after = items.slice(this.state.inputs.activeIndex() + 1);
    const before = items.slice(0, this.state.inputs.activeIndex());
    const array = this.state.inputs.wrap() ? after.concat(before) : after;
    const item = array.find(i => this.isFocusable(i));

    if (item) {
      this.goto(item);
    }
  }

  /** Navigates to the previous item in the list. */
  prev() {
    const items = this.state.inputs.items();
    const after = items.slice(this.state.inputs.activeIndex() + 1).reverse();
    const before = items.slice(0, this.state.inputs.activeIndex()).reverse();
    const array = this.state.inputs.wrap() ? before.concat(after) : before;
    const item = array.find(i => this.isFocusable(i));

    if (item) {
      this.goto(item);
    }
  }

  /** Navigates to the first item in the list. */
  first() {
    const item = this.state.inputs.items().find(i => this.isFocusable(i));

    if (item) {
      this.goto(item);
    }
  }

  /** Navigates to the last item in the list. */
  last() {
    const item = [...this.state.inputs.items()].reverse().find(i => this.isFocusable(i));

    if (item) {
      this.goto(item);
    }
  }

  /** Returns true if the given item can be navigated to. */
  isFocusable(item: T): boolean {
    return !item.disabled() || !this.state.inputs.skipDisabled();
  }
}
