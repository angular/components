/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed} from '@angular/core';
import {SignalLike} from '../signal-like/signal-like';
import {GridFocus, GridFocusCell, GridFocusInputs} from './grid-focus';
import {GridData, RowCol} from './grid-data';

/** A utility type that ensures an object has exactly one key from a given set. */
type ExactlyOneKey<T, K extends keyof T = keyof T> = {
  [P in K]: Record<P, T[P]> & Partial<Record<Exclude<K, P>, never>>;
}[K];

/** Represents a directional change in the grid, either by row or by column. */
type Delta = ExactlyOneKey<{row: -1 | 1; col: -1 | 1}>;

/** Represents an item in a collection, such as a listbox option, than can be navigated to. */
export interface GridNavigationCell extends GridFocusCell {}

/** Represents the required inputs for a collection that has navigable items. */
export interface GridNavigationInputs extends GridFocusInputs {
  /** The wrapping behavior for keyboard navigation along the row axis. */
  rowWrap: SignalLike<'continuous' | 'loop' | 'nowrap'>;

  /** The wrapping behavior for keyboard navigation along the column axis. */
  colWrap: SignalLike<'continuous' | 'loop' | 'nowrap'>;
}

/** Dependencies for the `GridNavigation` class. */
interface GridNavigationDeps<T extends GridNavigationCell> {
  /** The `GridData` instance that this navigation manager operates on. */
  grid: GridData<T>;

  /** The `GridFocus` instance that this navigation manager uses to manage focus. */
  gridFocus: GridFocus<T>;
}

/** Controls navigation for a grid of items. */
export class GridNavigation<T extends GridNavigationCell> {
  /** The maximum number of steps to take when searching for the next cell. */
  private _maxSteps = computed<number>(
    () => this.inputs.grid.maxRowCount() * this.inputs.grid.maxColCount(),
  );

  constructor(readonly inputs: GridNavigationInputs & GridNavigationDeps<T>) {}

  /** Navigates to the given item. */
  gotoCell(cell: T): boolean {
    return this.inputs.gridFocus.focusCell(cell);
  }

  /** Navigates to the given coordinates. */
  gotoCoords(coords: RowCol): boolean {
    return this.inputs.gridFocus.focusCoordinates(coords);
  }

  /** Gets the coordinates of the cell above the given coordinates. */
  peekUp(fromCoords: RowCol): RowCol | undefined {
    return this._peekDirectional({row: -1}, fromCoords, this.inputs.rowWrap());
  }

  /** Navigates to the item above the current item. */
  up(): boolean {
    const nextCoords = this.peekUp(this.inputs.gridFocus.activeCoords());
    return !!nextCoords && this.gotoCoords(nextCoords);
  }

  /** Gets the coordinates of the cell below the given coordinates. */
  peekDown(fromCoords: RowCol): RowCol | undefined {
    return this._peekDirectional({row: 1}, fromCoords, this.inputs.rowWrap());
  }

  /** Navigates to the item below the current item. */
  down(): boolean {
    const nextCoords = this.peekDown(this.inputs.gridFocus.activeCoords());
    return !!nextCoords && this.gotoCoords(nextCoords);
  }

  /** Gets the coordinates of the cell to the left of the given coordinates. */
  peekLeft(fromCoords: RowCol): RowCol | undefined {
    return this._peekDirectional({col: -1}, fromCoords, this.inputs.colWrap());
  }

  /** Navigates to the item to the left of the current item. */
  left(): boolean {
    const nextCoords = this.peekLeft(this.inputs.gridFocus.activeCoords());
    return !!nextCoords && this.gotoCoords(nextCoords);
  }

  /** Gets the coordinates of the cell to the right of the given coordinates. */
  peekRight(fromCoords: RowCol): RowCol | undefined {
    return this._peekDirectional({col: 1}, fromCoords, this.inputs.colWrap());
  }

  /** Navigates to the item to the right of the current item. */
  right(): boolean {
    const nextCoords = this.peekRight(this.inputs.gridFocus.activeCoords());
    return !!nextCoords && this.gotoCoords(nextCoords);
  }

  /**
   * Gets the coordinates of the first focusable cell.
   * If a row is not provided, searches the entire grid.
   */
  peekFirst(row?: number): RowCol | undefined {
    const delta: Delta = {col: 1};
    const startCoords = {
      row: row ?? 0,
      col: -1,
    };
    return row === undefined
      ? this._peekContinuous(delta, startCoords)
      : this._peek(delta, startCoords);
  }

  /**
   * Navigates to the first focusable cell.
   * If a row is not provided, searches the entire grid.
   */
  first(row?: number): boolean {
    const nextCoords = this.peekFirst(row);
    return !!nextCoords && this.gotoCoords(nextCoords);
  }

  /**
   * Gets the coordinates of the last focusable cell.
   * If a row is not provided, searches the entire grid.
   */
  peekLast(row?: number): RowCol | undefined {
    const delta: Delta = {col: -1};
    const startCoords = {
      row: row ?? this.inputs.grid.maxRowCount() - 1,
      col: this.inputs.grid.maxColCount(),
    };
    return row === undefined
      ? this._peekContinuous(delta, startCoords)
      : this._peek(delta, startCoords);
  }

