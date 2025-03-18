/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  DOWN_ARROW,
  END,
  HOME,
  LEFT_ARROW,
  PAGE_DOWN,
  PAGE_UP,
  RIGHT_ARROW,
  TAB,
  UP_ARROW,
  hasModifierKey,
} from '../../keycodes';
import {EffectRef, Injector, QueryList, Signal, effect, isSignal, signal} from '@angular/core';
import {Subject, Subscription} from 'rxjs';
import {Typeahead} from './typeahead';

/** This interface is for items that can be passed to a ListKeyManager. */
export interface ListKeyManagerOption {
  /** Whether the option is disabled. */
  disabled?: boolean;

  /** Gets the label for this option. */
  getLabel?(): string;
}

/** Modifier keys handled by the ListKeyManager. */
export type ListKeyManagerModifierKey = 'altKey' | 'ctrlKey' | 'metaKey' | 'shiftKey';

/**
 * This class manages keyboard events for selectable lists. If you pass it a query list
 * of items, it will set the active item correctly when arrow events occur.
 */
export class ListKeyManager<T extends ListKeyManagerOption> {
  private _activeItemIndex = -1;
  private _activeItem = signal<T | null>(null);
  private _wrap = false;
  private _typeaheadSubscription = Subscription.EMPTY;
  private _itemChangesSubscription?: Subscription;
  private _vertical = true;
  private _horizontal: 'ltr' | 'rtl' | null;
  private _allowedModifierKeys: ListKeyManagerModifierKey[] = [];
  private _homeAndEnd = false;
  private _pageUpAndDown = {enabled: false, delta: 10};
  private _effectRef: EffectRef | undefined;
  private _typeahead?: Typeahead<T>;

  /**
   * Predicate function that can be used to check whether an item should be skipped
   * by the key manager. By default, disabled items are skipped.
   */
  private _skipPredicateFn = (item: T) => item.disabled;

  constructor(items: QueryList<T> | T[] | readonly T[]);
  constructor(items: Signal<T[]> | Signal<readonly T[]>, injector: Injector);
  constructor(
    private _items: QueryList<T> | T[] | readonly T[] | Signal<T[]> | Signal<readonly T[]>,
    injector?: Injector,
  ) {
    // We allow for the items to be an array because, in some cases, the consumer may
    // not have access to a QueryList of the items they want to manage (e.g. when the
    // items aren't being collected via `ViewChildren` or `ContentChildren`).
    if (_items instanceof QueryList) {
      this._itemChangesSubscription = _items.changes.subscribe((newItems: QueryList<T>) =>
        this._itemsChanged(newItems.toArray()),
      );
    } else if (isSignal(_items)) {
      if (!injector && (typeof ngDevMode === 'undefined' || ngDevMode)) {
        throw new Error('ListKeyManager constructed with a signal must receive an injector');
      }

      this._effectRef = effect(() => this._itemsChanged(_items()), {injector});
    }
  }

  /**
   * Stream that emits any time the TAB key is pressed, so components can react
   * when focus is shifted off of the list.
   */
  readonly tabOut = new Subject<void>();

  /** Stream that emits whenever the active item of the list manager changes. */
  readonly change = new Subject<number>();

  /**
   * Sets the predicate function that determines which items should be skipped by the
   * list key manager.
   * @param predicate Function that determines whether the given item should be skipped.
   */
  skipPredicate(predicate: (item: T) => boolean): this {
    this._skipPredicateFn = predicate;
    return this;
  }

  /**
   * Configures wrapping mode, which determines whether the active item will wrap to
   * the other end of list when there are no more items in the given direction.
   * @param shouldWrap Whether the list should wrap when reaching the end.
   */
  withWrap(shouldWrap = true): this {
    this._wrap = shouldWrap;
    return this;
  }

  /**
   * Configures whether the key manager should be able to move the selection vertically.
   * @param enabled Whether vertical selection should be enabled.
   */
  withVerticalOrientation(enabled: boolean = true): this {
    this._vertical = enabled;
    return this;
  }

  /**
   * Configures the key manager to move the selection horizontally.
   * Passing in `null` will disable horizontal movement.
   * @param direction Direction in which the selection can be moved.
   */
  withHorizontalOrientation(direction: 'ltr' | 'rtl' | null): this {
    this._horizontal = direction;
    return this;
  }

  /**
   * Modifier keys which are allowed to be held down and whose default actions will be prevented
   * as the user is pressing the arrow keys. Defaults to not allowing any modifier keys.
   */
  withAllowedModifierKeys(keys: ListKeyManagerModifierKey[]): this {
    this._allowedModifierKeys = keys;
    return this;
  }

