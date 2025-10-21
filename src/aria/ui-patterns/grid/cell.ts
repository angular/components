/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed} from '@angular/core';
import {SignalLike, WritableSignalLike} from '../behaviors/signal-like/signal-like';
import {GridCell} from '../behaviors/grid';
import type {GridPattern} from './grid';
import type {GridRowPattern} from './row';
import type {GridCellWidgetPattern} from './widget';

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
}

/** The UI pattern for a grid cell. */
export class GridCellPattern implements GridCell {
  /** A unique identifier for the cell. */
  readonly id: SignalLike<string>;

  /** Whether a cell is disabled. */
  readonly disabled: SignalLike<boolean>;

  /** Whether the cell is selected. */
  readonly selected: WritableSignalLike<boolean>;

  /** Whether the cell is selectable. */
  readonly selectable: SignalLike<boolean>;

  /** The number of rows the cell should span. */
  readonly rowSpan: SignalLike<number>;

  /** The number of columns the cell should span. */
  readonly colSpan: SignalLike<number>;

  /** The `aria-selected` attribute for the cell. */
  readonly ariaSelected = computed<boolean | undefined>(() =>
    this.inputs.grid().inputs.enableSelection() && this.selectable() ? this.selected() : undefined,
  );

  /** The `aria-rowindex` attribute for the cell. */
  readonly ariaRowIndex = computed(
    () =>
      this.inputs.row().rowIndex() ??
      this.inputs.rowIndex() ??
      this.inputs.grid().gridBehavior.rowIndex(this),
  );

  /** The `aria-colindex` attribute for the cell. */
  readonly ariaColIndex = computed(
    () => this.inputs.colIndex() ?? this.inputs.grid().gridBehavior.colIndex(this),
  );

  /** The html element that should receive focus. */
  readonly element: SignalLike<HTMLElement> = computed(
    () => this.inputs.widget()?.element() ?? this.inputs.element(),
  );

  /** Whether the cell is active. */
  readonly active = computed(() => this.inputs.grid().activeCell() === this);

  /** The internal tab index calculation for the cell. */
  private readonly _tabIndex: SignalLike<-1 | 0> = computed(() =>
    this.inputs.grid().gridBehavior.cellTabIndex(this),
  );

  /** The `tabindex` for the cell. If the cell contains a widget, the cell's tabindex is -1. */
  readonly tabIndex: SignalLike<-1 | 0> = computed(() =>
    this.inputs.widget() !== undefined ? -1 : this._tabIndex(),
  );

  /** Whether the widget within the cell is activated. */
  readonly widgetActivated: SignalLike<boolean> = computed(
    () => this.inputs.widget()?.inputs.activate() ?? false,
  );

  constructor(readonly inputs: GridCellInputs) {
    this.id = inputs.id;
    this.disabled = inputs.disabled;
    this.rowSpan = inputs.rowSpan;
    this.colSpan = inputs.colSpan;
    this.selected = inputs.selected;
    this.selectable = inputs.selectable;
  }

  /** Gets the `tabindex` for the widget within the cell. */
  widgetTabIndex(): -1 | 0 {
    return this._tabIndex();
  }
}
