/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {SignalLike} from '../signal-like/signal-like';
import {ListFocus, ListFocusItem} from '../list-focus/list-focus';

/** Represents an item in a collection, such as a listbox option, than can be navigated to. */
export interface ListNavigationItem extends ListFocusItem {}

/** Represents the required inputs for a collection that has navigable items. */
export interface ListNavigationInputs {
  /** Whether focus should wrap when navigating. */
  wrap: SignalLike<boolean>;

  /** Whether the list is vertically or horizontally oriented. */
  orientation: SignalLike<'vertical' | 'horizontal'>;

  /** The direction that text is read based on the users locale. */
  textDirection: SignalLike<'rtl' | 'ltr'>;
}

/** Controls navigation for a list of items. */
export class ListNavigation<T extends ListNavigationItem> {
  constructor(readonly inputs: ListNavigationInputs & {focusManager: ListFocus<T>}) {}

  /** Navigates to the given item. */
  goto(item?: T): boolean {
    return item ? this.inputs.focusManager.focus(item) : false;
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
    const item = this.inputs.focusManager.inputs
      .items()
      .find(i => this.inputs.focusManager.isFocusable(i));
    return item ? this.goto(item) : false;
  }

  /** Navigates to the last item in the list. */
  last(): boolean {
    const items = this.inputs.focusManager.inputs.items();
    for (let i = items.length - 1; i >= 0; i--) {
      if (this.inputs.focusManager.isFocusable(items[i])) {
        return this.goto(items[i]);
      }
    }
    return false;
  }

  /** Advances to the next or previous focusable item in the list based on the given delta. */
  private _advance(delta: 1 | -1): boolean {
    const items = this.inputs.focusManager.inputs.items();
    const itemCount = items.length;
    const startIndex = this.inputs.focusManager.inputs.activeIndex();
    const step = (i: number) =>
      this.inputs.wrap() ? (i + delta + itemCount) % itemCount : i + delta;

    // If wrapping is enabled, this loop ultimately terminates when `i` gets back to `startIndex`
    // in the case that all options are disabled. If wrapping is disabled, the loop terminates
    // when the index goes out of bounds.
    for (let i = step(startIndex); i !== startIndex && i < itemCount && i >= 0; i = step(i)) {
      if (this.inputs.focusManager.isFocusable(items[i])) {
        return this.goto(items[i]);
      }
    }

    return false;
  }
}
