/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {KeyboardEventManager, PointerEventManager} from '../behaviors/event-manager';
import {
  computed,
  signal,
  SignalLike,
  WritableSignalLike,
} from '../behaviors/signal-like/signal-like';
import {ListItem} from '../behaviors/list/list';

/** Represents the required inputs for a combobox. */
export interface ComboboxInputs<T extends ListItem<V>, V> {
  /** The controls for the popup associated with the combobox. */
  popupControls: SignalLike<
    ComboboxListboxControls<T, V> | ComboboxTreeControls<T, V> | ComboboxDialogPattern | undefined
  >;

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

  /** Whether the combobox is always expanded. */
  alwaysExpanded: SignalLike<boolean>;
}

/** An interface that allows combobox popups to expose the necessary controls for the combobox. */
export interface ComboboxListboxControls<T extends ListItem<V>, V> {
  /** A unique identifier for the popup. */
  id: () => string;

  /** The ARIA role for the popup. */
  role: SignalLike<'listbox' | 'tree' | 'grid'>;

  // TODO(wagnermaciel): Add validation that ensures only readonly comboboxes can have multi-select popups.

  /** Whether multiple items in the popup can be selected at once. */
  multi: SignalLike<boolean>;

  /** The ID of the active item in the popup. */
  activeId: SignalLike<string | undefined>;

  /** The list of items in the popup. */
  items: SignalLike<T[]>;

  /** Navigates to the given item in the popup. */
  focus: (item: T, opts?: {focusElement?: boolean}) => void;

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

  /** Toggles the selection state of the given item in the popup. */
  toggle: (item?: T) => void;

  /** Clears the selection state of the popup. */
  clearSelection: () => void;

  /** Removes focus from any item in the popup. */
  unfocus: () => void;

  /** Returns the item corresponding to the given event. */
  getItem: (e: PointerEvent) => T | undefined;

  /** Returns the currently active (focused) item in the popup. */
  getActiveItem: () => T | undefined;

  /** Returns the currently selected items in the popup. */
  getSelectedItems: () => T[];

  /** Sets the value of the combobox based on the selected item. */
  setValue: (value: V | undefined) => void; // For re-setting the value if the popup was destroyed.
}

export interface ComboboxTreeControls<T extends ListItem<V>, V> extends ComboboxListboxControls<
  T,
  V
> {
  /** Whether the currently active item in the popup is collapsible. */
  isItemCollapsible: () => boolean;

  /** Expands the currently active item in the popup. */
  expandItem: () => void;

  /** Collapses the currently active item in the popup. */
  collapseItem: () => void;

  /** Checks if the currently active item in the popup is expandable. */
  isItemExpandable: (item?: T) => boolean;

  /** Expands all nodes in the tree. */
  expandAll: () => void;

  /** Collapses all nodes in the tree. */
  collapseAll: () => void;

  /** Toggles the expansion state of the currently active item in the popup. */
  toggleExpansion: (item?: T) => void;

  /** Whether the current active item is selectable. */
  isItemSelectable: (item?: T) => boolean;
}

/** Controls the state of a combobox. */
export class ComboboxPattern<T extends ListItem<V>, V> {
  /** Whether the combobox is expanded. */
  expanded = signal(false);

  /** Whether the combobox is disabled. */
  disabled = () => this.inputs.disabled();

  /** The ID of the active item in the combobox. */
  activeDescendant = computed(() => {
    const popupControls = this.inputs.popupControls();
    if (popupControls instanceof ComboboxDialogPattern) {
      return null;
    }

    return popupControls?.activeId() ?? null;
  });

  /** The currently highlighted item in the combobox. */
  highlightedItem = signal<T | undefined>(undefined);

  /** Whether the most recent input event was a deletion. */
  isDeleting = false;

  /** Whether the combobox is focused. */
  isFocused = signal(false);

  /** Whether the combobox has ever been focused. */
  hasBeenFocused = signal(false);

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

  /** Whether the combobox is read-only. */
  readonly = computed(() => this.inputs.readonly() || this.inputs.disabled() || null);

  /** Returns the listbox controls for the combobox. */
  listControls = () => {
    const popupControls = this.inputs.popupControls();

    if (popupControls instanceof ComboboxDialogPattern) {
      return null;
    }

    return popupControls;
  };

  /** Returns the tree controls for the combobox. */
  treeControls = () => {
    const popupControls = this.inputs.popupControls();

    if (popupControls?.role() === 'tree') {
      return popupControls as ComboboxTreeControls<T, V>;
    }

    return null;
  };

