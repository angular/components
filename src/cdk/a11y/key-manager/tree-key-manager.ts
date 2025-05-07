/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken, QueryList} from '@angular/core';
import {Observable, Subject, Subscription, isObservable, of as observableOf} from 'rxjs';
import {take} from 'rxjs/operators';
import {coerceObservable} from '../../coercion/private';
import {
  TreeKeyManagerFactory,
  TreeKeyManagerItem,
  TreeKeyManagerOptions,
  TreeKeyManagerStrategy,
} from './tree-key-manager-strategy';
import {Typeahead} from './typeahead';

/**
 * This class manages keyboard events for trees. If you pass it a QueryList or other list of tree
 * items, it will set the active item, focus, handle expansion and typeahead correctly when
 * keyboard events occur.
 */
export class TreeKeyManager<T extends TreeKeyManagerItem> implements TreeKeyManagerStrategy<T> {
  /** The index of the currently active (focused) item. */
  private _activeItemIndex = -1;
  /** The currently active (focused) item. */
  private _activeItem: T | null = null;
  /** Whether or not we activate the item when it's focused. */
  private _shouldActivationFollowFocus = false;
  /**
   * The orientation that the tree is laid out in. In `rtl` mode, the behavior of Left and
   * Right arrow are switched.
   */
  private _horizontalOrientation: 'ltr' | 'rtl' = 'ltr';

  /**
   * Predicate function that can be used to check whether an item should be skipped
   * by the key manager.
   *
   * The default value for this doesn't skip any elements in order to keep tree items focusable
   * when disabled. This aligns with ARIA guidelines:
   * https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#focusabilityofdisabledcontrols.
   */
  private _skipPredicateFn = (_item: T) => false;

  /** Function to determine equivalent items. */
  private _trackByFn: (item: T) => unknown = (item: T) => item;

  /** Synchronous cache of the items to manage. */
  private _items: T[] = [];

  private _typeahead?: Typeahead<T>;
  private _typeaheadSubscription = Subscription.EMPTY;

  private _hasInitialFocused = false;

  private _initializeFocus(): void {
    if (this._hasInitialFocused || this._items.length === 0) {
      return;
    }

    let activeIndex = 0;
    for (let i = 0; i < this._items.length; i++) {
      if (!this._skipPredicateFn(this._items[i]) && !this._isItemDisabled(this._items[i])) {
        activeIndex = i;
        break;
      }
    }

    const activeItem = this._items[activeIndex];

    // Use `makeFocusable` here, because we want the item to just be focusable, not actually
    // capture the focus since the user isn't interacting with it. See #29628.
    if (activeItem.makeFocusable) {
      this._activeItem?.unfocus();
      this._activeItemIndex = activeIndex;
      this._activeItem = activeItem;
      this._typeahead?.setCurrentSelectedItemIndex(activeIndex);
      activeItem.makeFocusable();
    } else {
      // Backwards compatibility for items that don't implement `makeFocusable`.
      this.focusItem(activeIndex);
    }

    this._hasInitialFocused = true;
  }

  /**
   *
   * @param items List of TreeKeyManager options. Can be synchronous or asynchronous.
   * @param config Optional configuration options. By default, use 'ltr' horizontal orientation. By
   * default, do not skip any nodes. By default, key manager only calls `focus` method when items
   * are focused and does not call `activate`. If `typeaheadDefaultInterval` is `true`, use a
   * default interval of 200ms.
   */
  constructor(items: Observable<T[]> | QueryList<T> | T[], config: TreeKeyManagerOptions<T>) {
    // We allow for the items to be an array or Observable because, in some cases, the consumer may
    // not have access to a QueryList of the items they want to manage (e.g. when the
    // items aren't being collected via `ViewChildren` or `ContentChildren`).
    if (items instanceof QueryList) {
      this._items = items.toArray();
      items.changes.subscribe((newItems: QueryList<T>) => {
        this._items = newItems.toArray();
        this._typeahead?.setItems(this._items);
        this._updateActiveItemIndex(this._items);
        this._initializeFocus();
      });
    } else if (isObservable(items)) {
      items.subscribe(newItems => {
        this._items = newItems;
        this._typeahead?.setItems(newItems);
        this._updateActiveItemIndex(newItems);
        this._initializeFocus();
      });
    } else {
      this._items = items;
      this._initializeFocus();
    }

    if (typeof config.shouldActivationFollowFocus === 'boolean') {
      this._shouldActivationFollowFocus = config.shouldActivationFollowFocus;
    }
    if (config.horizontalOrientation) {
      this._horizontalOrientation = config.horizontalOrientation;
    }
    if (config.skipPredicate) {
      this._skipPredicateFn = config.skipPredicate;
    }
    if (config.trackBy) {
      this._trackByFn = config.trackBy;
    }
    if (typeof config.typeAheadDebounceInterval !== 'undefined') {
      this._setTypeAhead(config.typeAheadDebounceInterval);
    }
  }

