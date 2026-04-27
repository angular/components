/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  computed,
  signal,
  SignalLike,
  WritableSignalLike,
} from '../behaviors/signal-like/signal-like';
import {GridCell} from '../behaviors/grid';
import type {GridPattern} from './grid';
import type {GridRowPattern} from './row';
import {GridCellWidgetPattern} from './widget';

/** The inputs for the `GridCellPattern`. */
export interface GridCellInputs extends GridCell {
  /** The `GridPattern` that this cell belongs to. */
  grid: SignalLike<GridPattern>;

  /** The `GridRowPattern` that this cell belongs to. */
  row: SignalLike<GridRowPattern>;

  /** The widget pattern contained within this cell, if any. */
  widget: SignalLike<GridCellWidgetPattern | undefined>;

  /** The index of this cell's row within the grid. */
  rowIndex: SignalLike<number | undefined>;

  /** The index of this cell's column within the grid. */
  colIndex: SignalLike<number | undefined>;

  /** A function that returns the cell widget associated with a given element. */
  getWidget: (e: Element | null) => GridCellWidgetPattern | undefined;

  /** Callback when the cell is activated via Enter/Space. */
  onActivate?: (event: KeyboardEvent) => void;
}

/** The UI pattern for a grid cell. */
export class GridCellPattern implements GridCell {
  /** A unique identifier for the cell. */
  readonly id: SignalLike<string> = () => this.inputs.id();

  /** The html element that should receive focus. */
  readonly element: SignalLike<HTMLElement> = () => this.inputs.element();

  /** Whether the cell has focus. */
  readonly isFocused: WritableSignalLike<boolean> = signal(false);

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
    if (this.inputs.widget()) {
      return -1;
    }
    return this._tabIndex();
  });

  /** The widget in the cell. */
  readonly widget: SignalLike<GridCellWidgetPattern | undefined> = () => this.inputs.widget();

  /** Whether the cell or widget inside the cell is activated. */
  readonly isActivated: SignalLike<boolean> = computed(() => this.widget()?.isActivated() ?? false);

  constructor(readonly inputs: GridCellInputs) {
    this.selected = inputs.selected;
  }

  /** Handles keydown events for the cell. */
  onKeydown(event: KeyboardEvent): void {
    if (this.disabled()) return;
    this.widget()?.onKeydown(event);

    if (this.widget()?.inputs.widgetType() === 'simple') {
      if (event.key === 'Enter' || event.key === ' ') {
        this.inputs.onActivate?.(event);
      }
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
  }

  /** Focuses the cell or the active widget. */
  focus(): void {
    const widget = this.widget();
    if (widget) {
      widget.focus();
    } else {
      this.element().focus();
    }
  }

  /** Gets the tab index for the widget within the cell. */
  widgetTabIndex(): -1 | 0 {
    return this._tabIndex();
  }
}