  /** The keydown event manager for the combobox. */
  keydown = computed(() => {
    const manager = new KeyboardEventManager();
    const popupControls = this.inputs.popupControls();

    if (!popupControls) {
      return manager;
    }

    if (popupControls instanceof ComboboxDialogPattern) {
      if (!this.expanded()) {
        manager.on('ArrowUp', () => this.open()).on('ArrowDown', () => this.open());

        if (this.readonly()) {
          manager.on('Enter', () => this.open()).on(' ', () => this.open());
        }
      }

      return manager;
    }

    if (!this.inputs.alwaysExpanded()) {
      manager.on('Escape', () => this.close({reset: !this.readonly()}));
    }

    if (!this.expanded()) {
      manager
        .on('ArrowDown', () => this.open({first: true}))
        .on('ArrowUp', () => this.open({last: true}));

      if (this.readonly()) {
        manager
          .on('Enter', () => this.open({selected: true}))
          .on(' ', () => this.open({selected: true}));
      }

      return manager;
    }

    manager
      .on('ArrowDown', () => this.next())
      .on('ArrowUp', () => this.prev())
      .on('Home', () => this.first())
      .on('End', () => this.last());

    if (this.readonly()) {
      manager.on(' ', () => this.select({commit: true, close: !popupControls.multi()}));
    }

    if (popupControls.role() === 'listbox') {
      manager.on('Enter', () => {
        this.select({commit: true, close: !popupControls.multi()});
      });
    }

    const treeControls = this.treeControls();

    if (treeControls?.isItemSelectable()) {
      manager.on('Enter', () => this.select({commit: true, close: true}));
    }

    if (treeControls?.isItemExpandable()) {
      manager
        .on(this.expandKey(), () => this.expandItem())
        .on(this.collapseKey(), () => this.collapseItem());

      if (!treeControls.isItemSelectable()) {
        manager.on('Enter', () => this.expandItem());
      }
    }

    if (treeControls?.isItemCollapsible()) {
      manager.on(this.collapseKey(), () => this.collapseItem());
    }

    return manager;
  });

  /** The click event manager for the combobox. */
  click = computed(() =>
    new PointerEventManager().on(e => {
      if (e.target === this.inputs.inputEl()) {
        if (this.readonly()) {
          this.expanded() ? this.close() : this.open({selected: true});
        }
      }

      const controls = this.inputs.popupControls();

      if (controls instanceof ComboboxDialogPattern) {
        return;
      }

      const item = controls?.getItem(e);

      if (item) {
        if (controls?.role() === 'tree') {
          const treeControls = controls as ComboboxTreeControls<T, V>;

          if (treeControls.isItemExpandable(item) && !treeControls.isItemSelectable(item)) {
            treeControls.toggleExpansion(item);
            this.inputs.inputEl()?.focus();
            return;
          }
        }

        this.select({item, commit: true, close: !controls?.multi()});
        this.inputs.inputEl()?.focus(); // Return focus to the input after selecting.
      }
    }),
  );

  constructor(readonly inputs: ComboboxInputs<T, V>) {}

  /** Handles keydown events for the combobox. */
  onKeydown(event: KeyboardEvent) {
    if (!this.inputs.disabled()) {
      this.keydown().handle(event);
    }
  }

  /** Handles click events for the combobox. */
  onClick(event: MouseEvent) {
    if (!this.inputs.disabled()) {
      this.click().handle(event as PointerEvent);
    }
  }

  /** Handles input events for the combobox. */
  onInput(event: Event) {
    if (this.inputs.disabled() || this.inputs.readonly()) {
      return;
    }

    const inputEl = this.inputs.inputEl();

    if (!inputEl) {
      return;
    }

    const popupControls = this.inputs.popupControls();

    if (popupControls instanceof ComboboxDialogPattern) {
      return;
    }

    this.open();
    this.inputs.inputValue?.set(inputEl.value);
    this.isDeleting = event instanceof InputEvent && !!event.inputType.match(/^delete/);

    if (this.inputs.filterMode() === 'highlight' && !this.isDeleting) {
      this.highlight();
    }
  }

  /** Handles focus in events for the combobox. */
  onFocusIn() {
    if (this.inputs.alwaysExpanded() && !this.hasBeenFocused()) {
      const firstSelectedItem = this.listControls()?.getSelectedItems()[0];
      firstSelectedItem ? this.listControls()?.focus(firstSelectedItem) : this.first();
    }

    this.isFocused.set(true);
    this.hasBeenFocused.set(true);
  }

