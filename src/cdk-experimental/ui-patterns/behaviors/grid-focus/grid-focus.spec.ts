/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, Signal, signal, WritableSignal} from '@angular/core';
import {GridFocus, GridFocusInputs, GridFocusCell} from './grid-focus';

// Helper type for test cells, extending GridFocusCell
interface TestGridCell extends GridFocusCell {
  id: WritableSignal<string>;
  element: WritableSignal<HTMLElement>;
  disabled: WritableSignal<boolean>;
}

// Helper type for configuring GridFocus inputs in tests
type TestSetupInputs = Partial<GridFocusInputs<TestGridCell>> & {
  numRows?: number;
  numCols?: number;
  gridFocus?: WritableSignal<GridFocus<TestGridCell> | undefined>;
};

function createTestCell(
  gridFocus: Signal<GridFocus<TestGridCell> | undefined>,
  opts: {id: string; rowspan?: number; colspan?: number},
): TestGridCell {
  const el = document.createElement('div');
  spyOn(el, 'focus').and.callThrough();
  let coordinates: Signal<{row: number; column: number}> = signal({row: -1, column: -1});
  const cell: TestGridCell = {
    id: signal(opts.id),
    element: signal(el as HTMLElement),
    disabled: signal(false),
    rowspan: signal(opts.rowspan ?? 1),
    colspan: signal(opts.rowspan ?? 1),
    rowindex: signal(-1),
    colindex: signal(-1),
  };
  coordinates = computed(() => gridFocus()?.getCoordinates(cell) ?? {row: -1, column: -1});
  cell.rowindex = computed(() => coordinates().row);
  cell.colindex = computed(() => coordinates().column);
  return cell;
}

function createTestCells(
  gridFocus: Signal<GridFocus<TestGridCell> | undefined>,
  numRows: number,
  numCols: number,
): WritableSignal<TestGridCell[][]> {
  return signal(
    Array.from({length: numRows}).map((_, r) =>
      Array.from({length: numCols}).map((_, c) => {
        return createTestCell(gridFocus, {id: `cell-${r}-${c}`});
      }),
    ),
  );
}

// Main helper function to instantiate GridFocus and its dependencies for testing
function setupGridFocus(inputs: TestSetupInputs = {}): {
  cells: TestGridCell[][];
  gridFocus: GridFocus<TestGridCell>;
} {
  const numRows = inputs.numRows ?? 3;
  const numCols = inputs.numCols ?? 3;

  const gridFocus = inputs.gridFocus ?? signal<GridFocus<TestGridCell> | undefined>(undefined);
  const cells = inputs.cells ?? createTestCells(gridFocus, numRows, numCols);

  const activeCoords = inputs.activeCoords ?? signal({row: 0, column: 0});
  const focusMode = signal<'roving' | 'activedescendant'>(
    inputs.focusMode ? inputs.focusMode() : 'roving',
  );
  const disabled = signal(inputs.disabled ? inputs.disabled() : false);
  const skipDisabled = signal(inputs.skipDisabled ? inputs.skipDisabled() : true);

  gridFocus.set(
    new GridFocus<TestGridCell>({
      cells: cells,
      activeCoords: activeCoords,
      focusMode: focusMode,
      disabled: disabled,
      skipDisabled: skipDisabled,
    }),
  );

  return {
    cells: cells(),
    gridFocus: gridFocus()!,
  };
}

