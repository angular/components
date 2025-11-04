/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, linkedSignal} from '@angular/core';
import {SignalLike} from '../signal-like/signal-like';
import {GridData, BaseGridCell, GridDataInputs, RowCol} from './grid-data';
import {GridFocus, GridFocusCell, GridFocusInputs} from './grid-focus';
import {
  direction,
  GridNavigation,
  GridNavigationCell,
  GridNavigationInputs,
} from './grid-navigation';
import {GridSelectionCell, GridSelectionInputs, GridSelection} from './grid-selection';

/** A type that represents a cell in a grid, combining all cell-related interfaces. */
export type GridCell = BaseGridCell & GridFocusCell & GridNavigationCell & GridSelectionCell;

/** Represents the required inputs for a grid. */
export interface GridInputs<T extends GridCell>
  extends GridDataInputs<T>,
    GridFocusInputs,
    GridNavigationInputs,
    GridSelectionInputs {
  /** Whether selection is enabled for the grid. */
  enableSelection: SignalLike<boolean>;
}

/** The main class that orchestrates the grid behaviors. */
export class Grid<T extends GridCell> {
  /** The underlying data structure for the grid. */
  readonly data: GridData<T>;

  /** Controls focus for the grid. */
  readonly focusBehavior: GridFocus<T>;

  /** Controls navigation for the grid. */
  readonly navigationBehavior: GridNavigation<T>;

  /** Controls selection for the grid. */
  readonly selectionBehavior: GridSelection<T>;

  /** The anchor point for range selection, linked to the active coordinates. */
  readonly selectionAnchor = linkedSignal<RowCol>(() => this.focusBehavior.activeCoords());

  /** The `tab index` for the grid container. */
  readonly gridTabIndex = computed(() => this.focusBehavior.gridTabIndex());

  /** Whether the grid is in a disabled state. */
  readonly gridDisabled = computed(() => this.focusBehavior.gridDisabled());

  /** The ID of the active descendant for ARIA `activedescendant` focus management. */
  readonly activeDescendant = computed(() => this.focusBehavior.activeDescendant());

  constructor(readonly inputs: GridInputs<T>) {
    this.data = new GridData(inputs);
    this.focusBehavior = new GridFocus({...inputs, grid: this.data});
    this.navigationBehavior = new GridNavigation({
      ...inputs,
      grid: this.data,
      gridFocus: this.focusBehavior,
    });
    this.selectionBehavior = new GridSelection({
      ...inputs,
      grid: this.data,
      gridFocus: this.focusBehavior,
    });
  }

  /** Gets the 1-based row index of a cell. */
  rowIndex(cell: T): number | undefined {
    const index = this.data.getCoords(cell)?.row;
    return index !== undefined ? index + 1 : undefined;
  }

  /** Gets the 1-based column index of a cell. */
  colIndex(cell: T): number | undefined {
    const index = this.data.getCoords(cell)?.col;
    return index !== undefined ? index + 1 : undefined;
  }

  /** Gets the `tab index` for a given cell. */
  cellTabIndex(cell: T): -1 | 0 {
    return this.focusBehavior.getCellTabIndex(cell);
  }

  /** Navigates to the cell above the currently active cell. */
  up(): boolean {
    return this.navigationBehavior.advance(direction.Up);
  }

  /** Extends the selection to the cell above the selection anchor. */
  rangeSelectUp(): void {
    const coords = this.navigationBehavior.peek(direction.Up, this.selectionAnchor());
    if (coords === undefined) return;

    this._rangeSelectCoords(coords);
  }

  /** Navigates to the cell below the currently active cell. */
  down(): boolean {
    return this.navigationBehavior.advance(direction.Down);
  }

  /** Extends the selection to the cell below the selection anchor. */
  rangeSelectDown(): void {
    const coords = this.navigationBehavior.peek(direction.Down, this.selectionAnchor());
    if (coords === undefined) return;

    this._rangeSelectCoords(coords);
  }

  /** Navigates to the cell to the left of the currently active cell. */
  left(): boolean {
    return this.navigationBehavior.advance(direction.Left);
  }

  /** Extends the selection to the cell to the left of the selection anchor. */
  rangeSelectLeft(): void {
    const coords = this.navigationBehavior.peek(direction.Left, this.selectionAnchor());
    if (coords === undefined) return;

    this._rangeSelectCoords(coords);
  }