  /** Stream that emits any time the focused item changes. */
  readonly change = new Subject<T | null>();

  /** Cleans up the key manager. */
  destroy() {
    this._typeaheadSubscription.unsubscribe();
    this._typeahead?.destroy();
    this.change.complete();
  }

  /**
   * Handles a keyboard event on the tree.
   * @param event Keyboard event that represents the user interaction with the tree.
   */
  onKeydown(event: KeyboardEvent) {
    const key = event.key;

    switch (key) {
      case 'Tab':
        // Return early here, in order to allow Tab to actually tab out of the tree
        return;

      case 'ArrowDown':
        this._focusNextItem();
        break;

      case 'ArrowUp':
        this._focusPreviousItem();
        break;

      case 'ArrowRight':
        this._horizontalOrientation === 'rtl'
          ? this._collapseCurrentItem()
          : this._expandCurrentItem();
        break;

      case 'ArrowLeft':
        this._horizontalOrientation === 'rtl'
          ? this._expandCurrentItem()
          : this._collapseCurrentItem();
        break;

      case 'Home':
        this._focusFirstItem();
        break;

      case 'End':
        this._focusLastItem();
        break;

      case 'Enter':
      case ' ':
        this._activateCurrentItem();
        break;

      default:
        if (event.key === '*') {
          this._expandAllItemsAtCurrentItemLevel();
          break;
        }

        this._typeahead?.handleKey(event);
        // Return here, in order to avoid preventing the default action of non-navigational
        // keys or resetting the buffer of pressed letters.
        return;
    }

    // Reset the typeahead since the user has used a navigational key.
    this._typeahead?.reset();
    event.preventDefault();
  }

  /** Index of the currently active item. */
  getActiveItemIndex(): number | null {
    return this._activeItemIndex;
  }

  /** The currently active item. */
  getActiveItem(): T | null {
    return this._activeItem;
  }

  /** Focus the first available item. */
  private _focusFirstItem(): void {
    this.focusItem(this._findNextAvailableItemIndex(-1));
  }

  /** Focus the last available item. */
  private _focusLastItem(): void {
    this.focusItem(this._findPreviousAvailableItemIndex(this._items.length));
  }

  /** Focus the next available item. */
  private _focusNextItem(): void {
    this.focusItem(this._findNextAvailableItemIndex(this._activeItemIndex));
  }

  /** Focus the previous available item. */
  private _focusPreviousItem(): void {
    this.focusItem(this._findPreviousAvailableItemIndex(this._activeItemIndex));
  }

  /**
   * Focus the provided item by index.
   * @param index The index of the item to focus.
   * @param options Additional focusing options.
   */
  focusItem(index: number, options?: {emitChangeEvent?: boolean}): void;
  focusItem(item: T, options?: {emitChangeEvent?: boolean}): void;
  focusItem(itemOrIndex: number | T, options?: {emitChangeEvent?: boolean}): void;
  focusItem(itemOrIndex: number | T, options: {emitChangeEvent?: boolean} = {}) {
    // Set default options
    options.emitChangeEvent ??= true;

    let index =
      typeof itemOrIndex === 'number'
        ? itemOrIndex
        : this._items.findIndex(item => this._trackByFn(item) === this._trackByFn(itemOrIndex));
    if (index < 0 || index >= this._items.length) {
      return;
    }
    const activeItem = this._items[index];

    // If we're just setting the same item, don't re-call activate or focus
    if (
      this._activeItem !== null &&
      this._trackByFn(activeItem) === this._trackByFn(this._activeItem)
    ) {
      return;
    }

    const previousActiveItem = this._activeItem;
    this._activeItem = activeItem ?? null;
    this._activeItemIndex = index;
    this._typeahead?.setCurrentSelectedItemIndex(index);

    this._activeItem?.focus();
    previousActiveItem?.unfocus();

    if (options.emitChangeEvent) {
      this.change.next(this._activeItem);
    }

    if (this._shouldActivationFollowFocus) {
      this._activateCurrentItem();
    }
  }

