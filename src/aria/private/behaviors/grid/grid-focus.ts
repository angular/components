/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, signal} from '@angular/core';
import {SignalLike} from '../signal-like/signal-like';
import type {GridData, BaseGridCell, RowCol} from './grid-data';

/** Represents an cell in a grid, such as a grid cell, that may receive focus. */
export interface GridFocusCell extends BaseGridCell {
  /** A unique identifier for the cell. */
  id: SignalLike<string>;

  /** The html element that should receive focus. */
  element: SignalLike<HTMLElement>;

  /** Whether a cell is disabled. */
  disabled: SignalLike<boolean>;
}

/** Represents the required inputs for a grid that contains focusable cells. */
export interface GridFocusInputs {
  /** The focus strategy used by the grid. */
  focusMode: SignalLike<'roving' | 'activedescendant'>;

  /** Whether the grid is disabled. */
  disabled: SignalLike<boolean>;

  /** Whether disabled cells in the grid should be focusable. */
  softDisabled: SignalLike<boolean>;
}

/** Dependencies for the `GridFocus` class. */
interface GridFocusDeps<T extends GridFocusCell> {
  /** The `GridData` instance that this focus manager operates on. */
  grid: GridData<T>;
}

/** Controls focus for a 2D grid of cells. */
export class GridFocus<T extends GridFocusCell> {
  /** The current active cell. */
  readonly activeCell = signal<T | undefined>(undefined);

  /** The current active cell coordinates. */
  readonly activeCoords = signal<RowCol>({row: -1, col: -1});

  /** Whether the grid active state is empty (no active cell or coordinates). */
  readonly stateEmpty = computed(
    () =>
      this.activeCell() === undefined ||
      (this.activeCoords().row === -1 && this.activeCoords().col === -1),
  );

  /**
   * Whether the grid focus state is stale.
   *
   * A stale state means the active cell or coordinates are no longer valid based on the
   * current grid data, for example if the underlying cells have changed.
   * A stale state should be re-initialized.
   */
  readonly stateStale = computed(() => {
    if (this.stateEmpty()) {
      return true;
    }

    const activeCell = this.activeCell();
    const activeCellCoords = this.inputs.grid.getCoords(activeCell!);
    const activeCoords = this.activeCoords();
    const activeCoordsCell = this.inputs.grid.getCell(activeCoords);

    const activeCellNotValid = activeCellCoords === undefined;
    const activeCellMismatch = activeCell !== activeCoordsCell;
    return activeCellNotValid || activeCellMismatch;
  });

  /** The id of the current active cell, for ARIA activedescendant. */
  readonly activeDescendant = computed<string | undefined>(() => {
    if (this.gridDisabled() || this.inputs.focusMode() === 'roving') {
      return undefined;
    }
    const currentActiveCell = this.activeCell();
    return currentActiveCell ? currentActiveCell.id() : undefined;
  });

  /** Whether the grid is in a disabled state. */
  readonly gridDisabled = computed<boolean>(() => {
    if (this.inputs.disabled()) {
      return true;
    }
    const gridCells = this.inputs.grid.cells();
    return gridCells.length === 0 || gridCells.every(row => row.every(cell => cell.disabled()));
  });

  /** The tabindex for the grid container. */
  readonly gridTabIndex = computed<-1 | 0>(() => {
    if (this.gridDisabled()) {
      return 0;
    }
    return this.inputs.focusMode() === 'activedescendant' ? 0 : -1;
  });

  constructor(readonly inputs: GridFocusInputs & GridFocusDeps<T>) {}

  /** Returns the tabindex for the given grid cell cell. */
  getCellTabindex(cell: T): -1 | 0 {
    if (this.gridDisabled()) {
      return -1;
    }
    if (this.inputs.focusMode() === 'activedescendant') {
      return -1;
    }
    return this.activeCell() === cell ? 0 : -1;
  }

  /** Returns true if the given cell can be navigated to. */
  isFocusable(cell: T): boolean {
    return !cell.disabled() || this.inputs.softDisabled();
  }

  /** Focuses the given cell. */
  focusCell(cell: T): boolean {
    if (this.gridDisabled()) {
      return false;
    }

    if (!this.isFocusable(cell)) {
      return false;
    }

    if (this.inputs.grid.getCoords(cell) === undefined) {
      return false;
    }

    this.activeCoords.set(this.inputs.grid.getCoords(cell)!);
    this.activeCell.set(cell);

    return true;
  }

  /** Moves focus to the cell at the given coordinates if it's part of a focusable cell. */
  focusCoordinates(coords: RowCol): boolean {
    if (this.gridDisabled() && !this.inputs.softDisabled()) {
      return false;
    }

    const cell = this.inputs.grid.getCell(coords);

    if (!cell || !this.isFocusable(cell)) {
      return false;
    }

    if (this.inputs.grid.getCell(coords) === undefined) {
      return false;
    }

    this.activeCoords.set(coords);
    this.activeCell.set(this.inputs.grid.getCell(coords));

    return true;
  }
}