describe('GridFocus', () => {
  describe('Initialization', () => {
    it('should initialize with activeCell at {row: 0, column: 0} by default', () => {
      const {gridFocus} = setupGridFocus();
      expect(gridFocus.inputs.activeCoords()).toEqual({row: 0, column: 0});
    });

    it('should compute activeCell based on activeCell', () => {
      const {gridFocus, cells} = setupGridFocus({
        activeCoords: signal({row: 1, column: 1}),
      });
      expect(gridFocus.activeCell()).toBe(cells[1][1]);
    });

    it('should compute activeCell correctly when rowspan and colspan are set', () => {
      const activeCoords = signal({row: 0, column: 0});
      const gridFocusSignal = signal<GridFocus<TestGridCell> | undefined>(undefined);

      // Visualization of this irregular grid.
      //
      //   +---+---+---+
      //   |       |0,2|
      //   +  0,0  +---+
      //   |       |1,2|
      //   +---+---+---+
      //
      const cell_0_0 = createTestCell(gridFocusSignal, {id: `cell-0-0`, rowspan: 2, colspan: 2});
      const cell_0_2 = createTestCell(gridFocusSignal, {id: `cell-0-2`});
      const cell_1_2 = createTestCell(gridFocusSignal, {id: `cell-1-2`});
      const cells = signal<TestGridCell[][]>([[cell_0_0, cell_0_2], [cell_1_2]]);

      const {gridFocus} = setupGridFocus({
        cells,
        activeCoords,
        gridFocus: gridFocusSignal,
      });

      activeCoords.set({row: 0, column: 0});
      expect(gridFocus.activeCell()).toBe(cell_0_0);
      activeCoords.set({row: 0, column: 1});
      expect(gridFocus.activeCell()).toBe(cell_0_0);
      activeCoords.set({row: 1, column: 0});
      expect(gridFocus.activeCell()).toBe(cell_0_0);
      activeCoords.set({row: 1, column: 1});
      expect(gridFocus.activeCell()).toBe(cell_0_0);

      activeCoords.set({row: 0, column: 2});
      expect(gridFocus.activeCell()).toBe(cell_0_2);

      activeCoords.set({row: 1, column: 2});
      expect(gridFocus.activeCell()).toBe(cell_1_2);
    });
  });

  describe('isGridDisabled()', () => {
    it('should return true if inputs.disabled is true', () => {
      const {gridFocus} = setupGridFocus({disabled: signal(true)});
      expect(gridFocus.isGridDisabled()).toBeTrue();
    });

    it('should return true if all cells are disabled', () => {
      const {gridFocus, cells} = setupGridFocus({numRows: 2, numCols: 1});
      cells.forEach(row => row.forEach(cell => cell.disabled.set(true)));
      expect(gridFocus.isGridDisabled()).toBeTrue();
    });

    it('should return true if inputs.cells is empty', () => {
      const {gridFocus} = setupGridFocus({numRows: 0, numCols: 0});
      expect(gridFocus.isGridDisabled()).toBeTrue();
    });

    it('should return true if the grid contains only empty rows', () => {
      const cells = signal<TestGridCell[][]>([[], []]);
      const {gridFocus} = setupGridFocus({cells: cells});
      expect(gridFocus.isGridDisabled()).toBeTrue();
    });
  });

  describe('getActiveDescendant()', () => {
    it('should return undefined if focusMode is "roving"', () => {
      const {gridFocus} = setupGridFocus({focusMode: signal('roving')});
      expect(gridFocus.getActiveDescendant()).toBeUndefined();
    });

    it('should return undefined if the grid is disabled', () => {
      const {gridFocus} = setupGridFocus({
        disabled: signal(true),
        focusMode: signal('activedescendant'),
      });
      expect(gridFocus.getActiveDescendant()).toBeUndefined();
    });

    it('should return the activeCell id if focusMode is "activedescendant"', () => {
      const {gridFocus, cells} = setupGridFocus({
        focusMode: signal('activedescendant'),
        activeCoords: signal({row: 2, column: 2}),
      });
      expect(gridFocus.getActiveDescendant()).toBe(cells[2][2].id());
    });
  });

  describe('getGridTabindex()', () => {
    it('should return 0 if grid is disabled', () => {
      const {gridFocus} = setupGridFocus({disabled: signal(true)});
      expect(gridFocus.getGridTabindex()).toBe(0);
    });

    it('should return -1 if focusMode is "roving" and grid is not disabled', () => {
      const {gridFocus} = setupGridFocus({focusMode: signal('roving')});
      expect(gridFocus.getGridTabindex()).toBe(-1);
    });

    it('should return 0 if focusMode is "activedescendant" and grid is not disabled', () => {
      const {gridFocus} = setupGridFocus({focusMode: signal('activedescendant')});
      expect(gridFocus.getGridTabindex()).toBe(0);
    });
  });

  describe('getCellTabindex(cell)', () => {
    it('should return -1 if grid is disabled', () => {
      const {gridFocus, cells} = setupGridFocus({
        numRows: 1,
        numCols: 3,
        disabled: signal(true),
      });
      expect(gridFocus.getCellTabindex(cells[0][0])).toBe(-1);
      expect(gridFocus.getCellTabindex(cells[0][1])).toBe(-1);
      expect(gridFocus.getCellTabindex(cells[0][2])).toBe(-1);
    });

    it('should return -1 if focusMode is "activedescendant"', () => {
      const {gridFocus, cells} = setupGridFocus({
        numRows: 1,
        numCols: 3,
        focusMode: signal('activedescendant'),
      });
      expect(gridFocus.getCellTabindex(cells[0][0])).toBe(-1);
      expect(gridFocus.getCellTabindex(cells[0][1])).toBe(-1);
      expect(gridFocus.getCellTabindex(cells[0][2])).toBe(-1);
    });

    it('should return 0 if focusMode is "roving" and cell is the activeCell', () => {
      const {gridFocus, cells} = setupGridFocus({
        numRows: 1,
        numCols: 3,
        focusMode: signal('roving'),
      });

      expect(gridFocus.getCellTabindex(cells[0][0])).toBe(0);
      expect(gridFocus.getCellTabindex(cells[0][1])).toBe(-1);
      expect(gridFocus.getCellTabindex(cells[0][2])).toBe(-1);
    });
  });

  describe('isFocusable(cell)', () => {
    it('should return true if cell is not disabled', () => {
      const {gridFocus, cells} = setupGridFocus({
        numRows: 1,
        numCols: 3,
      });
      expect(gridFocus.isFocusable(cells[0][0])).toBeTrue();
      expect(gridFocus.isFocusable(cells[0][1])).toBeTrue();
      expect(gridFocus.isFocusable(cells[0][2])).toBeTrue();
    });

    it('should return false if cell is disabled and skipDisabled is true', () => {
      const {gridFocus, cells} = setupGridFocus({
        numRows: 1,
        numCols: 3,
        skipDisabled: signal(true),
      });
      cells[0][1].disabled.set(true);
      expect(gridFocus.isFocusable(cells[0][0])).toBeTrue();
      expect(gridFocus.isFocusable(cells[0][1])).toBeFalse();
      expect(gridFocus.isFocusable(cells[0][2])).toBeTrue();
    });

    it('should return true if cell is disabled but skipDisabled is false', () => {
      const {gridFocus, cells} = setupGridFocus({
        numRows: 1,
        numCols: 3,
        skipDisabled: signal(false),
      });
      cells[0][1].disabled.set(true);
      expect(gridFocus.isFocusable(cells[0][0])).toBeTrue();
      expect(gridFocus.isFocusable(cells[0][1])).toBeTrue();
      expect(gridFocus.isFocusable(cells[0][2])).toBeTrue();
    });
  });

  describe('focus(cell)', () => {
    it('should return false and not change state if grid is disabled', () => {
      const activeCoords = signal({row: 0, column: 0});
      const {gridFocus, cells} = setupGridFocus({
        activeCoords,
        disabled: signal(true),
      });

      const success = gridFocus.focus({row: 1, column: 0});

      expect(success).toBeFalse();
      expect(activeCoords()).toEqual({row: 0, column: 0});
      expect(cells[1][0].element().focus).not.toHaveBeenCalled();
    });

    it('should return false and not change state if cell is not focusable', () => {
      const activeCoords = signal({row: 0, column: 0});
      const {gridFocus, cells} = setupGridFocus({activeCoords});
      cells[1][0].disabled.set(true);

      const success = gridFocus.focus({row: 1, column: 0});

      expect(success).toBeFalse();
      expect(activeCoords()).toEqual({row: 0, column: 0});
      expect(cells[1][0].element().focus).not.toHaveBeenCalled();
    });

    it('should focus cell, update activeCell and prevActiveCell in "roving" mode', () => {
      const activeCoords = signal({row: 0, column: 0});
      const {gridFocus, cells} = setupGridFocus({
        activeCoords,
        focusMode: signal('roving'),
      });

      const success = gridFocus.focus({row: 1, column: 0});

      expect(success).toBeTrue();
      expect(activeCoords()).toEqual({row: 1, column: 0});
      expect(cells[1][0].element().focus).toHaveBeenCalled();

      expect(gridFocus.activeCell()).toBe(cells[1][0]);
      expect(gridFocus.prevActiveCoords()).toEqual({row: 0, column: 0});
    });

    it('should update activeCell and prevActiveCell but not call element.focus in "activedescendant" mode', () => {
      const activeCoords = signal({row: 0, column: 0});
      const {gridFocus, cells} = setupGridFocus({
        activeCoords,
        focusMode: signal('activedescendant'),
      });

      const success = gridFocus.focus({row: 1, column: 0});

      expect(success).toBeTrue();
      expect(activeCoords()).toEqual({row: 1, column: 0});
      expect(cells[1][0].element().focus).not.toHaveBeenCalled();

      expect(gridFocus.activeCell()).toBe(cells[1][0]);
      expect(gridFocus.prevActiveCoords()).toEqual({row: 0, column: 0});
    });
  });
});