  /** Navigates to the cell to the right of the currently active cell. */
  right(): boolean {
    return this.navigationBehavior.advance(direction.Right);
  }

  /** Extends the selection to the cell to the right of the selection anchor. */
  rangeSelectRight(): void {
    const coords = this.navigationBehavior.peek(direction.Right, this.selectionAnchor());
    if (coords === undefined) return;

    this._rangeSelectCoords(coords);
  }

  /** Navigates to the first focusable cell in the grid. */
  first(): boolean {
    return this.navigationBehavior.first();
  }

  /** Navigates to the first focusable cell in the current row. */
  firstInRow(): boolean {
    return this.navigationBehavior.first(this.focusBehavior.activeCoords().row);
  }

  /** Navigates to the last focusable cell in the grid. */
  last(): boolean {
    return this.navigationBehavior.last();
  }

  /** Navigates to the last focusable cell in the current row. */
  lastInRow(): boolean {
    return this.navigationBehavior.last(this.focusBehavior.activeCoords().row);
  }

  /** Selects all cells in the current row. */
  selectRow(): void {
    const row = this.focusBehavior.activeCoords().row;
    this.selectionBehavior.deselectAll();
    this.selectionBehavior.select({row, col: 0}, {row, col: this.data.maxColCount()});
  }

  /** Selects all cells in the current column. */
  selectCol(): void {
    const col = this.focusBehavior.activeCoords().col;
    this.selectionBehavior.deselectAll();
    this.selectionBehavior.select({row: 0, col}, {row: this.data.maxRowCount(), col});
  }

  /** Selects all selectable cells in the grid. */
  selectAll(): void {
    this.selectionBehavior.selectAll();
  }

  /** Navigates to and focuses the given cell. */
  gotoCell(cell: T): boolean {
    return this.navigationBehavior.gotoCell(cell);
  }

  /** Toggles the selection state of the given cell. */
  toggleSelect(cell: T): void {
    const coords = this.data.getCoords(cell);
    if (coords === undefined) return;

    this.selectionBehavior.toggle(coords);
  }

  /** Extends the selection from the anchor to the given cell. */
  rangeSelect(cell: T): void {
    const coords = this.data.getCoords(cell);
    if (coords === undefined) return;

    this._rangeSelectCoords(coords);
  }

  /** Extends the selection to the given coordinates. */
  private _rangeSelectCoords(coords: RowCol): void {
    const activeCell = this.focusBehavior.activeCell();
    const anchorCell = this.data.getCell(coords);
    if (activeCell === undefined || anchorCell === undefined) {
      return;
    }

    const allCoords = [
      ...this.data.getAllCoords(activeCell)!,
      ...this.data.getAllCoords(anchorCell)!,
    ];
    const allRows = allCoords.map(c => c.row);
    const allCols = allCoords.map(c => c.col);
    const fromCoords = {
      row: Math.min(...allRows),
      col: Math.min(...allCols),
    };
    const toCoords = {
      row: Math.max(...allRows),
      col: Math.max(...allCols),
    };

    this.selectionBehavior.deselectAll();
    this.selectionBehavior.select(fromCoords, toCoords);
    this.selectionAnchor.set(coords);
  }

  /** Resets the active state of the grid if it is empty or stale. */
  resetState(): boolean {
    if (this.focusBehavior.stateEmpty()) {
      const firstFocusableCoords = this.navigationBehavior.peekFirst();
      if (firstFocusableCoords === undefined) {
        return false;
      }

      return this.focusBehavior.focusCoordinates(firstFocusableCoords);
    }

    if (this.focusBehavior.stateStale()) {
      // Try focus on the same active cell after if a reordering happened.
      if (this.focusBehavior.focusCell(this.focusBehavior.activeCell()!)) {
        return true;
      }

      // If the active cell is no longer exist, focus on the coordinates instead.
      if (this.focusBehavior.focusCoordinates(this.focusBehavior.activeCoords())) {
        return true;
      }

      // If the cooridnates no longer valid, go back to the first available cell.
      if (this.focusBehavior.focusCoordinates(this.navigationBehavior.peekFirst()!)) {
        return true;
      }
    }

    return false;
  }
}
