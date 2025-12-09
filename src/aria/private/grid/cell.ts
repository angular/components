/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, signal, linkedSignal, WritableSignal} from '@angular/core';
import {KeyboardEventManager} from '../behaviors/event-manager';
import {ListFocus} from '../behaviors/list-focus/list-focus';
import {ListNavigation, ListNavigationInputs} from '../behaviors/list-navigation/list-navigation';
import {SignalLike, WritableSignalLike} from '../behaviors/signal-like/signal-like';
import {GridCell} from '../behaviors/grid';
import type {GridPattern} from './grid';
import type {GridRowPattern} from './row';
import {GridCellWidgetPattern} from './widget';

/** The inputs for the `GridCellPattern`. */
export interface GridCellInputs
  extends
    GridCell,
    Omit<
      ListNavigationInputs<GridCellWidgetPattern>,
      'focusMode' | 'items' | 'activeItem' | 'softDisabled' | 'element'
    > {
  /** The `GridPattern` that this cell belongs to. */
  grid: SignalLike<GridPattern>;

  /** The `GridRowPattern` that this cell belongs to. */
  row: SignalLike<GridRowPattern>;

  /** The widget patterns contained within this cell, if any. */
  widgets: SignalLike<GridCellWidgetPattern[]>;

  /** The index of this cell's row within the grid. */
  rowIndex: SignalLike<number | undefined>;

  /** The index of this cell's column within the grid. */
  colIndex: SignalLike<number | undefined>;

  /** A function that returns the cell widget associated with a given element. */
  getWidget: (e: Element | null) => GridCellWidgetPattern | undefined;
}

/** The UI pattern for a grid cell. */
export class GridCellPattern implements GridCell {
  /** A unique identifier for the cell. */
  readonly id: SignalLike<string> = () => this.inputs.id();

  /** The html element that should receive focus. */
  readonly element: SignalLike<HTMLElement> = () => this.inputs.element();

  /** Whether the cell has focus. */
  readonly isFocused: WritableSignal<boolean> = signal(false);

  /** Whether the cell is selected. */
  readonly selected: WritableSignalLike<boolean>;

  /** Whether the cell is selectable. */
  readonly selectable: SignalLike<boolean> = () => this.inputs.selectable();

  /** Whether a cell is disabled. */
  readonly disabled: SignalLike<boolean> = () => this.inputs.disabled();

  /** The number of rows the cell should span. */
  readonly rowSpan: SignalLike<number> = () => this.inputs.rowSpan();

  /** The number of columns the cell should span. */
  readonly colSpan: SignalLike<number> = () => this.inputs.colSpan();

  /** Whether the cell is active. */
  readonly active: SignalLike<boolean> = computed(() => this.inputs.grid().activeCell() === this);

  /** Whether the cell is a selection anchor. */
  readonly anchor: SignalLike<true | undefined> = computed(() =>
    this.inputs.grid().anchorCell() === this ? true : undefined,
  );

  /** The `aria-selected` attribute for the cell. */
  readonly ariaSelected: SignalLike<boolean | undefined> = computed(() =>
    this.inputs.grid().inputs.enableSelection() && this.selectable() ? this.selected() : undefined,
  );

  /** The `aria-rowindex` attribute for the cell. */
  readonly ariaRowIndex: SignalLike<number | undefined> = computed(
    () =>
      this.inputs.row().rowIndex() ??
      this.inputs.rowIndex() ??
      this.inputs.grid().gridBehavior.rowIndex(this),
  );

  /** The `aria-colindex` attribute for the cell. */
  readonly ariaColIndex: SignalLike<number | undefined> = computed(
    () => this.inputs.colIndex() ?? this.inputs.grid().gridBehavior.colIndex(this),
  );

  /** The internal tab index calculation for the cell. */
  private readonly _tabIndex: SignalLike<-1 | 0> = computed(() =>
    this.inputs.grid().gridBehavior.cellTabIndex(this),
  );

  /** The tab index for the cell. If the cell contains a widget, the cell's tab index is -1. */
  readonly tabIndex: SignalLike<-1 | 0> = computed(() => {
    if (this.singleWidgetMode() || this.navigationActivated()) {
      return -1;
    }
    return this._tabIndex();
  });

  // Single/Multi Widget Navigation Setup

  /** Whether the cell contains a single widget. */
  readonly singleWidgetMode: SignalLike<boolean> = computed(
    () => this.inputs.widgets().length === 1,
  );

  /** Whether the cell contains multiple widgets. */
  readonly multiWidgetMode: SignalLike<boolean> = computed(() => this.inputs.widgets().length > 1);

  /** Whether navigation between widgets is disabled. */
  readonly navigationDisabled: SignalLike<boolean> = computed(
    () => !this.multiWidgetMode() || !this.active() || this.inputs.disabled(),
  );

  /** The focus behavior for the widgets in the cell. */
  readonly focusBehavior: ListFocus<GridCellWidgetPattern>;

  /** The navigation behavior for the widgets in the cell. */
  readonly navigationBehavior: ListNavigation<GridCellWidgetPattern>;

  /** The currently active widget in the cell. */
  readonly activeWidget: WritableSignalLike<GridCellWidgetPattern | undefined> = linkedSignal(() =>
    this.inputs.widgets().length > 0 ? this.inputs.widgets()[0] : undefined,
  );

