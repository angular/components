/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {KeyboardEventManager, PointerEventManager} from '../behaviors/event-manager';
import {computed, signal} from '@angular/core';
import {SignalLike, WritableSignalLike} from '../behaviors/signal-like/signal-like';
import {ListItem} from '../behaviors/list/list';

/** Represents the required inputs for a combobox. */
export type ComboboxInputs<T extends ListItem<V>, V> = {
  /** The current value of the combobox. */
  value: WritableSignalLike<V | undefined>;

  /** The controls for the popup associated with the combobox. */
  popupControls: SignalLike<ComboboxListboxControls<T, V> | ComboboxTreeControls<T, V> | undefined>;

  /** The HTML input element that serves as the combobox input. */
  inputEl: SignalLike<HTMLInputElement | undefined>;

  /** The HTML element that serves as the combobox container. */
  containerEl: SignalLike<HTMLElement | undefined>;

  /** The filtering mode for the combobox. */
  filterMode: SignalLike<'manual' | 'auto-select' | 'highlight'>;

  /** The function used to filter items in the combobox. */
  filter: SignalLike<(inputText: string, itemText: string) => boolean>;
};

/** An interface that allows combobox popups to expose the necessary controls for the combobox. */
export type ComboboxListboxControls<T extends ListItem<V>, V> = {
  /** The ARIA role for the popup. */
  role: SignalLike<'listbox' | 'tree' | 'grid'>;

  /** The ID of the active item in the popup. */
  activeId: SignalLike<string | undefined>;

  /** Navigates to the next item in the popup. */
  next: () => void;

  /** Navigates to the previous item in the popup. */
  prev: () => void;

  /** Navigates to the first item in the popup. */
  first: () => void;

  /** Navigates to the last item in the popup. */
  last: () => void;

  /** Selects the current item in the popup. */
  select: (item?: T) => void;

  /** Clears the selection state of the popup. */
  clearSelection: () => void;

  /** Filters the items in the popup. */
  filter: (text: string) => void;

  /** Removes focus from any item in the popup. */
  unfocus: () => void;

  /** Returns the item corresponding to the given event. */
  getItem: (e: PointerEvent) => T | undefined;

  /** Returns the currently selected item in the popup. */
  getSelectedItem: () => T | undefined;

  /** Sets the value of the combobox based on the selected item. */
  setValue: (value: V | undefined) => void; // For re-setting the value if the popup was destroyed.
};

export type ComboboxTreeControls<T extends ListItem<V>, V> = ComboboxListboxControls<T, V> & {
  /** Expands the currently active item in the popup. */
  expandItem: () => void;

  /** Collapses the currently active item in the popup. */
  collapseItem: () => void;

  /** Checks if the currently active item in the popup is expandable. */
  isItemExpandable: () => boolean;
};

/** Controls the state of a combobox. */
export class ComboboxPattern<T extends ListItem<V>, V> {
  /** Whether the combobox is expanded. */
  expanded = signal(false);

  /** The ID of the active item in the combobox. */
  activedescendant = computed(() => this.inputs.popupControls()?.activeId() ?? null);

  /** The current search string for filtering. */
  searchString = signal('');

  /** The currently highlighted item in the combobox. */
  highlightedItem = signal<T | undefined>(undefined);

  /** Whether the combobox is focused. */
  isFocused = signal(false);

  /** The key used to navigate to the previous item in the list. */
  expandKey = computed(() => 'ArrowRight'); // TODO: RTL support.

  /** The key used to navigate to the next item in the list. */
  collapseKey = computed(() => 'ArrowLeft'); // TODO: RTL support.

  /** The keydown event manager for the combobox. */
  keydown = computed(() => {
    if (!this.expanded()) {
      return new KeyboardEventManager()
        .on('ArrowDown', () => this.open({first: true}))
        .on('ArrowUp', () => this.open({last: true}));
    }

    const popupControls = this.inputs.popupControls();

    if (!popupControls) {
      return new KeyboardEventManager();
    }

    const manager = new KeyboardEventManager()
      .on('ArrowDown', () => this.next())
      .on('ArrowUp', () => this.prev())
      .on('Home', () => this.first())
      .on('End', () => this.last())
      .on('Escape', () => {
        if (this.inputs.filterMode() === 'highlight' && popupControls.activeId()) {
          popupControls.unfocus();
          popupControls.clearSelection();

          const inputEl = this.inputs.inputEl();

          if (inputEl) {
            inputEl.value = this.searchString();
          }
        } else {
          this.close();
        }
      }) // TODO: When filter mode is 'highlight', escape should revert to the last committed value.
      .on('Enter', () => this.select({commit: true, close: true}));

    if (popupControls.role() === 'tree') {
      const treeControls = popupControls as ComboboxTreeControls<T, V>;

      if (treeControls.isItemExpandable()) {
        manager
          .on(this.expandKey(), () => treeControls.expandItem())
          .on(this.collapseKey(), () => treeControls.collapseItem());
      }
    }

    return manager;
  });

  /** The pointerup event manager for the combobox. */
  pointerup = computed(() =>
    new PointerEventManager().on(e => {
      const item = this.inputs.popupControls()?.getItem(e);

      if (item) {
        this.select({item, commit: true, close: true});
        this.inputs.inputEl()?.focus(); // Return focus to the input after selecting.
      }

      if (e.target === this.inputs.inputEl()) {
        this.open();
      }
    }),
  );

