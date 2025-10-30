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
import {signal} from '@angular/core';

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
  /** The list of cells that were changed in the last selection operation. */
  private readonly _undoList: WritableSignalLike<[T, boolean][]> = signal([]);

  constructor(readonly inputs: GridSelectionInputs & GridSelectionDeps<T>) {}

  /** Reverts the last selection change. */
  undo(): void {
    for (const [cell, oldState] of this._undoList()) {
      cell.selected.set(oldState);
    }
    this._undoList.set([]);
  }

  /** Selects one or more cells in a given range. */
  select(fromCoords: RowCol, toCoords?: RowCol): void {
    this._updateState(fromCoords, toCoords ?? fromCoords, () => true);
  }

  /** Deselects one or more cells in a given range. */
  deselect(fromCoords: RowCol, toCoords?: RowCol): void {
    this._updateState(fromCoords, toCoords ?? fromCoords, () => false);
  }

  /** Toggles the selection state of one or more cells in a given range. */
  toggle(fromCoords: RowCol, toCoords?: RowCol): void {
    this._updateState(fromCoords, toCoords ?? fromCoords, oldState => !oldState);
  }

  /** Selects all valid cells in the grid. */
  selectAll(): void {
    this._updateState(
      {row: 0, col: 0},
      {row: this.inputs.grid.maxRowCount(), col: this.inputs.grid.maxColCount()},
      () => true,
    );
  }

  /** Deselects all valid cells in the grid. */
  deselectAll(): void {
    this._updateState(
      {row: 0, col: 0},
      {row: this.inputs.grid.maxRowCount(), col: this.inputs.grid.maxColCount()},
      () => false,
    );
  }

  /** Whether a cell is selctable. */
  isSelectable(cell: T) {
    return cell.selectable() && !cell.disabled();
  }

  /** A generator that yields all cells within a given range. */
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
        if (!this.isSelectable(cell)) continue;
        if (visited.has(cell)) continue;
        visited.add(cell);
        yield cell;
      }
    }
  }

  /**
   * Updates the selection state of cells in a given range and preserves previous changes
   * to a undo list.
   */
  private _updateState(
    fromCoords: RowCol,
    toCoords: RowCol,
    stateFn: (oldState: boolean) => boolean,
  ): void {
    const undoList: [T, boolean][] = [];
    for (const cell of this._validCells(fromCoords, toCoords)) {
      const oldState = cell.selected();
      undoList.push([cell, oldState]);
      cell.selected.set(stateFn(oldState));
    }
    this._undoList.set(undoList);
  }
}
