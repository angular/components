/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {SignalLike} from '../signal-like/signal-like';
import {GridFocus, GridFocusCell, GridFocusInputs, RowCol} from '../grid-focus/grid-focus';
import {computed} from '@angular/core';

/** Represents an item in a collection, such as a listbox option, than can be navigated to. */
export interface GridNavigationCell extends GridFocusCell {}

/** Represents the required inputs for a collection that has navigable items. */
export interface GridNavigationInputs<T extends GridNavigationCell> extends GridFocusInputs<T> {
  gridFocus: GridFocus<T>;
  wrap: SignalLike<boolean>;
  wrapBehavior: SignalLike<'continuous' | 'loop'>;
}

/** Controls navigation for a grid of items. */
export class GridNavigation<T extends GridNavigationCell> {
  rowcount = computed(() => this.inputs.gridFocus.rowCount());
  colcount = computed(() => this.inputs.gridFocus.colCount());

  constructor(readonly inputs: GridNavigationInputs<T>) {}

  /** Navigates to the given item. */
  gotoCell(cell?: T): boolean {
    return cell ? this.inputs.gridFocus.focusCell(cell) : false;
  }

  /** Navigates to the given coordinates. */
  gotoCoords(coords: RowCol): boolean {
    return this.inputs.gridFocus.focusCoordinates(coords);
  }

  /** Navigates to the item above the current item. */
  up(): boolean {
    return this._advance((cell: T, {col}: RowCol) => {
      const rowindex = cell.rowindex();
      const isRowWrapping = this.inputs.wrap() && rowindex - 1 < 0;
      const isColumnWrapping = isRowWrapping && this.inputs.wrapBehavior() === 'continuous';

      const nextCoords = {
        row: isRowWrapping
          ? (rowindex - 1 + this.rowcount()) % this.rowcount()
          : Math.max(rowindex - 1, 0),
        col: isColumnWrapping ? (col - 1 + this.colcount()) % this.colcount() : col,
      };

      const nextCell = this.inputs.gridFocus.getCell(nextCoords)!;

      return {
        row: nextCell.rowindex(),
        col: nextCoords.col,
      };
    });
  }

  /** Navigates to the item below the current item. */
  down(): boolean {
    return this._advance((cell: T, {col}: RowCol) => {
      const rowspan = cell.rowspan();
      const rowindex = cell.rowindex();
      const isRowWrapping = this.inputs.wrap() && rowindex + rowspan >= this.rowcount();
      const isColumnWrapping = isRowWrapping && this.inputs.wrapBehavior() === 'continuous';

      return {
        row: isRowWrapping
          ? (rowindex + rowspan) % this.rowcount()
          : Math.min(rowindex + rowspan, this.rowcount() - 1),
        col: isColumnWrapping ? (col + 1 + this.colcount()) % this.colcount() : col,
      };
    });
  }

  /** Navigates to the item to the left of the current item. */
  left(): boolean {
    return this._advance((cell: T, {row, col}: RowCol) => {
      const colindex = cell.colindex();
      const isColumnWrapping = this.inputs.wrap() && colindex - 1 < 0;
      const isRowWrapping = isColumnWrapping && this.inputs.wrapBehavior() === 'continuous';

      const nextCoords = {
        row: isRowWrapping ? (row - 1 + this.rowcount()) % this.rowcount() : row,
        col: isColumnWrapping
          ? (colindex - 1 + this.colcount()) % this.colcount()
          : Math.max(colindex - 1, 0),
      };

      const nextCell = this.inputs.gridFocus.getCell(nextCoords)!;

      return {
        row: nextCoords.row,
        col: nextCell.colindex(),
      };
    });
  }

  /** Navigates to the item to the right of the current item. */
  right(): boolean {
    return this._advance((cell: T, {row}: RowCol) => {
      const colspan = cell.colspan();
      const colindex = cell.colindex();
      const isColumnWrapping = this.inputs.wrap() && colindex + colspan >= this.colcount();
      const isRowWrapping = isColumnWrapping && this.inputs.wrapBehavior() === 'continuous';

      return {
        row: isRowWrapping ? (row + 1 + this.rowcount()) % this.rowcount() : row,
        col: isColumnWrapping
          ? (colindex + colspan + this.colcount()) % this.colcount()
          : Math.min(colindex + colspan, this.colcount() - 1),
      };
    });
  }

  /**
   * Continuously calls the given stepFn starting at the given coordinates
   * until either a new focusable cell is reached or the grid fully loops.
   */
  private _advance(stepFn: (cell: T, coords: RowCol) => RowCol) {
    const startCoords = this.inputs.activeCoords();
    let prevCoords = {row: startCoords.row, col: startCoords.col};
    let nextCoords = {row: startCoords.row, col: startCoords.col};
    let nextCell = this.inputs.gridFocus.activeCell()!;

    while (true) {
      prevCoords = {row: nextCoords.row, col: nextCoords.col};
      nextCoords = stepFn(nextCell, nextCoords);

      // The step did not result in any change in coordinates.
      //
      // This will happen if the user is at a boundary (start/end row or col)
      // and tries to advance past it while `wrap` is false.
      if (nextCoords.row === prevCoords.row && nextCoords.col === prevCoords.col) {
        return false;
      }

      // The step has resulted in arriving back to the original coordinates.
      //
      // This will happen if the other cells in the grid are unfocusable and `wrap`
      // is true. The `stepFn` will eventually loop all the way back to the original cells.
      if (nextCoords.row === startCoords.row && nextCoords.col === startCoords.col) {
        return false;
      }

      nextCell = this.inputs.gridFocus.getCell(nextCoords)!;

      // The `stepFn` has successfully reached a cell that is focusable.
      if (this.inputs.gridFocus.isFocusable(nextCell)) {
        return this.gotoCoords(nextCoords);
      }
    }
  }
}
