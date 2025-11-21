/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {SignalLike, WritableSignalLike} from '../signal-like/signal-like';

/** Represents an item that can be expanded or collapsed. */
export interface ExpansionItem {
  /** Whether the item is expandable. */
  expandable: SignalLike<boolean>;

  /** Whether the item is expanded. */
  expanded: WritableSignalLike<boolean>;

  /** Whether the expansion is disabled. */
  disabled: SignalLike<boolean>;
}

/** Represents the required inputs for an expansion behavior. */
export interface ListExpansionInputs {
  /** Whether multiple items can be expanded at once. */
  multiExpandable: SignalLike<boolean>;

  /** An array of expansion items. */
  items: SignalLike<ExpansionItem[]>;

  /** Whether all expansions are disabled. */
  disabled: SignalLike<boolean>;
}

/** Manages the expansion state of a list of items. */
export class ListExpansion {
  constructor(readonly inputs: ListExpansionInputs) {}

  /** Opens the specified item. */
  open(item: ExpansionItem): boolean {
    if (!this.isExpandable(item)) return false;
    if (item.expanded()) return false;
    if (!this.inputs.multiExpandable()) {
      this.closeAll();
    }
    item.expanded.set(true);
    return true;
  }

  /** Closes the specified item. */
  close(item: ExpansionItem): boolean {
    if (!this.isExpandable(item)) return false;

    item.expanded.set(false);
    return true;
  }

  /** Toggles the expansion state of the specified item. */
  toggle(item: ExpansionItem): boolean {
    return item.expanded() ? this.close(item) : this.open(item);
  }

  /** Opens all focusable items in the list. */
  openAll(): void {
    if (this.inputs.multiExpandable()) {
      for (const item of this.inputs.items()) {
        this.open(item);
      }
    }
  }

  /** Closes all focusable items in the list. */
  closeAll(): void {
    for (const item of this.inputs.items()) {
      this.close(item);
    }
  }

  /** Checks whether the specified item is expandable / collapsible. */
  isExpandable(item: ExpansionItem) {
    return !this.inputs.disabled() && !item.disabled() && item.expandable();
  }
}
