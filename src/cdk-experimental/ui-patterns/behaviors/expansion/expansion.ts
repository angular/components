/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {computed, signal} from '@angular/core';
import {SignalLike, WritableSignalLike} from '../signal-like/signal-like';
import {ListFocus, ListFocusInputs, ListFocusItem} from '../list-focus/list-focus';

/** Represents an item that can be expanded or collapsed. */
export interface ExpansionItem extends ListFocusItem {
  /** Whether the item is expandable. */
  expandable: SignalLike<boolean>;

  /** Used to uniquely identify an expansion item. */
  expansionId: SignalLike<string>;
}

/** Represents the required inputs for an expansion behavior. */
export interface ExpansionInputs<T extends ExpansionItem> extends ListFocusInputs<T> {
  /** Whether multiple items can be expanded at once. */
  multiExpandable: SignalLike<boolean>;
}

/** Manages the expansion state of a list of items. */
export class Expansion<T extends ExpansionItem> {
  /** A signal holding an array of ids of the currently expanded items. */
  expandedIds: WritableSignalLike<string[]> = signal([]);

  /** The currently active (focused) item in the list. */
  activeItem = computed(() => this.inputs.focusManager.activeItem());

  constructor(readonly inputs: ExpansionInputs<T> & {focusManager: ListFocus<T>}) {}

  /** Opens the specified item, or the currently active item if none is specified. */
  open(item: T = this.activeItem()) {
    if (this.isExpandable(item)) {
      this.inputs.multiExpandable()
        ? this.expandedIds.update(ids => ids.concat(item.expansionId()))
        : this.expandedIds.set([item.expansionId()]);
    }
  }

  /** Closes the specified item, or the currently active item if none is specified. */
  close(item: T = this.activeItem()) {
    if (this.isExpandable(item)) {
      this.expandedIds.update(ids => ids.filter(id => id !== item.expansionId()));
    }
  }

  /**
   * Toggles the expansion state of the specified item,
   * or the currently active item if none is specified.
   */
  toggle(item: T = this.activeItem()) {
    this.expandedIds().includes(item.expansionId()) ? this.close(item) : this.open(item);
  }

  /** Opens all focusable items in the list. */
  openAll() {
    if (this.inputs.multiExpandable()) {
      for (const item of this.inputs.items()) {
        this.open(item);
      }
    }
  }

  /** Closes all focusable items in the list. */
  closeAll() {
    for (const item of this.inputs.items()) {
      this.close(item);
    }
  }

  /** Checks whether the specified item is expandable / collapsible. */
  isExpandable(item: T) {
    return this.inputs.focusManager.isFocusable(item) && item.expandable();
  }

  /** Checks whether the specified item is currently expanded. */
  isExpanded(item: T): boolean {
    return this.expandedIds().includes(item.expansionId());
  }
}
