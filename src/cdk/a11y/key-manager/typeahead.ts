/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {A, NINE, Z, ZERO} from '../../keycodes';
import {Subject, Observable} from 'rxjs';
import {debounceTime, filter, map, tap} from 'rxjs/operators';

const DEFAULT_TYPEAHEAD_DEBOUNCE_INTERVAL_MS = 200;

interface TypeaheadItem {
  getLabel?(): string;
}

interface TypeaheadConfig<T> {
  debounceInterval?: number;
  skipPredicate?: (item: T) => boolean | undefined;
}

/**
 * Selects items based on keyboard inputs. Implements the typeahead functionality of
 * `role="listbox"` or `role="tree"` and other related roles.
 */
export class Typeahead<T extends TypeaheadItem> {
  private readonly _letterKeyStream = new Subject<string>();
  private _items: readonly T[] = [];
  private _selectedItemIndex = -1;

  /** Buffer for the letters that the user has pressed */
  private _pressedLetters: string[] = [];

  private _skipPredicateFn?: (item: T) => boolean | undefined;

  private readonly _selectedItem = new Subject<T>();
  readonly selectedItem: Observable<T> = this._selectedItem;

  constructor(initialItems: readonly T[], config?: TypeaheadConfig<T>) {
    const typeAheadInterval =
      typeof config?.debounceInterval === 'number'
        ? config.debounceInterval
        : DEFAULT_TYPEAHEAD_DEBOUNCE_INTERVAL_MS;

    if (config?.skipPredicate) {
      this._skipPredicateFn = config.skipPredicate;
    }

    if (
      (typeof ngDevMode === 'undefined' || ngDevMode) &&
      initialItems.length &&
      initialItems.some(item => typeof item.getLabel !== 'function')
    ) {
      throw new Error('KeyManager items in typeahead mode must implement the `getLabel` method.');
    }

    this.setItems(initialItems);
    this._setupKeyHandler(typeAheadInterval);
  }

  destroy() {
    this._pressedLetters = [];
    this._letterKeyStream.complete();
    this._selectedItem.complete();
  }

  setCurrentSelectedItemIndex(index: number) {
    this._selectedItemIndex = index;
  }

  setItems(items: readonly T[]) {
    this._items = items;
  }

  handleKey(event: KeyboardEvent): void {
    const keyCode = event.keyCode;

    // Attempt to use the `event.key` which also maps it to the user's keyboard language,
    // otherwise fall back to resolving alphanumeric characters via the keyCode.
    if (event.key && event.key.length === 1) {
      this._letterKeyStream.next(event.key.toLocaleUpperCase());
    } else if ((keyCode >= A && keyCode <= Z) || (keyCode >= ZERO && keyCode <= NINE)) {
      this._letterKeyStream.next(String.fromCharCode(keyCode));
    }
  }

  /** Gets whether the user is currently typing into the manager using the typeahead feature. */
  isTyping(): boolean {
    return this._pressedLetters.length > 0;
  }

  /** Resets the currently stored sequence of typed letters. */
  reset(): void {
    this._pressedLetters = [];
  }

  private _setupKeyHandler(typeAheadInterval: number) {
    // Debounce the presses of non-navigational keys, collect the ones that correspond to letters
    // and convert those letters back into a string. Afterwards find the first item that starts
    // with that string and select it.
    this._letterKeyStream
      .pipe(
        tap(letter => this._pressedLetters.push(letter)),
        debounceTime(typeAheadInterval),
        filter(() => this._pressedLetters.length > 0),
        map(() => this._pressedLetters.join('').toLocaleUpperCase()),
      )
      .subscribe(inputString => {
        // Start at 1 because we want to start searching at the item immediately
        // following the current active item.
        for (let i = 1; i < this._items.length + 1; i++) {
          const index = (this._selectedItemIndex + i) % this._items.length;
          const item = this._items[index];

          if (
            !this._skipPredicateFn?.(item) &&
            item.getLabel?.().toLocaleUpperCase().trim().indexOf(inputString) === 0
          ) {
            this._selectedItem.next(item);
            break;
          }
        }

        this._pressedLetters = [];
      });
  }
}
