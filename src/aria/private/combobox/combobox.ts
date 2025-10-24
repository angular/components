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
export interface ComboboxInputs<T extends ListItem<V>, V> {
  /** The controls for the popup associated with the combobox. */
  popupControls: SignalLike<ComboboxListboxControls<T, V> | ComboboxTreeControls<T, V> | undefined>;

  /** The HTML input element that serves as the combobox input. */
  inputEl: SignalLike<HTMLInputElement | undefined>;

  /** The HTML element that serves as the combobox container. */
  containerEl: SignalLike<HTMLElement | undefined>;

  /** The filtering mode for the combobox. */
  filterMode: SignalLike<'manual' | 'auto-select' | 'highlight'>;

  /** The current value of the combobox. */
  inputValue?: WritableSignalLike<string>;

  /** The value of the first matching item in the popup. */
  firstMatch: SignalLike<V | undefined>;

  /** Whether the combobox is disabled. */
  disabled: SignalLike<boolean>;

  /** Whether the combobox is read-only. */
  readonly: SignalLike<boolean>;

  /** Whether the combobox is in a right-to-left context. */
  textDirection: SignalLike<'rtl' | 'ltr'>;
}

/** An interface that allows combobox popups to expose the necessary controls for the combobox. */
export interface ComboboxListboxControls<T extends ListItem<V>, V> {
  /** A unique identifier for the popup. */
  id: () => string;

  /** The ARIA role for the popup. */
  role: SignalLike<'listbox' | 'tree' | 'grid'>;

  /** The ID of the active item in the popup. */
  activeId: SignalLike<string | undefined>;

  /** The list of items in the popup. */
  items: SignalLike<T[]>;

  /** Navigates to the given item in the popup. */
  focus: (item: T) => void;

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

  /** Removes focus from any item in the popup. */
  unfocus: () => void;

  /** Returns the item corresponding to the given event. */
  getItem: (e: PointerEvent) => T | undefined;

  /** Returns the currently selected item in the popup. */
  getSelectedItem: () => T | undefined;

  /** Sets the value of the combobox based on the selected item. */
  setValue: (value: V | undefined) => void; // For re-setting the value if the popup was destroyed.
}

export interface ComboboxTreeControls<T extends ListItem<V>, V>
  extends ComboboxListboxControls<T, V> {
  /** Whether the currently active item in the popup is collapsible. */
  isItemCollapsible: () => boolean;

  /** Expands the currently active item in the popup. */
  expandItem: () => void;

  /** Collapses the currently active item in the popup. */
  collapseItem: () => void;

  /** Checks if the currently active item in the popup is expandable. */
  isItemExpandable: () => boolean;

  /** Expands all nodes in the tree. */
  expandAll: () => void;

  /** Collapses all nodes in the tree. */
  collapseAll: () => void;
}

/** Controls the state of a combobox. */
export class ComboboxPattern<T extends ListItem<V>, V> {
  /** Whether the combobox is expanded. */
  expanded = signal(false);

  /** The ID of the active item in the combobox. */
  activedescendant = computed(() => this.inputs.popupControls()?.activeId() ?? null);

  /** The currently highlighted item in the combobox. */
  highlightedItem = signal<T | undefined>(undefined);

  /** Whether the most recent input event was a deletion. */
  isDeleting = false;

  /** Whether the combobox is focused. */
  isFocused = signal(false);

  /** The key used to navigate to the previous item in the list. */
  expandKey = computed(() => (this.inputs.textDirection() === 'rtl' ? 'ArrowLeft' : 'ArrowRight'));

  /** The key used to navigate to the next item in the list. */
  collapseKey = computed(() =>
    this.inputs.textDirection() === 'rtl' ? 'ArrowRight' : 'ArrowLeft',
  );

  /** The ID of the popup associated with the combobox. */
  popupId = computed(() => this.inputs.popupControls()?.id() || null);

