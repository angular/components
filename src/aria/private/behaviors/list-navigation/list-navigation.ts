/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {SignalLike} from '../signal-like/signal-like';
import {ListFocus, ListFocusInputs, ListFocusItem} from '../list-focus/list-focus';

/** Represents an item in a collection, such as a listbox option, than can be navigated to. */
export interface ListNavigationItem extends ListFocusItem {}

/** Represents the required inputs for a collection that has navigable items. */
export interface ListNavigationInputs<T extends ListNavigationItem> extends ListFocusInputs<T> {
  /** Whether focus should wrap when navigating. */
  wrap: SignalLike<boolean>;

  /** Whether the list is vertically or horizontally oriented. */
  orientation: SignalLike<'vertical' | 'horizontal'>;

  /** The direction that text is read based on the users locale. */
  textDirection: SignalLike<'rtl' | 'ltr'>;
}

/** Options for list navigation. */
export interface ListNavigationOpts<T> {
  /**
   * Whether to focus the item's element.
   * Defaults to true.
   */
  focusElement?: boolean;

  /**
   * The list of items to navigate through.
   * Defaults to the list of items from the inputs.
   */
  items?: T[];
}

/** Controls navigation for a list of items. */
export class ListNavigation<T extends ListNavigationItem> {
  constructor(readonly inputs: ListNavigationInputs<T> & {focusManager: ListFocus<T>}) {}

  /** Navigates to the given item. */
  goto(item?: T, opts?: ListNavigationOpts<T>): boolean {
    return item ? this.inputs.focusManager.focus(item, opts) : false;
  }

  /** Navigates to the next item in the list. */
  next(opts?: ListNavigationOpts<T>): boolean {
    return this._advance(1, opts);
  }

  /** Peeks the next item in the list. */
  peekNext(opts?: ListNavigationOpts<T>): T | undefined {
    return this._peek(1, opts);
  }

  /** Navigates to the previous item in the list. */
  prev(opts?: ListNavigationOpts<T>): boolean {
    return this._advance(-1, opts);
  }

  /** Peeks the previous item in the list. */
  peekPrev(opts?: ListNavigationOpts<T>): T | undefined {
    return this._peek(-1, opts);
  }

  /** Navigates to the first item in the list. */
  first(opts?: ListNavigationOpts<T>): boolean {
    const item = this.peekFirst(opts);
    return item ? this.goto(item, opts) : false;
  }

  /** Navigates to the last item in the list. */
  last(opts?: ListNavigationOpts<T>): boolean {
    const item = this.peekLast(opts);
    return item ? this.goto(item, opts) : false;
  }

  /** Gets the first focusable item from the given list of items. */
  peekFirst(opts?: ListNavigationOpts<T>): T | undefined {
    const items = opts?.items ?? this.inputs.items();
    return items.find(i => this.inputs.focusManager.isFocusable(i));
  }

  /** Gets the last focusable item from the given list of items. */
  peekLast(opts?: ListNavigationOpts<T>): T | undefined {
    const items = opts?.items ?? this.inputs.items();
    for (let i = items.length - 1; i >= 0; i--) {
      if (this.inputs.focusManager.isFocusable(items[i])) {
        return items[i];
      }
    }
    return;
  }

  /** Advances to the next or previous focusable item in the list based on the given delta. */
  private _advance(delta: 1 | -1, opts?: ListNavigationOpts<T>): boolean {
    const item = this._peek(delta, opts);
    return item ? this.goto(item, opts) : false;
  }

  /** Peeks the next or previous focusable item in the list based on the given delta. */
  private _peek(delta: 1 | -1, opts?: ListNavigationOpts<T>): T | undefined {
    const items = opts?.items ?? this.inputs.items();
    const itemCount = items.length;
    const activeItem = this.inputs.focusManager.inputs.activeItem();
    const startIndex =
      opts?.items && activeItem
        ? items.indexOf(activeItem)
        : this.inputs.focusManager.activeIndex();

    const step = (i: number) =>
      this.inputs.wrap() ? (i + delta + itemCount) % itemCount : i + delta;

    // If wrapping is enabled, this loop ultimately terminates when `i` gets back to `startIndex`
    // in the case that all options are disabled. If wrapping is disabled, the loop terminates
    // when the index goes out of bounds.
    for (let i = step(startIndex); i !== startIndex && i < itemCount && i >= 0; i = step(i)) {
      if (this.inputs.focusManager.isFocusable(items[i])) {
        return items[i];
      }
    }

    return;
  }
}