  constructor(readonly inputs: ComboboxInputs<T, V>) {}

  /** Handles keydown events for the combobox. */
  onKeydown(event: KeyboardEvent) {
    this.keydown().handle(event);
  }

  /** Handles pointerup events for the combobox. */
  onPointerup(event: PointerEvent) {
    this.pointerup().handle(event);
  }

  /** Handles input events for the combobox. */
  onInput(event: Event) {
    const inputEl = this.inputs.inputEl();

    if (!inputEl) {
      return;
    }

    this.searchString.set(inputEl.value);
    this.inputs.popupControls()?.filter(inputEl.value);

    this.open();
    this.inputs.popupControls()?.first();

    if (
      event instanceof InputEvent &&
      this.inputs.filterMode() !== 'manual' &&
      event.inputType.match(/delete.*/)
    ) {
      this.inputs.popupControls()?.select();
      return;
    }

    this.select({highlight: this.inputs.filterMode() === 'highlight'});
  }

  onFocusIn() {
    this.isFocused.set(true);
  }

  /** Handles focus out events for the combobox. */
  onFocusOut(event: FocusEvent) {
    this.isFocused.set(false);

    if (
      !(event.relatedTarget instanceof HTMLElement) ||
      !this.inputs.containerEl()?.contains(event.relatedTarget)
    ) {
      if (this.inputs.filterMode() !== 'manual') {
        this.commit();
      }

      this.close();
    }
  }

  setDefaultState() {
    if (this.inputs.value() !== undefined) {
      this.inputs.popupControls()?.setValue(this.inputs.value());

      const inputEl = this.inputs.inputEl();
      const searchTerm = this.inputs.popupControls()?.getSelectedItem()?.searchTerm() ?? '';

      if (inputEl) {
        inputEl.value = searchTerm;
      }
    }
  }

  /** Closes the combobox. */
  close() {
    this.expanded.set(false);
    this.inputs.popupControls()?.unfocus();
    this.inputs.popupControls()?.clearSelection();
  }

  /** Opens the combobox. */
  open(nav?: {first?: boolean; last?: boolean}) {
    this.expanded.set(true);
    this.inputs.popupControls()?.filter(this.inputs.inputEl()?.value ?? '');
    this.inputs.popupControls()?.setValue(this.inputs.value());

    if (nav?.first) {
      this.first();
    } else if (nav?.last) {
      this.last();
    }
  }

  highlight() {
    const element = this.inputs.inputEl();
    const item = this.inputs.popupControls()?.getSelectedItem();

    if (!item) {
      return;
    }

    const isHighlightable = item
      .searchTerm()
      .toLowerCase()
      .startsWith(this.searchString().toLowerCase());

    if (element && isHighlightable) {
      element.value = this.searchString() + item.searchTerm().slice(this.searchString().length);
      element.setSelectionRange(this.searchString().length, item.searchTerm().length);
      this.highlightedItem.set(item);
    }
  }

  /** Navigates to the next focusable item in the combobox popup. */
  next() {
    this._navigate(() => this.inputs.popupControls()?.next());
  }

  /** Navigates to the previous focusable item in the combobox popup. */
  prev() {
    this._navigate(() => this.inputs.popupControls()?.prev());
  }

  /** Navigates to the first focusable item in the combobox popup. */
  first() {
    this._navigate(() => this.inputs.popupControls()?.first());
  }

  /** Navigates to the last focusable item in the combobox popup. */
  last() {
    this._navigate(() => this.inputs.popupControls()?.last());
  }

  /** Selects an item in the combobox popup. */
  select(opts: {item?: T; commit?: boolean; close?: boolean; highlight?: boolean} = {}) {
    this.inputs.popupControls()?.select(opts.item);
    this.inputs.value.set(this.inputs.popupControls()?.getSelectedItem()?.value());

    if (opts.commit) {
      this.commit();
    }
    if (opts.close) {
      this.close();
    }
    if (opts.highlight) {
      this.highlight();
    }
    if (this.inputs.filterMode() === 'manual') {
      this.inputs.popupControls()?.clearSelection();
      this.inputs.value.set(undefined);
    }
  }

  /** Updates the value of the input based on the currently selected item. */
  commit() {
    const element = this.inputs.inputEl();
    const item = this.inputs.popupControls()?.getSelectedItem();

    if (element && item) {
      element.value = item.searchTerm();

      if (this.inputs.filterMode() === 'highlight') {
        const length = element.value.length;
        element.setSelectionRange(length, length);
      }
    }
  }

  /** Navigates and handles additional actions based on filter mode. */
  private _navigate(operation: () => void) {
    operation();

    if (this.inputs.filterMode() === 'auto-select') {
      this.select();
    }

    if (this.inputs.filterMode() === 'highlight') {
      this.select({commit: true});

      // This is to handle when the user navigates back to the originally highlighted item.
      // E.g. User types "Al", highlights "Alice", then navigates down and back up to "Alice".
      const selectedItem = this.inputs.popupControls()?.getSelectedItem();
      if (selectedItem && selectedItem === this.highlightedItem()) {
        this.highlight();
      }
    }
  }
}