  /** The autocomplete behavior of the combobox. */
  autocomplete = computed(() => (this.inputs.filterMode() === 'highlight' ? 'both' : 'list'));

  /** The ARIA role of the popup associated with the combobox. */
  hasPopup = computed(() => this.inputs.popupControls()?.role() || null);

  /** Whether the combobox is interactive. */
  isInteractive = computed(() => !this.inputs.disabled() && !this.inputs.readonly());

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
        // TODO(wagnermaciel): We may want to fold this logic into the close() method.
        if (this.inputs.filterMode() === 'highlight' && popupControls.activeId()) {
          popupControls.unfocus();
          popupControls.clearSelection();

          const inputEl = this.inputs.inputEl();
          if (inputEl) {
            inputEl.value = this.inputs.inputValue!();
          }
        } else {
          this.close();
          this.inputs.popupControls()?.clearSelection();
        }
      }) // TODO: When filter mode is 'highlight', escape should revert to the last committed value.
      .on('Enter', () => this.select({commit: true, close: true}));

    if (popupControls.role() === 'tree') {
      const treeControls = popupControls as ComboboxTreeControls<T, V>;

      if (treeControls.isItemExpandable() || treeControls.isItemCollapsible()) {
        manager.on(this.collapseKey(), () => this.collapseItem());
      }

      if (treeControls.isItemExpandable()) {
        manager.on(this.expandKey(), () => this.expandItem());
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
    if (this.isInteractive()) {
      this.keydown().handle(event);
    }
  }

  /** Handles pointerup events for the combobox. */
  onPointerup(event: PointerEvent) {
    if (this.isInteractive()) {
      this.pointerup().handle(event);
    }
  }

  /** Handles input events for the combobox. */
  onInput(event: Event) {
    if (!this.isInteractive()) {
      return;
    }

    const inputEl = this.inputs.inputEl();

    if (!inputEl) {
      return;
    }

    this.open();
    this.inputs.inputValue?.set(inputEl.value);
    this.isDeleting = event instanceof InputEvent && !!event.inputType.match(/^delete/);

    if (this.inputs.filterMode() === 'manual') {
      const searchTerm = this.inputs.popupControls()?.getSelectedItem()?.searchTerm();

      if (searchTerm && this.inputs.inputValue!() !== searchTerm) {
        this.inputs.popupControls()?.clearSelection();
      }
    }
  }

  /** Handles focus in events for the combobox. */
  onFocusIn() {
    this.isFocused.set(true);
  }

  /** Handles focus out events for the combobox. */
  onFocusOut(event: FocusEvent) {
    if (this.inputs.disabled() || this.inputs.readonly()) {
      return;
    }

    if (
      !(event.relatedTarget instanceof HTMLElement) ||
      !this.inputs.containerEl()?.contains(event.relatedTarget)
    ) {
      this.isFocused.set(false);
      if (this.inputs.filterMode() !== 'manual') {
        this.commit();
      } else {
        const item = this.inputs
          .popupControls()
          ?.items()
          .find(i => i.searchTerm() === this.inputs.inputEl()?.value);

        if (item) {
          this.select({item});
        }
      }

      this.close();
    }
  }

  /** The first matching item in the combobox. */
  firstMatch = computed(() => {
    // TODO(wagnermaciel): Consider whether we should not provide this default behavior for the
    // listbox. Instead, we may want to allow users to have no match so that typing does not focus
    // any option.
    if (this.inputs.popupControls()?.role() === 'listbox') {
      return this.inputs.popupControls()?.items()[0];
    }

    return this.inputs
      .popupControls()
      ?.items()
      .find(i => i.value() === this.inputs.firstMatch());
  });

  /** Handles filtering logic for the combobox. */
  onFilter() {
    // TODO(wagnermaciel)
    // When the user first interacts with the combobox, the popup will lazily render for the first
    // time. This is a simple way to detect this and avoid auto-focus & selection logic, but this
    // should probably be moved to the component layer instead.
    const isInitialRender = !this.inputs.inputValue?.().length && !this.isDeleting;

    if (isInitialRender) {
      return;
    }

    // Avoid refocusing the input if a filter event occurs after focus has left the combobox.
    if (!this.isFocused()) {
      return;
    }

    if (this.inputs.popupControls()?.role() === 'tree') {
      const treeControls = this.inputs.popupControls() as ComboboxTreeControls<T, V>;
      this.inputs.inputValue?.().length ? treeControls.expandAll() : treeControls.collapseAll();
    }

    const item = this.firstMatch();

    if (!item) {
      this.inputs.popupControls()?.clearSelection();
      this.inputs.popupControls()?.unfocus();
      return;
    }

    this.inputs.popupControls()?.focus(item);

    if (this.inputs.filterMode() !== 'manual') {
      this.select({item});
    }

    if (this.inputs.filterMode() === 'highlight' && !this.isDeleting) {
      this.highlight();
    }
  }

  /** Highlights the currently selected item in the combobox. */
  highlight() {
    const inputEl = this.inputs.inputEl();
    const item = this.inputs.popupControls()?.getSelectedItem();

    if (!inputEl || !item) {
      return;
    }

    const isHighlightable = item
      .searchTerm()
      .toLowerCase()
      .startsWith(this.inputs.inputValue!().toLowerCase());

    if (isHighlightable) {
      inputEl.value =
        this.inputs.inputValue!() + item.searchTerm().slice(this.inputs.inputValue!().length);
      inputEl.setSelectionRange(this.inputs.inputValue!().length, item.searchTerm().length);
      this.highlightedItem.set(item);
    }
  }

  /** Closes the combobox. */
  close() {
    this.expanded.set(false);
    this.inputs.popupControls()?.unfocus();
  }

  /** Opens the combobox. */
  open(nav?: {first?: boolean; last?: boolean}) {
    this.expanded.set(true);

    if (nav?.first) {
      this.first();
    }
    if (nav?.last) {
      this.last();
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

  /** Collapses the currently focused item in the combobox. */
  collapseItem() {
    const controls = this.inputs.popupControls() as ComboboxTreeControls<T, V>;
    this._navigate(() => controls?.collapseItem());
  }

  /** Expands the currently focused item in the combobox. */
  expandItem() {
    const controls = this.inputs.popupControls() as ComboboxTreeControls<T, V>;
    this._navigate(() => controls?.expandItem());
  }

  /** Selects an item in the combobox popup. */
  select(opts: {item?: T; commit?: boolean; close?: boolean} = {}) {
    this.inputs.popupControls()?.select(opts.item);

    if (opts.commit) {
      this.commit();
    }
    if (opts.close) {
      this.close();
    }
  }

  /** Updates the value of the input based on the currently selected item. */
  commit() {
    const inputEl = this.inputs.inputEl();
    const item = this.inputs.popupControls()?.getSelectedItem();

    if (inputEl && item) {
      inputEl.value = item.searchTerm();
      this.inputs.inputValue?.set(item.searchTerm());

      if (this.inputs.filterMode() === 'highlight') {
        const length = inputEl.value.length;
        inputEl.setSelectionRange(length, length);
      }
    }
  }

  /** Navigates and handles additional actions based on filter mode. */
  private _navigate(operation: () => void) {
    operation();

    if (this.inputs.filterMode() !== 'manual') {
      this.select();
    }

    if (this.inputs.filterMode() === 'highlight') {
      // This is to handle when the user navigates back to the originally highlighted item.
      // E.g. User types "Al", highlights "Alice", then navigates down and back up to "Alice".
      const selectedItem = this.inputs.popupControls()?.getSelectedItem();

      if (!selectedItem) {
        return;
      }

      if (selectedItem === this.highlightedItem()) {
        this.highlight();
      } else {
        const inputEl = this.inputs.inputEl()!;
        inputEl.value = selectedItem?.searchTerm()!;
      }
    }
  }
}
