/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {GridData, BaseGridCell, GridDataInputs, RowCol} from './grid-data';
import {GridFocus, GridFocusCell, GridFocusInputs} from './grid-focus';
import {
  direction,
  GridNavigation,
  GridNavigationCell,
  GridNavigationInputs,
} from './grid-navigation';
import {GridSelectionCell, GridSelectionInputs, GridSelection} from './grid-selection';
import {computed, linkedSignal, signal, SignalLike} from '../signal-like/signal-like';

/** The selection operations that can be performed after a navigation operation. */
export interface NavOptions {
  /** Toggles the selection state of the active cell. */
  toggle?: boolean;

  /**
   * Toggles the selection state of the active cell, and deselects all other cells if the
   * active cell is selected. If the active cell is the only selected cell, it will be deselected.
   */
  toggleOne?: boolean;

  /** Selects the active cell, preserving the selection state of other cells. */
  select?: boolean;

  /** Deselects all other cells and selects the active cell. */
  selectOne?: boolean;

  /**
   * Moves the selection anchor to the active cell and updates the selection to include all
   * cells between the anchor and the active cell.
   */
  anchor?: boolean;
}

/** A type that represents a cell in a grid, combining all cell-related interfaces. */
export type GridCell = BaseGridCell & GridFocusCell & GridNavigationCell & GridSelectionCell;