  /**
   * Navigates to the last focusable cell.
   * If a row is not provided, searches the entire grid.
   */
  last(row?: number): boolean {
    const nextCoords = this.peekLast(row);
    return !!nextCoords && this.gotoCoords(nextCoords);
  }

  /**
   * Finds the next focusable cell in a given direction, with continuous wrapping.
   * This means that when the end of a row/column is reached, it wraps to the
   * beginning of the next/previous row/column.
   */
  private _peekContinuous(delta: Delta, startCoords: RowCol): RowCol | undefined {
    const startCell = this.inputs.grid.getCell(startCoords);
    const maxRowCount = this.inputs.grid.maxRowCount();
    const maxColCount = this.inputs.grid.maxColCount();
    const rowDelta = delta.row ?? 0;
    const colDelta = delta.col ?? 0;
    const generalDelta = delta.row ?? delta.col;
    let nextCoords = {...startCoords};

    for (let step = 0; step < this._maxSteps(); step++) {
      const isWrapping =
        nextCoords.col + colDelta < 0 ||
        nextCoords.col + colDelta >= maxColCount ||
        nextCoords.row + rowDelta < 0 ||
        nextCoords.row + rowDelta >= maxRowCount;
      const rowStep = isWrapping ? generalDelta : rowDelta;
      const colStep = isWrapping ? generalDelta : colDelta;

      nextCoords = {
        row: (nextCoords.row + rowStep + maxRowCount) % maxRowCount,
        col: (nextCoords.col + colStep + maxColCount) % maxColCount,
      };

      // Back to original coordinates.
      if (nextCoords.row === startCoords.row && nextCoords.col === startCoords.col) {
        return undefined;
      }

      const nextCell = this.inputs.grid.getCell(nextCoords);
      if (
        nextCell !== undefined &&
        nextCell !== startCell &&
        this.inputs.gridFocus.isFocusable(nextCell)
      ) {
        return nextCoords;
      }
    }

    return undefined;
  }

  /**
   * Finds the next focusable cell in a given direction, with loop wrapping.
   * This means that when the end of a row/column is reached, it wraps to the
   * beginning of the same row/column.
   */
  private _peekLoop(delta: Delta, startCoords: RowCol): RowCol | undefined {
    const startCell = this.inputs.grid.getCell(startCoords);
    const maxRowCount = this.inputs.grid.maxRowCount();
    const maxColCount = this.inputs.grid.maxColCount();
    const rowDelta = delta.row ?? 0;
    const colDelta = delta.col ?? 0;
    let nextCoords = {...startCoords};

    for (let step = 0; step < this._maxSteps(); step++) {
      nextCoords = {
        row: (nextCoords.row + rowDelta + maxRowCount) % maxRowCount,
        col: (nextCoords.col + colDelta + maxColCount) % maxColCount,
      };

      // Back to original coordinates.
      if (nextCoords.row === startCoords.row && nextCoords.col === startCoords.col) {
        return undefined;
      }

      const nextCell = this.inputs.grid.getCell(nextCoords);
      if (
        nextCell !== undefined &&
        nextCell !== startCell &&
        this.inputs.gridFocus.isFocusable(nextCell)
      ) {
        return nextCoords;
      }
    }

    return undefined;
  }

  /**
   * Finds the next focusable cell in a given direction, without wrapping.
   * This means that when the end of a row/column is reached, it stops.
   */
  private _peek(delta: Delta, startCoords: RowCol): RowCol | undefined {
    const startCell = this.inputs.grid.getCell(startCoords);
    const maxRowCount = this.inputs.grid.maxRowCount();
    const maxColCount = this.inputs.grid.maxColCount();
    const rowDelta = delta.row ?? 0;
    const colDelta = delta.col ?? 0;
    let nextCoords = {...startCoords};

    for (let step = 0; step < this._maxSteps(); step++) {
      nextCoords = {
        row: nextCoords.row + rowDelta,
        col: nextCoords.col + colDelta,
      };

      // Out of boundary.
      if (
        nextCoords.row < 0 ||
        nextCoords.row >= maxRowCount ||
        nextCoords.col < 0 ||
        nextCoords.col >= maxColCount
      ) {
        return undefined;
      }

      const nextCell = this.inputs.grid.getCell(nextCoords);
      if (
        nextCell !== undefined &&
        nextCell !== startCell &&
        this.inputs.gridFocus.isFocusable(nextCell)
      ) {
        return nextCoords;
      }
    }

    return undefined;
  }

  /**
   * Finds the next focusable cell in a given direction based on the wrapping behavior.
   */
  private _peekDirectional(
    delta: Delta,
    fromCoords: RowCol,
    wrap: 'continuous' | 'loop' | 'nowrap',
  ): RowCol | undefined {
    switch (wrap) {
      case 'nowrap':
        return this._peek(delta, fromCoords);
      case 'loop':
        return this._peekLoop(delta, fromCoords);
      case 'continuous':
        return this._peekContinuous(delta, fromCoords);
    }
  }
}