  /** Handles focus out events for the combobox. */
  onFocusOut(event: FocusEvent) {
    if (this.inputs.disabled()) {
      return;
    }

    const popupControls = this.inputs.popupControls();

    if (popupControls instanceof ComboboxDialogPattern) {
      return;
    }

    if (
      !(event.relatedTarget instanceof HTMLElement) ||
      !this.inputs.containerEl()?.contains(event.relatedTarget)
    ) {
      this.isFocused.set(false);

      if (!this.expanded()) {
        return;
      }

      if (this.readonly()) {
        this.close();
        return;
      }

      if (this.inputs.filterMode() !== 'manual') {
        this.commit();
      } else {
        const item = popupControls
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
    if (this.listControls()?.role() === 'listbox') {
      return this.listControls()?.items()[0];
    }

    return this.listControls()
      ?.items()
      .find(i => i.value() === this.inputs.firstMatch());
  });

  /** Handles filtering logic for the combobox. */
  onFilter() {
    if (this.readonly()) {
      return;
    }

    const popupControls = this.inputs.popupControls();

    if (popupControls instanceof ComboboxDialogPattern) {
      return;
    }

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
      popupControls?.clearSelection();
      popupControls?.unfocus();
      return;
    }

    popupControls?.focus(item);

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
    const selectedItems = this.listControls()?.getSelectedItems();
    const item = selectedItems?.[0];

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
  close(opts?: {reset: boolean}) {
    const popupControls = this.inputs.popupControls();

    if (this.inputs.alwaysExpanded()) {
      return;
    }

    if (popupControls instanceof ComboboxDialogPattern) {
      this.expanded.set(false);
      return;
    }

    if (this.readonly()) {
      this.expanded.set(false);
      popupControls?.unfocus();
      return;
    }

    if (!opts?.reset) {
      if (this.inputs.filterMode() === 'manual') {
        if (
          !this.listControls()
            ?.items()
            .some(i => i.searchTerm() === this.inputs.inputEl()?.value)
        ) {
          this.listControls()?.clearSelection();
        }
      }

      this.expanded.set(false);
      popupControls?.unfocus();
      return;
    }

    if (!this.expanded()) {
      this.inputs.inputValue?.set('');
      popupControls?.clearSelection();

      const inputEl = this.inputs.inputEl();

      if (inputEl) {
        inputEl.value = '';
      }
    } else if (this.expanded()) {
      this.expanded.set(false);
      const selectedItem = popupControls?.getSelectedItems()?.[0];

      if (selectedItem?.searchTerm() !== this.inputs.inputValue!()) {
        popupControls?.clearSelection();
      }

      return;
    }

    this.close();

    if (!this.readonly()) {
      popupControls?.clearSelection();
    }
  }

  /** Opens the combobox. */
  open(nav?: {first?: boolean; last?: boolean; selected?: boolean}) {
    this.expanded.set(true);
    const popupControls = this.inputs.popupControls();

    if (popupControls instanceof ComboboxDialogPattern) {
      return;
    }

    const inputEl = this.inputs.inputEl();

    if (inputEl && this.inputs.filterMode() === 'highlight') {
      const isHighlighting = inputEl.selectionStart !== inputEl.value.length;
      this.inputs.inputValue?.set(inputEl.value.slice(0, inputEl.selectionStart || 0));
      if (!isHighlighting) {
        this.highlightedItem.set(undefined);
      }
    }

    if (nav?.first) {
      this.first();
    }
    if (nav?.last) {
      this.last();
    }
    if (nav?.selected) {
      const selectedItem = popupControls
        ?.items()
        .find(i => popupControls?.getSelectedItems().includes(i));

      if (selectedItem) {
        popupControls?.focus(selectedItem);
      }
    }
  }

  /** Navigates to the next focusable item in the combobox popup. */
  next() {
    this._navigate(() => this.listControls()?.next());
  }

  /** Navigates to the previous focusable item in the combobox popup. */
  prev() {
    this._navigate(() => this.listControls()?.prev());
  }

  /** Navigates to the first focusable item in the combobox popup. */
  first() {
    this._navigate(() => this.listControls()?.first());
  }

  /** Navigates to the last focusable item in the combobox popup. */
  last() {
    this._navigate(() => this.listControls()?.last());
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
    const controls = this.listControls();

    const item = opts.item ?? controls?.getActiveItem();

    if (item?.disabled()) {
      return;
    }

    if (opts.item) {
      controls?.focus(opts.item, {focusElement: false});
    }

    controls?.multi() ? controls.toggle(opts.item) : controls?.select(opts.item);

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
    const selectedItems = this.listControls()?.getSelectedItems();

    if (!inputEl) {
      return;
    }

    inputEl.value = selectedItems?.map(i => i.searchTerm()).join(', ') || '';
    this.inputs.inputValue?.set(inputEl.value);

    if (this.inputs.filterMode() === 'highlight' && !this.readonly()) {
      const length = inputEl.value.length;
      inputEl.setSelectionRange(length, length);
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
      const selectedItem = this.listControls()?.getSelectedItems()[0];

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

export class ComboboxDialogPattern {
  id = () => this.inputs.id();

  role = () => 'dialog' as const;

  keydown = computed(() => {
    return new KeyboardEventManager().on('Escape', () => this.inputs.combobox.close());
  });

  constructor(
    readonly inputs: {
      combobox: ComboboxPattern<any, any>;
      element: SignalLike<HTMLDialogElement>;
      id: SignalLike<string>;
    },
  ) {}

  onKeydown(event: KeyboardEvent) {
    this.keydown().handle(event);
  }

  onClick(event: MouseEvent) {
    // The "click" event fires on the dialog when the user clicks outside of the dialog content.
    if (event.target === this.inputs.element()) {
      this.inputs.combobox.close();
    }
  }
}
