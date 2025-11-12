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

/** Constants for the four cardinal directions. */
export const direction: Record<'Up' | 'Down' | 'Left' | 'Right', Delta> = {
  Up: {row: -1},
  Down: {row: 1},
  Left: {col: -1},
  Right: {col: 1},
} as const;

/** The wrapping behavior for keyboard navigation. */
export type GridWrapStrategy = 'continuous' | 'loop' | 'nowrap';

/** Represents an item in a collection, such as a listbox option, than can be navigated to. */
export interface GridNavigationCell extends GridFocusCell {}

/** Represents the required inputs for a collection that has navigable items. */
export interface GridNavigationInputs extends GridFocusInputs {
  /** The wrapping behavior for keyboard navigation along the row axis. */
  rowWrap: SignalLike<GridWrapStrategy>;

  /** The wrapping behavior for keyboard navigation along the column axis. */
  colWrap: SignalLike<GridWrapStrategy>;
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

  /**
   * Gets the coordinates of the next focusable cell in a given direction, without changing focus.
   */
  peek(
    direction: Delta,
    fromCoords: RowCol,
    wrap?: GridWrapStrategy,
    allowDisabled?: boolean,
  ): RowCol | undefined {
    wrap = wrap ?? (direction.row !== undefined ? this.inputs.rowWrap() : this.inputs.colWrap());
    return this._peekDirectional(direction, fromCoords, wrap, allowDisabled);
  }

  /**
   * Navigates to the next focusable cell in a given direction.
   */
  advance(direction: Delta): boolean {
    const nextCoords = this.peek(direction, this.inputs.gridFocus.activeCoords());
    return !!nextCoords && this.gotoCoords(nextCoords);
  }

  /**
   * Gets the coordinates of the first focusable cell.
   * If a row is not provided, searches the entire grid.
   */
  peekFirst(row?: number, allowDisabled?: boolean): RowCol | undefined {
    const fromCoords = {
      row: row ?? 0,
      col: -1,
    };
    return row === undefined
      ? this._peekDirectional(direction.Right, fromCoords, 'continuous', allowDisabled)
      : this._peekDirectional(direction.Right, fromCoords, 'nowrap', allowDisabled);
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
  peekLast(row?: number, allowDisabled?: boolean): RowCol | undefined {
    const fromCoords = {
      row: row ?? this.inputs.grid.maxRowCount() - 1,
      col: this.inputs.grid.maxColCount(),
    };
    return row === undefined
      ? this._peekDirectional(direction.Left, fromCoords, 'continuous', allowDisabled)
      : this._peekDirectional(direction.Left, fromCoords, 'nowrap', allowDisabled);
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
   * Finds the next focusable cell in a given direction based on the wrapping behavior.
   */
  private _peekDirectional(
    delta: Delta,
    fromCoords: RowCol,
    wrap: GridWrapStrategy,
    allowDisabled: boolean = false,
  ): RowCol | undefined {
    if (this.inputs.gridFocus.gridDisabled()) return undefined;

    const fromCell = this.inputs.grid.getCell(fromCoords);
    const maxRowCount = this.inputs.grid.maxRowCount();
    const maxColCount = this.inputs.grid.maxColCount();
    const rowDelta = delta.row ?? 0;
    const colDelta = delta.col ?? 0;
    let nextCoords = {...fromCoords};

    for (let step = 0; step < this._maxSteps(); step++) {
      const isWrapping =
        nextCoords.col + colDelta < 0 ||
        nextCoords.col + colDelta >= maxColCount ||
        nextCoords.row + rowDelta < 0 ||
        nextCoords.row + rowDelta >= maxRowCount;

      if (wrap === 'nowrap' && isWrapping) return;

      if (wrap === 'continuous') {
        const generalDelta = delta.row ?? delta.col;
        const rowStep = isWrapping ? generalDelta : rowDelta;
        const colStep = isWrapping ? generalDelta : colDelta;

        nextCoords = {
          row: (nextCoords.row + rowStep + maxRowCount) % maxRowCount,
          col: (nextCoords.col + colStep + maxColCount) % maxColCount,
        };
      }

      if (wrap === 'loop') {
        nextCoords = {
          row: (nextCoords.row + rowDelta + maxRowCount) % maxRowCount,
          col: (nextCoords.col + colDelta + maxColCount) % maxColCount,
        };
      }

      if (wrap === 'nowrap') {
        nextCoords = {
          row: nextCoords.row + rowDelta,
          col: nextCoords.col + colDelta,
        };
      }

      // Back to original coordinates.
      if (nextCoords.row === fromCoords.row && nextCoords.col === fromCoords.col) {
        return undefined;
      }

      const nextCell = this.inputs.grid.getCell(nextCoords);
      if (
        nextCell !== undefined &&
        nextCell !== fromCell &&
        (allowDisabled || this.inputs.gridFocus.isFocusable(nextCell))
      ) {
        return nextCoords;
      }
    }

    return undefined;
  }
}
