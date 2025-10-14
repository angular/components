/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {SignalLike, WritableSignalLike} from '../signal-like/signal-like';
import {GridFocus, GridFocusCell, GridFocusInputs} from './grid-focus';
import {GridData, RowCol} from './grid-data';

/** Represents a cell in a grid that can be selected. */
export interface GridSelectionCell extends GridFocusCell {
  /** Whether the cell is selected. */
  selected: WritableSignalLike<boolean>;

  /** Whether the cell is selectable. */
  selectable: SignalLike<boolean>;
}

/** Represents the required inputs for a grid that has selectable cells. */
export interface GridSelectionInputs extends GridFocusInputs {}

/** Dependencies for the `GridSelection` class. */
interface GridSelectionDeps<T extends GridSelectionCell> {
  /** The `GridData` instance that this selection manager operates on. */
  grid: GridData<T>;

  /** The `GridFocus` instance that this selection manager uses to manage focus. */
  gridFocus: GridFocus<T>;
}

/** Controls selection for a grid of items. */
export class GridSelection<T extends GridSelectionCell> {
  constructor(readonly inputs: GridSelectionInputs & GridSelectionDeps<T>) {}

  /** Selects one or more cells in a given range. */
  select(fromCoords: RowCol, toCoords?: RowCol): void {
    for (const cell of this._validCells(fromCoords, toCoords ?? fromCoords)) {
      cell.selected.set(true);
    }
  }

  /** Deselects one or more cells in a given range. */
  deselect(fromCoords: RowCol, toCoords?: RowCol): void {
    for (const cell of this._validCells(fromCoords, toCoords ?? fromCoords)) {
      cell.selected.set(false);
    }
  }

  /** Toggles the selection state of one or more cells in a given range. */
  toggle(fromCoords: RowCol, toCoords?: RowCol): void {
    for (const cell of this._validCells(fromCoords, toCoords ?? fromCoords)) {
      cell.selected.update(state => !state);
    }
  }

  /** Selects all valid cells in the grid. */
  selectAll(): void {
    for (const cell of this._validCells(
      {row: 0, col: 0},
      {row: this.inputs.grid.maxRowCount(), col: this.inputs.grid.maxColCount()},
    )) {
      cell.selected.set(true);
    }
  }

  /** Deselects all valid cells in the grid. */
  deselectAll(): void {
    for (const cell of this._validCells(
      {row: 0, col: 0},
      {row: this.inputs.grid.maxRowCount(), col: this.inputs.grid.maxColCount()},
    )) {
      cell.selected.set(false);
    }
  }

  /** A generator that yields all valid (selectable and not disabled) cells within a given range. */
  *_validCells(fromCoords: RowCol, toCoords: RowCol): Generator<T> {
    const startRow = Math.min(fromCoords.row, toCoords.row);
    const startCol = Math.min(fromCoords.col, toCoords.col);
    const endRow = Math.max(fromCoords.row, toCoords.row);
    const endCol = Math.max(fromCoords.col, toCoords.col);
    const visited = new Set<T>();
    for (let row = startRow; row < endRow + 1; row++) {
      for (let col = startCol; col < endCol + 1; col++) {
        const cell = this.inputs.grid.getCell({row, col});
        if (cell === undefined) continue;
        if (!cell.selectable()) continue;
        if (cell.disabled()) continue;
        if (visited.has(cell)) continue;
        visited.add(cell);
        yield cell;
      }
    }
  }
}