/** Represents the required inputs for a grid. */
export type GridInputs<T extends GridCell> = GridDataInputs<T> &
  GridFocusInputs &
  GridNavigationInputs &
  GridSelectionInputs;

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

  /** The cell at the selection anchor. */
  readonly selectionAnchorCell = computed(() => this.data.getCell(this.selectionAnchor()));

  /** Whether a range selection has settled. */
  readonly selectionStabled = signal(true);

  /** Whether all selectable cells are selected. */
  readonly allSelected: SignalLike<boolean> = computed(() =>
    this.data
      .cells()
      .flat()
      .filter(c => this.selectionBehavior.isSelectable(c))
      .every(c => c.selected()),
  );

  /** The tab index for the grid container. */
  readonly gridTabIndex: SignalLike<-1 | 0> = () => this.focusBehavior.gridTabIndex();

  /** Whether the grid is in a disabled state. */
  readonly gridDisabled: SignalLike<boolean> = () => this.focusBehavior.gridDisabled();

  /** The ID of the active descendant for ARIA `activedescendant` focus management. */
  readonly activeDescendant: SignalLike<string | undefined> = () =>
    this.focusBehavior.activeDescendant();

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

  /** Gets the tab index for a given cell. */
  cellTabIndex(cell: T): -1 | 0 {
    return this.focusBehavior.getCellTabIndex(cell);
  }

  /** Navigates to the cell above the currently active cell. */
  up(opts: NavOptions = {}): boolean {
    return this._navigateWithSelection(
      () =>
        opts.anchor
          ? this._updateSelectionAnchor(() =>
              this.navigationBehavior.peek(direction.Up, this.selectionAnchor(), 'nowrap', true),
            )
          : this.navigationBehavior.advance(direction.Up),
      opts,
    );
  }

  /** Navigates to the cell below the currently active cell. */
  down(opts: NavOptions = {}): boolean {
    return this._navigateWithSelection(
      () =>
        opts.anchor
          ? this._updateSelectionAnchor(() =>
              this.navigationBehavior.peek(direction.Down, this.selectionAnchor(), 'nowrap', true),
            )
          : this.navigationBehavior.advance(direction.Down),
      opts,
    );
  }

  /** Navigates to the cell to the left of the currently active cell. */
  left(opts: NavOptions = {}): boolean {
    return this._navigateWithSelection(
      () =>
        opts.anchor
          ? this._updateSelectionAnchor(() =>
              this.navigationBehavior.peek(direction.Left, this.selectionAnchor(), 'nowrap', true),
            )
          : this.navigationBehavior.advance(direction.Left),
      opts,
    );
  }

  /** Navigates to the cell to the right of the currently active cell. */
  right(opts: NavOptions = {}): boolean {
    return this._navigateWithSelection(
      () =>
        opts.anchor
          ? this._updateSelectionAnchor(() =>
              this.navigationBehavior.peek(direction.Right, this.selectionAnchor(), 'nowrap', true),
            )
          : this.navigationBehavior.advance(direction.Right),
      opts,
    );
  }

  /** Navigates to the first focusable cell in the grid. */
  first(opts: NavOptions = {}): boolean {
    return this._navigateWithSelection(
      () =>
        opts.anchor
          ? this._updateSelectionAnchor(() => this.navigationBehavior.peekFirst(undefined, true))
          : this.navigationBehavior.first(),
      opts,
    );
  }

  /** Navigates to the first focusable cell in the current row. */
  firstInRow(opts: NavOptions = {}): boolean {
    const row = this.focusBehavior.activeCoords().row;
    return this._navigateWithSelection(
      () =>
        opts.anchor
          ? this._updateSelectionAnchor(() => this.navigationBehavior.peekFirst(row, true))
          : this.navigationBehavior.first(row),
      opts,
    );
  }

  /** Navigates to the last focusable cell in the grid. */
  last(opts: NavOptions = {}): boolean {
    return this._navigateWithSelection(
      () =>
        opts.anchor
          ? this._updateSelectionAnchor(() => this.navigationBehavior.peekLast(undefined, true))
          : this.navigationBehavior.last(),
      opts,
    );
  }

  /** Navigates to the last focusable cell in the current row. */
  lastInRow(opts: NavOptions = {}): boolean {
    const row = this.focusBehavior.activeCoords().row;
    return this._navigateWithSelection(
      () =>
        opts.anchor
          ? this._updateSelectionAnchor(() => this.navigationBehavior.peekLast(row, true))
          : this.navigationBehavior.last(row),
      opts,
    );
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

  /** Selects the active cell. */
  select(): void {
    this.selectionBehavior.select(this.focusBehavior.activeCoords());
  }

  /** Deselects the active cell. */
  deselect(): void {
    this.selectionBehavior.deselect(this.focusBehavior.activeCoords());
  }

  /**
   * Toggles the selection state of the coordinates of the given cell
   * or the current active coordinates.
   */
  toggle(): void {
    this.selectionBehavior.toggle(this.focusBehavior.activeCoords());
  }

  /** Toggles the selection state of the active cell, and deselects all other cells. */
  toggleOne(): void {
    const selected = !!this.focusBehavior.activeCell()?.selected();
    if (selected) {
      this.deselect();
      return;
    }

    this.deselectAll();
    this.select();
  }

  /** Selects all selectable cells in the grid. */
  selectAll(): void {
    this.selectionBehavior.selectAll();
  }

  /** Deselects all cells in the grid. */
  deselectAll(): void {
    this.selectionBehavior.deselectAll();
  }

  /** Navigates to and focuses the given cell. */
  gotoCell(cell: T, opts: NavOptions = {}): boolean {
    return this._navigateWithSelection(
      () =>
        opts.anchor
          ? this._updateSelectionAnchor(() => this.data.getCoords(cell))
          : this.navigationBehavior.gotoCell(cell),
      opts,
    );
  }

  /** Sets the default active state of the grid. */
  setDefaultState(): boolean {
    // Try to find a selected cell that's focusable.
    const focusableSelectedCell: T | undefined = this.data
      .cells()
      .flat()
      .filter(c => this.focusBehavior.isFocusable(c))
      .find(c => c.selected());

    if (focusableSelectedCell !== undefined) {
      this.focusBehavior.focusCell(focusableSelectedCell);
      return true;
    }

    // Otherwise find the first focusable cell.
    const firstFocusableCoords = this.navigationBehavior.peekFirst();

    if (firstFocusableCoords !== undefined) {
      return this.focusBehavior.focusCoordinates(firstFocusableCoords);
    }

    return false;
  }

  /** Resets the active state of the grid if it is empty or stale. */
  resetState(): boolean {
    if (this.focusBehavior.stateEmpty()) {
      return this.setDefaultState();
    }

    if (this.focusBehavior.stateStale()) {
      const activeCell = this.focusBehavior.activeCell();
      const activeCoords = this.focusBehavior.activeCoords();

      // Try focus on the same active cell after if a reordering happened.
      if (activeCell && this.focusBehavior.focusCell(activeCell)) {
        return true;
      }

      // If the active cell is no longer exist, focus on the coordinates instead.
      if (this.focusBehavior.focusCoordinates(activeCoords)) {
        return true;
      }

      // If the coordinates are no longer valid (e.g. because the row was deleted at the end),
      // try to focus on the previous row focusing on the same column.
      const maxRow = this.data.maxRowCount() - 1;
      const targetRow = Math.min(activeCoords.row, maxRow);

      if (targetRow >= 0) {
        // Try same column in the clamped row.
        if (this.focusBehavior.focusCoordinates({row: targetRow, col: activeCoords.col})) {
          return true;
        }

        // If that fails, try to find ANY cell in that row.
        const firstInRow = this.navigationBehavior.peekFirst(targetRow);
        if (firstInRow !== undefined && this.focusBehavior.focusCoordinates(firstInRow)) {
          return true;
        }
      }

      // If the coordinates no longer valid, go back to the first available cell.
      const firstAvailable = this.navigationBehavior.peekFirst();
      if (firstAvailable !== undefined && this.focusBehavior.focusCoordinates(firstAvailable)) {
        return true;
      }

      this.focusBehavior.activeCell.set(undefined);
      this.focusBehavior.activeCoords.set({row: -1, col: -1});
    }

    return false;
  }

  /** Updates the selection anchor to the given coordinates. */
  private _updateSelectionAnchor(peekFn: () => RowCol | undefined): boolean {
    const coords = peekFn();
    const success = coords !== undefined;
    if (!success) return false;
    this.selectionAnchor.set(coords);
    return success;
  }

  /** Updates the selection to include all cells between the anchor and the active cell. */
  private _updateRangeSelection(): void {
    if (!this.selectionStabled()) {
      this.selectionBehavior.undo();
    }
    this.selectionBehavior.select(
      ...this._getSelectionCoords(this.focusBehavior.activeCoords(), this.selectionAnchor()),
    );
  }

  /** Gets the start and end coordinates for a selection range. */
  private _getSelectionCoords(startCoords: RowCol, endCoords: RowCol): [RowCol, RowCol] {
    const startCell = this.data.getCell(startCoords)!;
    const endCell = this.data.getCell(endCoords)!;
    const allCoords = [...this.data.getAllCoords(startCell)!, ...this.data.getAllCoords(endCell)!];
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

    return [fromCoords, toCoords];
  }

  /** Executes a navigation operation and applies selection options. */
  private _navigateWithSelection(op: () => boolean, opts: NavOptions = {}): boolean {
    const success = op();
    if (!success) return false;

    if (opts.anchor) {
      this._updateRangeSelection();
      this.selectionStabled.set(false);
      return success;
    }

    // Selection becomes stable after the active cell/coords moved.
    this.selectionStabled.set(true);

    if (opts.select) {
      this.select();
      return success;
    }

    if (opts.selectOne) {
      this.deselectAll();
      this.select();
      return success;
    }

    if (opts.toggle) {
      this.toggle();
      return success;
    }

    if (opts.toggleOne) {
      const selected = !!this.focusBehavior.activeCell()?.selected();
      this.deselectAll();
      if (!selected) {
        this.select();
      }
      return success;
    }

    return success;
  }
}
