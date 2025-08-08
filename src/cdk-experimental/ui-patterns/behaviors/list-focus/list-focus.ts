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

  /** The index of the item in the list. */
  index: SignalLike<number>;
}

/** Represents the required inputs for a collection that contains focusable items. */
export interface ListFocusInputs<T extends ListFocusItem> {
  /** The focus strategy used by the list. */
  focusMode: SignalLike<'roving' | 'activedescendant'>;

  /** Whether the list is disabled. */
  disabled: SignalLike<boolean>;

  /** The items in the list. */
  items: SignalLike<T[]>;

  /** The active item. */
  activeItem: WritableSignalLike<T | undefined>;

  /** Whether disabled items in the list should be skipped when navigating. */
  skipDisabled: SignalLike<boolean>;
}

/** Controls focus for a list of items. */
export class ListFocus<T extends ListFocusItem> {
  /** The last item that was active. */
  prevActiveItem = signal<T | undefined>(undefined);

  /** The index of the last item that was active. */
  prevActiveIndex = computed(() => {
    return this.prevActiveItem() ? this.inputs.items().indexOf(this.prevActiveItem()!) : -1;
  });

  /** The current active index in the list. */
  activeIndex = computed(() => {
    return this.inputs.activeItem() ? this.inputs.items().indexOf(this.inputs.activeItem()!) : -1;
  });

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
    return this.inputs.activeItem()?.id() ?? undefined;
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
    if (this.isListDisabled()) {
      return -1;
    }
    if (this.inputs.focusMode() === 'activedescendant') {
      return -1;
    }
    return this.inputs.activeItem() === item ? 0 : -1;
  }

  /** Moves focus to the given item if it is focusable. */
  focus(item: T): boolean {
    if (this.isListDisabled() || !this.isFocusable(item)) {
      return false;
    }

    this.prevActiveItem.set(this.inputs.activeItem());
    this.inputs.activeItem.set(item);

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
