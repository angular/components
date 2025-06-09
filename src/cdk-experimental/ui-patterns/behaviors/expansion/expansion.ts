/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {computed} from '@angular/core';
import {SignalLike, WritableSignalLike} from '../signal-like/signal-like';

/** Represents an item that can be expanded or collapsed. */
export interface ExpansionItem {
  /** Whether the item is expandable. */
  expandable: SignalLike<boolean>;

  /** Used to uniquely identify an expansion item. */
  expansionId: SignalLike<string>;

  /** Whether the expansion is disabled. */
  disabled: SignalLike<boolean>;
}

export interface ExpansionControl extends ExpansionItem {}
/**
 * Controls a single item's expansion state and interactions,
 * delegating actual state changes to an Expansion manager.
 */
export class ExpansionControl {
  /** Whether this specific item is currently expanded. Derived from the Expansion manager. */
  readonly isExpanded = computed(() => this.inputs.expansionManager.isExpanded(this));

  /** Whether this item can be expanded. */
  readonly isExpandable = computed(() => this.inputs.expansionManager.isExpandable(this));

  constructor(readonly inputs: ExpansionItem & {expansionManager: ListExpansion}) {
    this.expansionId = inputs.expansionId;
    this.expandable = inputs.expandable;
    this.disabled = inputs.disabled;
  }

  /** Requests the Expansopn manager to open this item. */
  open() {
    this.inputs.expansionManager.open(this);
  }

  /** Requests the Expansion manager to close this item. */
  close() {
    this.inputs.expansionManager.close(this);
  }

  /** Requests the Expansion manager to toggle this item. */
  toggle() {
    this.inputs.expansionManager.toggle(this);
  }
}

/** Represents the required inputs for an expansion behavior. */
export interface ListExpansionInputs {
  /** Whether multiple items can be expanded at once. */
  multiExpandable: SignalLike<boolean>;

  /** An array of ids of the currently expanded items. */
  expandedIds: WritableSignalLike<string[]>;

  /** An array of expansion items. */
  items: SignalLike<ExpansionItem[]>;

  /** Whether all expansions are disabled. */
  disabled: SignalLike<boolean>;
}

/** Manages the expansion state of a list of items. */
export class ListExpansion {
  /** A signal holding an array of ids of the currently expanded items. */
  expandedIds: WritableSignalLike<string[]>;

  constructor(readonly inputs: ListExpansionInputs) {
    this.expandedIds = inputs.expandedIds;
  }

  /** Opens the specified item. */
  open(item: ExpansionItem) {
    if (!this.isExpandable(item)) return;
    if (this.isExpanded(item)) return;
    if (!this.inputs.multiExpandable()) {
      this.closeAll();
    }
    this.expandedIds.update(ids => ids.concat(item.expansionId()));
  }

  /** Closes the specified item. */
  close(item: ExpansionItem) {
    if (this.isExpandable(item)) {
      this.expandedIds.update(ids => ids.filter(id => id !== item.expansionId()));
    }
  }

  /** Toggles the expansion state of the specified item. */
  toggle(item: ExpansionItem) {
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
  isExpandable(item: ExpansionItem) {
    return !this.inputs.disabled() && !item.disabled() && item.expandable();
  }

  /** Checks whether the specified item is currently expanded. */
  isExpanded(item: ExpansionItem): boolean {
    return this.expandedIds().includes(item.expansionId());
  }
}
