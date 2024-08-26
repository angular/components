/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {QueryList} from '@angular/core';
import {Observable, Subject} from 'rxjs';

/** Represents an item within a tree that can be passed to a TreeKeyManager. */
export interface TreeKeyManagerItem {
  /** Whether the item is disabled. */
  isDisabled?: (() => boolean) | boolean;

  /** The user-facing label for this item. */
  getLabel?(): string;

  /** Perform the main action (i.e. selection) for this item. */
  activate(): void;

  /** Retrieves the parent for this item. This is `null` if there is no parent. */
  getParent(): TreeKeyManagerItem | null;

  /** Retrieves the children for this item. */
  getChildren(): TreeKeyManagerItem[] | Observable<TreeKeyManagerItem[]>;

  /** Determines if the item is currently expanded. */
  isExpanded: (() => boolean) | boolean;

  /** Collapses the item, hiding its children. */
  collapse(): void;

  /** Expands the item, showing its children. */
  expand(): void;

  /**
   * Focuses the item. This should provide some indication to the user that this item is focused.
   */
  focus(): void;

  /**
   * Unfocus the item. This should remove the focus state.
   */
  unfocus(): void;

  /**
   * Sets the item to be focusable without actually focusing it.
   */
  makeFocusable?(): void;
}

/**
 * Configuration for the TreeKeyManager.
 */
export interface TreeKeyManagerOptions<T extends TreeKeyManagerItem> {
  /**
   * If true, then the key manager will call `activate` in addition to calling `focus` when a
   * particular item is focused.
   */
  shouldActivationFollowFocus?: boolean;

  /**
   * The direction in which the tree items are laid out horizontally. This influences which key
   * will be interpreted as expand or collapse.
   */
  horizontalOrientation?: 'rtl' | 'ltr';

  /**
   * If provided, navigation "skips" over items that pass the given predicate.
   *
   * If the item is to be skipped, predicate function should return false.
   */
  skipPredicate?: (item: T) => boolean;

  /**
   * If provided, determines how the key manager determines if two items are equivalent.
   *
   * It should provide a unique key for each unique tree item. If two tree items are equivalent,
   * then this function should return the same value.
   */
  trackBy?: (treeItem: T) => unknown;

  /**
   * If a value is provided, enables typeahead mode, which allows users to set the active item
   * by typing the visible label of the item.
   *
   * If a number is provided, this will be the time to wait after the last keystroke before
   * setting the active item. If `true` is provided, the default interval of 200ms will be used.
   */
  typeAheadDebounceInterval?: true | number;
}

export interface TreeKeyManagerStrategy<T extends TreeKeyManagerItem> {
  /** Stream that emits any time the focused item changes. */
  readonly change: Subject<T | null>;

  /**
   * Cleans up the key manager.
   */
  destroy(): void;

  /**
   * Handles a keyboard event on the tree.
   *
   * @param event Keyboard event that represents the user interaction with the tree.
   */
  onKeydown(event: KeyboardEvent): void;

  /** Index of the currently active item. */
  getActiveItemIndex(): number | null;

  /** The currently active item. */
  getActiveItem(): T | null;

  /**
   * Focus the provided item by index.
   *
   * Updates the state of the currently active item. Emits to `change` stream if active item
   * Changes.
   * @param index The index of the item to focus.
   * @param options Additional focusing options.
   */
  focusItem(index: number, options?: {emitChangeEvent?: boolean}): void;
  /**
   * Focus the provided item.
   *
   * Updates the state of the currently active item. Emits to `change` stream if active item
   * Changes.
   * @param item The item to focus. Equality is determined via the trackBy function.
   * @param options Additional focusing options.
   */
  focusItem(item: T, options?: {emitChangeEvent?: boolean}): void;
  focusItem(itemOrIndex: number | T, options?: {emitChangeEvent?: boolean}): void;
}

export type TreeKeyManagerFactory<T extends TreeKeyManagerItem> = (
  items: Observable<T[]> | QueryList<T> | T[],
  options: TreeKeyManagerOptions<T>,
) => TreeKeyManagerStrategy<T>;
