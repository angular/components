/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, signal} from '@angular/core';
import {SignalLike, WritableSignalLike} from '../signal-like/signal-like';

/** Represents an cell in a grid, such as a grid cell, that may receive focus. */
export interface GridFocusCell {
  /** A unique identifier for the cell. */
  id: SignalLike<string>;

  /** The html element that should receive focus. */
  element: SignalLike<HTMLElement>;

  /** Whether an cell is disabled. */
  disabled: SignalLike<boolean>;

  /** The number of rows the cell should span. Defaults to 1. */
  rowspan: SignalLike<number>;

  /** The number of columns the cell should span. Defaults to 1. */
  colspan: SignalLike<number>;

  /** The row index of the cell within the grid. */
  rowindex: SignalLike<number>;

  /** The column index of the cell within the grid. */
  colindex: SignalLike<number>;
}

/** Represents the required inputs for a grid that contains focusable cells. */
export interface GridFocusInputs<T extends GridFocusCell> {
  /** The focus strategy used by the grid. */
  focusMode: SignalLike<'roving' | 'activedescendant'>;

  /** Whether the grid is disabled. */
  disabled: SignalLike<boolean>;

  /** The cells in the grid, represented as a 2D array (rows and columns). */
  cells: SignalLike<T[][]>;

  /** The coordinates (row and column) of the current active cell. */
  activeCoords: WritableSignalLike<{row: number; column: number}>;

  /** Whether disabled cells in the grid should be skipped when navigating. */
  skipDisabled: SignalLike<boolean>;
}

/** Controls focus for a 2D grid of cells. */
export class GridFocus<T extends GridFocusCell> {
  /** The last active cell coordinates. */
  prevActiveCoords = signal<{row: number; column: number}>({row: 0, column: 0});

  /** The current active cell based on `activeCoords` coordinates. */
  activeCell = computed(() => this.getCell(this.inputs.activeCoords()));

  constructor(readonly inputs: GridFocusInputs<T>) {}

  /** The id of the current active cell, for ARIA activedescendant. */
  getActiveDescendant(): string | undefined {
    if (this.isGridDisabled() || this.inputs.focusMode() === 'roving') {
      return undefined;
    }
    const currentActiveCell = this.activeCell();
    return currentActiveCell ? currentActiveCell.id() : undefined;
  }

  /** Whether the grid is in a disabled state. */
  isGridDisabled(): boolean {
    if (this.inputs.disabled()) {
      return true;
    }
    const gridCells = this.inputs.cells();
    return gridCells.length === 0 || gridCells.every(row => row.every(cell => cell.disabled()));
  }

  /** The tabindex for the grid container. */
  getGridTabindex(): -1 | 0 {
    if (this.isGridDisabled()) {
      return 0;
    }
    return this.inputs.focusMode() === 'activedescendant' ? 0 : -1;
  }

  /** Returns the tabindex for the given grid cell cell. */
  getCellTabindex(cell: T): -1 | 0 {
    if (this.isGridDisabled()) {
      return -1;
    }
    if (this.inputs.focusMode() === 'activedescendant') {
      return -1;
    }
    return this.activeCell() === cell ? 0 : -1;
  }

  /** Moves focus to the cell at the given coordinates if it's part of a focusable cell. */
  focus(coordinates: {row: number; column: number}): boolean {
    if (this.isGridDisabled()) {
      return false;
    }

    const cell = this.getCell(coordinates);

    if (!cell || !this.isFocusable(cell)) {
      return false; // No cell at coordinates, or cell is not focusable.
    }

    this.prevActiveCoords.set(this.inputs.activeCoords());
    this.inputs.activeCoords.set(coordinates); // Set activeCoords to the exact coordinates

    if (this.inputs.focusMode() === 'roving') {
      const element = cell.element(); // Element of the cell that *covers* these coordinates
      if (element && typeof element.focus === 'function') {
        element.focus();
      }
    }
    return true;
  }

  /** Returns true if the given cell can be navigated to. */
  isFocusable(cell: T): boolean {
    return !cell.disabled() || !this.inputs.skipDisabled();
  }

  /** Finds the top-left anchor coordinates of a given cell instance in the grid. */
  getCoordinates(cellToFind: T): {row: number; column: number} | void {
    const grid = this.inputs.cells();
    const occupiedCells = new Set<string>(); // Stores "row,column" string keys for occupied cells.

    for (let rowindex = 0; rowindex < grid.length; rowindex++) {
      let colindex = 0;
      const gridRow = grid[rowindex];

      for (const gridCell of gridRow) {
        // Skip past cells that are already taken.
        while (occupiedCells.has(`${rowindex},${colindex}`)) {
          colindex++;
        }

        // Check if this is the cell we're looking for.
        if (gridCell === cellToFind) {
          return {row: rowindex, column: colindex};
        }

        const rowspan = gridCell.rowspan();
        const colspan = gridCell.colspan();

        // If this cell spans multiple rows, mark those cells as occupied.
        if (rowspan > 1) {
          for (let rOffset = 1; rOffset < rowspan; rOffset++) {
            const spannedRow = rowindex + rOffset;
            for (let cOffset = 0; cOffset < colspan; cOffset++) {
              const spannedCol = colindex + cOffset;
              occupiedCells.add(`${spannedRow},${spannedCol}`);
            }
          }
        }

        colindex += colspan;
      }
    }
  }

  /** Gets the cell that covers the given coordinates, considering rowspan and colspan. */
  getCell(coords: {row: number; column: number}): T | void {
    for (const row of this.inputs.cells()) {
      for (const cell of row) {
        if (
          coords.row >= cell.rowindex() &&
          coords.row <= cell.rowindex() + cell.rowspan() - 1 &&
          coords.column >= cell.colindex() &&
          coords.column <= cell.colindex() + cell.colspan() - 1
        ) {
          return cell;
        }
      }
    }
  }
}
