/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {QueryList} from '@angular/core';
import {isObservable, Observable, Subject} from 'rxjs';

// TODO(cassc): Temporarily disable tslint since this is just the raw API.
// tslint:disable

/** Represents an item within a tree that can be passed to a TreeKeyManager. */
export interface TreeKeyManagerItem {
  /** Whether the item is disabled. */
  isDisabled?(): boolean;

  /** The user-facing label for this item. */
  getLabel?(): string;

  /** Perform the main action (i.e. selection) for this item. */
  activate(): void;

  /** Retrieves the parent for this item. This is `null` if there is no parent. */
  getParent(): this | null;

  /** Retrieves the children for this item. */
  getChildren(): this[] | Observable<this[]>;

  /** Determines if the item is currently expanded. */
  isExpanded(): boolean;

  /** Collapses the item, hiding its children. */
  collapse(): void;

  /** Expands the item, showing its children. */
  expand(): void;

  /**
   * Focuses the item. This should provide some indication to the user that this item is focused.
   */
  focus(): void;
}

export interface TreeKeyManagerOptions<T extends TreeKeyManagerItem> {
  items: Observable<T[]> | QueryList<T> | T[];

  /**
   * Sets the predicate function that determines which items should be skipped by the tree key
   * manager. By default, disabled items are skipped.
   *
   * If the item is to be skipped, this function should return false.
   */
  skipPredicate?: (item: T) => boolean;

  /**
   * If true, then the key manager will call `activate` in addition to calling `focus` when a
   * particular item is focused. By default, this is false.
   */
  activationFollowsFocus?: boolean;

  /**
   * The direction in which the tree items are laid out horizontally. This influences which key
   * will be interpreted as expand or collapse. Defaults to 'ltr'.
   */
  horizontalOrientation?: 'rtl' | 'ltr';

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

/**
 * This class manages keyboard events for trees. If you pass it a QueryList or other list of tree
 * items, it will set the active item, focus, handle expansion and typeahead correctly when
 * keyboard events occur.
 */
export class TreeKeyManager<T extends TreeKeyManagerItem> {
  private _activeItemIndex = -1;
  private _activeItem: T | null = null;

  constructor({items}: TreeKeyManagerOptions<T>) {
    // We allow for the items to be an array or Observable because, in some cases, the consumer may
    // not have access to a QueryList of the items they want to manage (e.g. when the
    // items aren't being collected via `ViewChildren` or `ContentChildren`).
    if (items instanceof QueryList) {
      items.changes.subscribe((newItems: QueryList<T>) => {
        this._updateActiveItemIndex(newItems.toArray());
      });
    } else if (isObservable(items)) {
      items.subscribe(newItems => {
        this._updateActiveItemIndex(newItems);
      });
    }
  }

  /**
   * Stream that emits any time the TAB key is pressed, so components can react
   * when focus is shifted off of the list.
   */
  readonly tabOut = new Subject<void>();

  /**
   * Handles a keyboard event on the tree.
   * @param event Keyboard event that represents the user interaction with the tree.
   */
  onKeydown(event: KeyboardEvent) {}

  /**
   * Handles a mouse click on a particular tree item.
   * @param treeItem The item that was clicked by the user.
   */
  onClick(treeItem: T) {}

  /** Index of the currently active item. */
  getActiveItemIndex(): number | null {
    return this._activeItemIndex;
  }

  /** The currently active item. */
  getActiveItem(): T | null {
    return this._activeItem;
  }

  private _updateActiveItemIndex(newItems: T[]) {
    if (this._activeItem) {
      const newIndex = newItems.indexOf(this._activeItem);

      if (newIndex > -1 && newIndex !== this._activeItemIndex) {
        this._activeItemIndex = newIndex;
      }
    }
  }
}

// tslint:enable