  private _updateActiveItemIndex(newItems: T[]) {
    const activeItem = this._activeItem;
    if (!activeItem) {
      return;
    }

    const newIndex = newItems.findIndex(
      item => this._trackByFn(item) === this._trackByFn(activeItem),
    );

    if (newIndex > -1 && newIndex !== this._activeItemIndex) {
      this._activeItemIndex = newIndex;
      this._typeahead?.setCurrentSelectedItemIndex(newIndex);
    }
  }

  private _setTypeAhead(debounceInterval: number | boolean) {
    this._typeahead = new Typeahead(this._items, {
      debounceInterval: typeof debounceInterval === 'number' ? debounceInterval : undefined,
      skipPredicate: item => this._skipPredicateFn(item),
    });

    this._typeaheadSubscription = this._typeahead.selectedItem.subscribe(item => {
      this.focusItem(item);
    });
  }

  private _findNextAvailableItemIndex(startingIndex: number) {
    for (let i = startingIndex + 1; i < this._items.length; i++) {
      if (!this._skipPredicateFn(this._items[i])) {
        return i;
      }
    }
    return startingIndex;
  }

  private _findPreviousAvailableItemIndex(startingIndex: number) {
    for (let i = startingIndex - 1; i >= 0; i--) {
      if (!this._skipPredicateFn(this._items[i])) {
        return i;
      }
    }
    return startingIndex;
  }

  /**
   * If the item is already expanded, we collapse the item. Otherwise, we will focus the parent.
   */
  private _collapseCurrentItem() {
    if (!this._activeItem) {
      return;
    }

    if (this._isCurrentItemExpanded()) {
      this._activeItem.collapse();
    } else {
      const parent = this._activeItem.getParent();
      if (!parent || this._skipPredicateFn(parent as T)) {
        return;
      }
      this.focusItem(parent as T);
    }
  }

  /**
   * If the item is already collapsed, we expand the item. Otherwise, we will focus the first child.
   */
  private _expandCurrentItem() {
    if (!this._activeItem) {
      return;
    }

    if (!this._isCurrentItemExpanded()) {
      this._activeItem.expand();
    } else {
      coerceObservable(this._activeItem.getChildren())
        .pipe(take(1))
        .subscribe(children => {
          const firstChild = children.find(child => !this._skipPredicateFn(child as T));
          if (!firstChild) {
            return;
          }
          this.focusItem(firstChild as T);
        });
    }
  }

  private _isCurrentItemExpanded() {
    if (!this._activeItem) {
      return false;
    }
    return typeof this._activeItem.isExpanded === 'boolean'
      ? this._activeItem.isExpanded
      : this._activeItem.isExpanded();
  }

  private _isItemDisabled(item: TreeKeyManagerItem) {
    return typeof item.isDisabled === 'boolean' ? item.isDisabled : item.isDisabled?.();
  }

  /** For all items that are the same level as the current item, we expand those items. */
  private _expandAllItemsAtCurrentItemLevel() {
    if (!this._activeItem) {
      return;
    }

    const parent = this._activeItem.getParent();
    let itemsToExpand;
    if (!parent) {
      itemsToExpand = observableOf(this._items.filter(item => item.getParent() === null));
    } else {
      itemsToExpand = coerceObservable(parent.getChildren());
    }

    itemsToExpand.pipe(take(1)).subscribe(items => {
      for (const item of items) {
        item.expand();
      }
    });
  }

  private _activateCurrentItem() {
    this._activeItem?.activate();
  }
}

/**
 * @nodoc
 * @deprecated No longer used, will be removed.
 * @breaking-change 21.0.0
 */
export function TREE_KEY_MANAGER_FACTORY<T extends TreeKeyManagerItem>(): TreeKeyManagerFactory<T> {
  return (items, options) => new TreeKeyManager(items, options);
}

/** Injection token that determines the key manager to use. */
export const TREE_KEY_MANAGER = new InjectionToken<TreeKeyManagerFactory<any>>('tree-key-manager', {
  providedIn: 'root',
  factory: TREE_KEY_MANAGER_FACTORY,
});

/**
 * @nodoc
 * @deprecated No longer used, will be removed.
 * @breaking-change 21.0.0
 */
export const TREE_KEY_MANAGER_FACTORY_PROVIDER = {
  provide: TREE_KEY_MANAGER,
  useFactory: TREE_KEY_MANAGER_FACTORY,
};
