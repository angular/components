/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed} from '@angular/core';
import {SignalLike} from '../signal-like/signal-like';

/** Represents coordinates in a grid. */
export interface RowCol {
  /** The row index. */
  row: number;

  /** The column index. */
  col: number;
}

/** A string representation of grid coordinates. */
type CoordString = `${RowCol['row']}:${RowCol['col']}`;

/** The base interface for a cell in a grid. */
export interface BaseGridCell {
  /** The number of rows the cell should span. */
  rowSpan: SignalLike<number>;

  /** The number of columns the cell should span. */
  colSpan: SignalLike<number>;
}

/** Represents the required inputs for GridData. */
export interface GridDataInputs<T extends BaseGridCell> {
  /** The two-dimensional array of cells that represents the grid. */
  cells: SignalLike<T[][]>;
}

/** Controls internal coordinates for a grid of items. */
export class GridData<T extends BaseGridCell> {
  /** The two-dimensional array of cells that represents the grid. */
  readonly cells: SignalLike<T[][]>;

  /** The number of rows in the grid. */
  readonly rowCount = computed<number>(() => this.cells().length);

  /** The maximum number of rows in the grid, accounting for row spans. */
  readonly maxRowCount = computed<number>(() => Math.max(...this._rowCountByCol().values(), 0));

  /** The maximum number of columns in the grid, accounting for column spans. */
  readonly maxColCount = computed<number>(() => Math.max(...this._colCountsByRow().values(), 0));

  /** A map from a cell to its primary and spanned coordinates. */
  private readonly _coordsMap = computed<Map<T, {coords: RowCol; spanCoords: RowCol[]}>>(() => {
    const coordsMap = new Map();
    const visitedCoords = new Set();

    for (let rowIndex = 0; rowIndex < this.cells().length; rowIndex++) {
      let colIndex = 0;
      const row = this.cells()[rowIndex];

      for (const cell of row) {
        // Skip past cells that are already taken.
        while (visitedCoords.has(`${rowIndex}:${colIndex}`)) {
          colIndex++;
        }

        const rowspan = cell.rowSpan();
        const colspan = cell.colSpan();
        const spanCoords: RowCol[] = [];

        for (let rowOffset = 0; rowOffset < rowspan; rowOffset++) {
          const row = rowIndex + rowOffset;
          for (let colOffset = 0; colOffset < colspan; colOffset++) {
            const col = colIndex + colOffset;
            visitedCoords.add(`${row}:${col}`);
            spanCoords.push({row, col});
          }
        }
        coordsMap.set(cell, {coords: spanCoords[0], spanCoords});

        colIndex += colspan;
      }
    }

    return coordsMap;
  });

  /** A map from a coordinate string to the cell at that coordinate. */
  private readonly _cellMap = computed<Map<CoordString, T>>(() => {
    const cellMap = new Map();
    for (const [cell, {spanCoords}] of this._coordsMap().entries()) {
      for (const {row, col} of spanCoords) {
        cellMap.set(`${row}:${col}`, cell);
      }
    }
    return cellMap;
  });

  /** A map from a row index to the number of columns in that row. */
  private readonly _colCountsByRow = computed<Map<number, number>>(() => {
    const colCountByRow = new Map();
    for (const [_, {spanCoords}] of this._coordsMap().entries()) {
      for (const {row, col} of spanCoords) {
        const colCount = colCountByRow.get(row);
        const newColCount = col + 1;
        if (colCount === undefined || colCount < newColCount) {
          colCountByRow.set(row, newColCount);
        }
      }
    }
    return colCountByRow;
  });

  /** A map from a column index to the number of rows in that column. */
  private readonly _rowCountByCol = computed<Map<number, number>>(() => {
    const rowCountByCol = new Map();
    for (const [_, {spanCoords}] of this._coordsMap().entries()) {
      for (const {row, col} of spanCoords) {
        const rowCount = rowCountByCol.get(col);
        const newRowCount = row + 1;
        if (rowCount === undefined || rowCount < newRowCount) {
          rowCountByCol.set(col, newRowCount);
        }
      }
    }
    return rowCountByCol;
  });

  constructor(readonly inputs: GridDataInputs<T>) {
    this.cells = this.inputs.cells;
  }

  /** Gets the cell at the given coordinates. */
  getCell(rowCol: RowCol): T | undefined {
    return this._cellMap().get(`${rowCol.row}:${rowCol.col}`);
  }

  /** Gets the primary coordinates of the given cell. */
  getCoords(cell: T): RowCol | undefined {
    return this._coordsMap().get(cell)?.coords;
  }

  /** Gets all coordinates that the given cell spans. */
  getAllCoords(cell: T): RowCol[] | undefined {
    return this._coordsMap().get(cell)?.spanCoords;
  }

  /** Gets the number of rows in the given column. */
  getRowCount(col: number): number | undefined {
    return this._rowCountByCol().get(col);
  }

  /** Gets the number of columns in the given row. */
  getColCount(row: number): number | undefined {
    return this._colCountsByRow().get(row);
  }
}