  /** Whether navigation between widgets is activated. */
  readonly navigationActivated: WritableSignalLike<boolean> = signal(false);

  /** Whether any widget within the cell is activated. */
  readonly widgetActivated: SignalLike<boolean> = computed(() =>
    this.inputs.widgets().some(w => w.isActivated()),
  );

  /** Whether the cell or widget inside the cell is activated. */
  readonly isActivated: SignalLike<boolean> = computed(
    () => this.navigationActivated() || this.widgetActivated(),
  );

  /** The key used to navigate to the previous widget. */
  readonly prevKey = computed(() => {
    if (this.inputs.orientation() === 'vertical') {
      return 'ArrowUp';
    }
    return this.inputs.textDirection() === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
  });

  /** The key used to navigate to the next widget. */
  readonly nextKey = computed(() => {
    if (this.inputs.orientation() === 'vertical') {
      return 'ArrowDown';
    }
    return this.inputs.textDirection() === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
  });

  /** The keyboard event manager for the cell. */
  readonly keydown = computed(() => {
    const manager = new KeyboardEventManager();

    // Before start list navigation.
    if (!this.navigationActivated()) {
      manager.on('Enter', () => this.startNavigation());
      return manager;
    }

    // Start list navigation.
    manager
      .on('Escape', () => this.stopNavigation())
      .on(this.prevKey(), () =>
        this._advance(() => this.navigationBehavior.prev({focusElement: false})),
      )
      .on(this.nextKey(), () =>
        this._advance(() => this.navigationBehavior.next({focusElement: false})),
      )
      .on('Home', () => this._advance(() => this.navigationBehavior.next({focusElement: false})))
      .on('End', () => this._advance(() => this.navigationBehavior.next({focusElement: false})));

    return manager;
  });

  constructor(readonly inputs: GridCellInputs) {
    this.selected = inputs.selected;

    const listNavigationInputs: ListNavigationInputs<GridCellWidgetPattern> = {
      ...inputs,
      items: inputs.widgets,
      activeItem: this.activeWidget,
      disabled: this.navigationDisabled,
      focusMode: () => 'roving',
      softDisabled: () => true,
    };

    this.focusBehavior = new ListFocus<GridCellWidgetPattern>(listNavigationInputs);
    this.navigationBehavior = new ListNavigation<GridCellWidgetPattern>({
      ...listNavigationInputs,
      focusManager: this.focusBehavior,
    });
  }

  /** Handles keydown events for the cell. */
  onKeydown(event: KeyboardEvent): void {
    if (this.disabled() || this.inputs.widgets().length === 0) return;

    // No navigation needed if single widget.
    if (this.singleWidgetMode()) {
      this.activeWidget()!.onKeydown(event);
      return;
    }

    // Focus is on the cell before the navigation starts.
    if (!this.navigationActivated()) {
      this.keydown().handle(event);
      return;
    }

    // Widget activate state can be changed during the widget keydown handling.
    const widgetActivated = this.widgetActivated();

    this.activeWidget()!.onKeydown(event);

    if (!widgetActivated) {
      this.keydown().handle(event);
    }
  }

  /** Handles focusin events for the cell. */
  onFocusIn(event: FocusEvent): void {
    this.isFocused.set(true);

    const focusTarget = event.target as Element | null;
    const widget = this.inputs.getWidget(focusTarget);
    if (!widget) return;

    // Pass down focusin event to the widget.
    widget.onFocusIn(event);

    // Update internal states if the widget(or anything within the widget) is
    // receiving focus by tabbing, pointer, or any programmatic control.

    // Update current active widget.
    if (widget !== this.activeWidget()) {
      this.navigationBehavior.goto(widget, {focusElement: false});
    }

    // Start widget navigation if multi widget.
    if (this.multiWidgetMode()) {
      this.navigationActivated.set(true);
    }
  }

  /** Handles focusout events for the cell. */
  onFocusOut(event: FocusEvent): void {
    const blurTarget = event.target as Element | null;
    const widget = this.inputs.getWidget(blurTarget);

    // Pass down focusout event to the widget.
    widget?.onFocusOut(event);

    const focusTarget = event.relatedTarget as Element | null;
    if (this.element().contains(focusTarget)) return;

    this.isFocused.set(false);
    // Reset navigation state when focus leaving cell.
    this.navigationActivated.set(false);
  }

  /** Focuses the cell or the active widget. */
  focus(): void {
    if (this.singleWidgetMode()) {
      this.activeWidget()?.focus();
    } else {
      this.element().focus();
    }
  }

  /** Gets the tab index for the widget within the cell. */
  widgetTabIndex(): -1 | 0 {
    if (this.singleWidgetMode()) {
      return this._tabIndex();
    }
    return this.navigationActivated() ? 0 : -1;
  }

  /** Starts navigation between widgets. */
  startNavigation(): void {
    if (this.navigationActivated()) return;

    this.navigationActivated.set(true);
    this.navigationBehavior.first();
  }

  /** Stops navigation between widgets and restores focus to the cell. */
  stopNavigation(): void {
    if (!this.navigationActivated()) return;

    this.navigationActivated.set(false);
    this.element().focus();
  }

  /** Executes a navigation operation and focuses the new active widget. */
  private _advance(op: () => boolean): void {
    const success = op();
    if (success) {
      this.activeWidget()?.focus();
    }
  }
}