  /**
   * Turns on typeahead mode which allows users to set the active item by typing.
   * @param debounceInterval Time to wait after the last keystroke before setting the active item.
   */
  withTypeAhead(debounceInterval: number = 200): this {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      const items = this._getItemsArray();
      if (items.length > 0 && items.some(item => typeof item.getLabel !== 'function')) {
        throw Error('ListKeyManager items in typeahead mode must implement the `getLabel` method.');
      }
    }

    this._typeaheadSubscription.unsubscribe();

    const items = this._getItemsArray();
    this._typeahead = new Typeahead(items, {
      debounceInterval: typeof debounceInterval === 'number' ? debounceInterval : undefined,
      skipPredicate: item => this._skipPredicateFn(item),
    });

    this._typeaheadSubscription = this._typeahead.selectedItem.subscribe(item => {
      this.setActiveItem(item);
    });

    return this;
  }

  /** Cancels the current typeahead sequence. */
  cancelTypeahead(): this {
    this._typeahead?.reset();
    return this;
  }

  /**
   * Configures the key manager to activate the first and last items
   * respectively when the Home or End key is pressed.
   * @param enabled Whether pressing the Home or End key activates the first/last item.
   */
  withHomeAndEnd(enabled: boolean = true): this {
    this._homeAndEnd = enabled;
    return this;
  }

  /**
   * Configures the key manager to activate every 10th, configured or first/last element in up/down direction
   * respectively when the Page-Up or Page-Down key is pressed.
   * @param enabled Whether pressing the Page-Up or Page-Down key activates the first/last item.
   * @param delta Whether pressing the Home or End key activates the first/last item.
   */
  withPageUpDown(enabled: boolean = true, delta: number = 10): this {
    this._pageUpAndDown = {enabled, delta};
    return this;
  }

  /**
   * Sets the active item to the item at the index specified.
   * @param index The index of the item to be set as active.
   */
  setActiveItem(index: number): void;

  /**
   * Sets the active item to the specified item.
   * @param item The item to be set as active.
   */
  setActiveItem(item: T): void;

  setActiveItem(item: any): void {
    const previousActiveItem = this._activeItem();

    this.updateActiveItem(item);

    if (this._activeItem() !== previousActiveItem) {
      this.change.next(this._activeItemIndex);
    }
  }

  /**
   * Sets the active item depending on the key event passed in.
   * @param event Keyboard event to be used for determining which element should be active.
   */
  onKeydown(event: KeyboardEvent): void {
    const keyCode = event.keyCode;
    const modifiers: ListKeyManagerModifierKey[] = ['altKey', 'ctrlKey', 'metaKey', 'shiftKey'];
    const isModifierAllowed = modifiers.every(modifier => {
      return !event[modifier] || this._allowedModifierKeys.indexOf(modifier) > -1;
    });

    switch (keyCode) {
      case TAB:
        this.tabOut.next();
        return;

      case DOWN_ARROW:
        if (this._vertical && isModifierAllowed) {
          this.setNextItemActive();
          break;
        } else {
          return;
        }

      case UP_ARROW:
        if (this._vertical && isModifierAllowed) {
          this.setPreviousItemActive();
          break;
        } else {
          return;
        }

      case RIGHT_ARROW:
        if (this._horizontal && isModifierAllowed) {
          this._horizontal === 'rtl' ? this.setPreviousItemActive() : this.setNextItemActive();
          break;
        } else {
          return;
        }

      case LEFT_ARROW:
        if (this._horizontal && isModifierAllowed) {
          this._horizontal === 'rtl' ? this.setNextItemActive() : this.setPreviousItemActive();
          break;
        } else {
          return;
        }

      case HOME:
        if (this._homeAndEnd && isModifierAllowed) {
          this.setFirstItemActive();
          break;
        } else {
          return;
        }

      case END:
        if (this._homeAndEnd && isModifierAllowed) {
          this.setLastItemActive();
          break;
        } else {
          return;
        }

      case PAGE_UP:
        if (this._pageUpAndDown.enabled && isModifierAllowed) {
          const targetIndex = this._activeItemIndex - this._pageUpAndDown.delta;
          this._setActiveItemByIndex(targetIndex > 0 ? targetIndex : 0, 1);
          break;
        } else {
          return;
        }

      case PAGE_DOWN:
        if (this._pageUpAndDown.enabled && isModifierAllowed) {
          const targetIndex = this._activeItemIndex + this._pageUpAndDown.delta;
          const itemsLength = this._getItemsArray().length;
          this._setActiveItemByIndex(targetIndex < itemsLength ? targetIndex : itemsLength - 1, -1);
          break;
        } else {
          return;
        }

      default:
        if (isModifierAllowed || hasModifierKey(event, 'shiftKey')) {
          this._typeahead?.handleKey(event);
        }

        // Note that we return here, in order to avoid preventing
        // the default action of non-navigational keys.
        return;
    }

    this._typeahead?.reset();
    event.preventDefault();
  }

  /** Index of the currently active item. */
  get activeItemIndex(): number | null {
    return this._activeItemIndex;
  }

  /** The active item. */
  get activeItem(): T | null {
    return this._activeItem();
  }

  /** Gets whether the user is currently typing into the manager using the typeahead feature. */
  isTyping(): boolean {
    return !!this._typeahead && this._typeahead.isTyping();
  }

  /** Sets the active item to the first enabled item in the list. */
  setFirstItemActive(): void {
    this._setActiveItemByIndex(0, 1);
  }

  /** Sets the active item to the last enabled item in the list. */
  setLastItemActive(): void {
    this._setActiveItemByIndex(this._getItemsArray().length - 1, -1);
  }

  /** Sets the active item to the next enabled item in the list. */
  setNextItemActive(): void {
    this._activeItemIndex < 0 ? this.setFirstItemActive() : this._setActiveItemByDelta(1);
  }

  /** Sets the active item to a previous enabled item in the list. */
  setPreviousItemActive(): void {
    this._activeItemIndex < 0 && this._wrap
      ? this.setLastItemActive()
      : this._setActiveItemByDelta(-1);
  }

  /**
   * Allows setting the active without any other effects.
   * @param index Index of the item to be set as active.
   */
  updateActiveItem(index: number): void;

  /**
   * Allows setting the active item without any other effects.
   * @param item Item to be set as active.
   */
  updateActiveItem(item: T): void;

  updateActiveItem(item: any): void {
    const itemArray = this._getItemsArray();
    const index = typeof item === 'number' ? item : itemArray.indexOf(item);
    const activeItem = itemArray[index];

    // Explicitly check for `null` and `undefined` because other falsy values are valid.
    this._activeItem.set(activeItem == null ? null : activeItem);
    this._activeItemIndex = index;
    this._typeahead?.setCurrentSelectedItemIndex(index);
  }

  /** Cleans up the key manager. */
  destroy() {
    this._typeaheadSubscription.unsubscribe();
    this._itemChangesSubscription?.unsubscribe();
    this._effectRef?.destroy();
    this._typeahead?.destroy();
    this.tabOut.complete();
    this.change.complete();
  }

  /**
   * This method sets the active item, given a list of items and the delta between the
   * currently active item and the new active item. It will calculate differently
   * depending on whether wrap mode is turned on.
   */
  private _setActiveItemByDelta(delta: -1 | 1): void {
    this._wrap ? this._setActiveInWrapMode(delta) : this._setActiveInDefaultMode(delta);
  }

  /**
   * Sets the active item properly given "wrap" mode. In other words, it will continue to move
   * down the list until it finds an item that is not disabled, and it will wrap if it
   * encounters either end of the list.
   */
  private _setActiveInWrapMode(delta: -1 | 1): void {
    const items = this._getItemsArray();

    for (let i = 1; i <= items.length; i++) {
      const index = (this._activeItemIndex + delta * i + items.length) % items.length;
      const item = items[index];

      if (!this._skipPredicateFn(item)) {
        this.setActiveItem(index);
        return;
      }
    }
  }

  /**
   * Sets the active item properly given the default mode. In other words, it will
   * continue to move down the list until it finds an item that is not disabled. If
   * it encounters either end of the list, it will stop and not wrap.
   */
  private _setActiveInDefaultMode(delta: -1 | 1): void {
    this._setActiveItemByIndex(this._activeItemIndex + delta, delta);
  }

  /**
   * Sets the active item to the first enabled item starting at the index specified. If the
   * item is disabled, it will move in the fallbackDelta direction until it either
   * finds an enabled item or encounters the end of the list.
   */
  private _setActiveItemByIndex(index: number, fallbackDelta: -1 | 1): void {
    const items = this._getItemsArray();

    if (!items[index]) {
      return;
    }

    while (this._skipPredicateFn(items[index])) {
      index += fallbackDelta;

      if (!items[index]) {
        return;
      }
    }

    this.setActiveItem(index);
  }

  /** Returns the items as an array. */
  private _getItemsArray(): T[] | readonly T[] {
    if (isSignal(this._items)) {
      return this._items();
    }

    return this._items instanceof QueryList ? this._items.toArray() : this._items;
  }

  /** Callback for when the items have changed. */
  private _itemsChanged(newItems: T[] | readonly T[]) {
    this._typeahead?.setItems(newItems);
    const activeItem = this._activeItem();
    if (activeItem) {
      const newIndex = newItems.indexOf(activeItem);

      if (newIndex > -1 && newIndex !== this._activeItemIndex) {
        this._activeItemIndex = newIndex;
        this._typeahead?.setCurrentSelectedItemIndex(newIndex);
      }
    }
  }
}
