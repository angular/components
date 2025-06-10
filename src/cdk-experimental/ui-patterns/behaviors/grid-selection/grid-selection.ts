/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {signal} from '@angular/core';
import {SignalLike, WritableSignalLike} from '../signal-like/signal-like';
import {GridFocus, GridFocusCell, GridFocusInputs, RowCol} from '../grid-focus/grid-focus';

/** Represents a cell in a grid that can be selected. */
export interface GridSelectionCell<V> extends GridFocusCell {
  /** The value of the item. */
  value: SignalLike<V>;
}

/** Represents the required inputs for a grid that contains selectable cells. */
export interface GridSelectionInputs<T extends GridSelectionCell<V>, V> extends GridFocusInputs<T> {
  /** Whether multiple cells in the grid can be selected at once. */
  multi: SignalLike<boolean>;

  /** The current value of the grid selection (an array of the selected item values). */
  value: WritableSignalLike<V[]>;

  /** The selection strategy used by the grid. */
  selectionMode: SignalLike<'follow' | 'explicit'>;
}

/** Controls selection for a 2D grid of cells. */
export class GridSelection<T extends GridSelectionCell<V>, V> {
  /** The start coordinates to use for range selection. */
  rangeStartCoords = signal<RowCol | null>(null);

  /** The end coordinates to use for range selection. */
  rangeEndCoords = signal<RowCol | null>(null);

  constructor(readonly inputs: GridSelectionInputs<T, V> & {focusManager: GridFocus<T>}) {}

  /** Selects the item at the current active coordinates. */
  select(item?: T, opts = {anchor: true}) {
    item = item ?? this.inputs.focusManager.activeCell();

    if (!item || item.disabled() || this.inputs.value().includes(item.value())) {
      return;
    }

    const currentItemCoords = this.inputs.focusManager.getCoordinates(item);
    if (!currentItemCoords) return;

    if (opts.anchor) {
      this.beginRangeSelection(currentItemCoords);
    }
    this.inputs.value.update(values => [...values, item.value()]);
  }

  /** Deselects the given item, or the current active item if not provided. */
  deselect(item?: T) {
    item = item ?? (this.inputs.focusManager.activeCell() as T);

    if (item && !item.disabled()) {
      this.inputs.value.update(values => values.filter(value => value !== item.value()));
    }
  }

  /** Toggles selection for the item at the current active coordinates. */
  toggle() {
    const item = this.inputs.focusManager.activeCell();
    if (!item) return;
    this.inputs.value().includes(item.value()) ? this.deselect(item) : this.select(item);
  }

  /** Toggles only the item at the current active coordinates (selects it if not selected, deselects if selected). */
  toggleOne() {
    const item = this.inputs.focusManager.activeCell();
    if (!item) return;

    if (this.inputs.value().includes(item.value())) {
      this.deselect(item);
    } else {
      this.deselectAll();
      this.select(item, {anchor: true});
    }
  }

  /** Deselects all items in the grid. */
  deselectAll() {
    for (const row of this.inputs.cells()) {
      for (const cell of row) {
        this.deselect(cell);
      }
    }
  }

  /** Sets the selection to only the current active item. */
  selectOne() {
    const item = this.inputs.focusManager.activeCell();
    if (!item) return;

    this.deselectAll();
    this.select(item, {anchor: true});
  }

  /** Marks the given coordinates as the start of a range selection. */
  beginRangeSelection(coords?: RowCol) {
    coords = coords ?? this.inputs.activeCoords();
    if (!coords) {
      this.rangeStartCoords.set(null);
      this.rangeEndCoords.set(null);
      return;
    }
    this.rangeStartCoords.set(coords);
    this.rangeEndCoords.set(coords);
  }

  /** Selects all non-disabled items in the grid. */
  selectAll() {
    const allItems: T[] = this.inputs.cells().flat();

    for (const item of allItems) {
      if (!item.disabled() && !this.inputs.value().includes(item.value())) {
        this.inputs.value.update(values => [...values, item.value()]);
      }
    }

    const focusableItems = allItems.filter(item => !item.disabled());
    if (focusableItems.length > 0) {
      const firstCoords = this.inputs.focusManager.getCoordinates(focusableItems[0]);

      const lastCoords = this.inputs.focusManager.getCoordinates(
        focusableItems[focusableItems.length - 1],
      );

      if (firstCoords) this.rangeStartCoords.set(firstCoords);
      if (lastCoords) this.rangeEndCoords.set(lastCoords);

      if (focusableItems.length === 1 && firstCoords) this.rangeEndCoords.set(firstCoords);
    } else {
      this.rangeStartCoords.set(null);
      this.rangeEndCoords.set(null);
    }
  }

  /**
   * Selects all items in the grid if not all are already selected,
   * otherwise deselects all items.
   */
  toggleAll() {
    const selectableItemValues = this.inputs
      .cells()
      .flat()
      .filter(item => !item.disabled())
      .map(item => item.value());

    const allSelected = selectableItemValues.every(itemValue =>
      this.inputs.value().includes(itemValue),
    );

    allSelected ? this.deselectAll() : this.selectAll();
  }

  /**
   * Selects all items within the rectangular range defined by `rangeStartCoords`
   * and the current `activeCoords`.
   * Deselects items previously in range but now out of range if anchor moves.
   */
  selectRange(opts = {anchor: true}) {
    const startCoords = this.rangeStartCoords();
    const currentActiveCoords = this.inputs.activeCoords();

    if (!startCoords || !currentActiveCoords) {
      return;
    }

    const newEndCoords = currentActiveCoords;
    const oldEndCoords = this.rangeEndCoords();

    const itemsInNewRange = this._getItemsInRect(startCoords, newEndCoords);

    const itemsInOldRange = oldEndCoords ? this._getItemsInRect(startCoords, oldEndCoords) : [];

    for (const item of itemsInOldRange) {
      if (!itemsInNewRange.includes(item)) {
        this.deselect(item);
      }
    }

    for (const item of itemsInNewRange) {
      this.select(item, {anchor: false});
    }

    this.rangeEndCoords.set(newEndCoords);
  }

  /**
   * Returns unique items within the rectangular area defined by start and end coordinates.
   * The coordinates are inclusive.
   */
  private _getItemsInRect(startCoords: RowCol, endCoords: RowCol): T[] {
    if (!startCoords || !endCoords) {
      return [];
    }

    const minRow = Math.min(startCoords.row, endCoords.row);
    const maxRow = Math.max(startCoords.row, endCoords.row);
    const minCol = Math.min(startCoords.col, endCoords.col);
    const maxCol = Math.max(startCoords.col, endCoords.col);

    const itemsInRect = new Set<T>();
    const allCells = this.inputs.cells();

    allCells.flat().forEach(cell => {
      const cellStartRow = cell.rowindex();
      const cellStartCol = cell.colindex();

      const cellEndRow = cellStartRow + cell.rowspan() - 1;
      const cellEndCol = cellStartCol + cell.colspan() - 1;

      const overlaps =
        cellStartRow <= maxRow &&
        cellEndRow >= minRow &&
        cellStartCol <= maxCol &&
        cellEndCol >= minCol;

      if (overlaps && !cell.disabled()) {
        itemsInRect.add(cell);
      }
    });

    return Array.from(itemsInRect);
  }
}
