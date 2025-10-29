/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {signal, Signal, WritableSignal} from '@angular/core';
import {GridData} from './grid-data';
import {createGridA, createGridB, createGridD, TestBaseGridCell} from './grid-data.spec';
import {GridFocus, GridFocusInputs} from './grid-focus';

export interface TestGridFocusCell extends TestBaseGridCell {
  element: WritableSignal<HTMLElement>;
  disabled: WritableSignal<boolean>;
}

function createTestCell(): Omit<TestGridFocusCell, keyof TestBaseGridCell> {
  return {
    element: signal(document.createElement('div')),
    disabled: signal(false),
  };
}

function createTestGrid(createGridFn: () => TestBaseGridCell[][]): TestGridFocusCell[][] {
  return createGridFn().map(row =>
    row.map(cell => {
      return {...createTestCell(), ...cell};
    }),
  );
}

function setupGridFocus(
  cells: Signal<TestGridFocusCell[][]>,
  gridFocusInputs: Partial<GridFocusInputs> = {},
): GridFocus<TestGridFocusCell> {
  const gridData = new GridData({cells});
  return new GridFocus({
    grid: gridData,
    focusMode: signal('roving'),
    disabled: signal(false),
    softDisabled: signal(false),
    ...gridFocusInputs,
  });
}

describe('GridFocus', () => {
  describe('stateEmpty', () => {
    it('should be true initially', () => {
      const cells = createTestGrid(createGridA);
      const gridFocus = setupGridFocus(signal(cells));
      expect(gridFocus.stateEmpty()).toBe(true);
    });

    it('should be false after focusing a cell', () => {
      const cells = createTestGrid(createGridA);
      const gridFocus = setupGridFocus(signal(cells));

      gridFocus.focusCell(cells[1][1]);

      expect(gridFocus.stateEmpty()).toBe(false);
    });

    it('should be true if activeCell is undefined', () => {
      const cells = createTestGrid(createGridA);
      const gridFocus = setupGridFocus(signal(cells));

      // Manually create a partially-empty state.
      gridFocus.activeCell.set(undefined);
      gridFocus.activeCoords.set({row: 1, col: 1});

      expect(gridFocus.stateEmpty()).toBe(true);
    });
  });

  describe('stateStale', () => {
    it('should be true if the active cell is no longer in the grid', () => {
      const cells = createTestGrid(createGridA);
      const cellsSignal = signal(cells);
      const gridFocus = setupGridFocus(cellsSignal);

      gridFocus.focusCell(cells[1][1]);

      // Remove the active cell from the grid.
      const newCells = createTestGrid(createGridA);
      newCells[1].splice(1, 1);
      cellsSignal.set(newCells);

      expect(gridFocus.stateStale()).toBe(true);
    });

    it('should be true if the active coordinates point to a different cell', () => {
      const cells = createTestGrid(createGridA);
      const gridFocus = setupGridFocus(signal(cells));

      gridFocus.focusCell(cells[1][1]);

      // Manually set the active coordinates to a different cell.
      gridFocus.activeCoords.set({row: 0, col: 0});

      expect(gridFocus.stateStale()).toBe(true);
    });

    it('should be false if the active cell and coordinates are valid and in sync', () => {
      const cells = createTestGrid(createGridA);
      const gridFocus = setupGridFocus(signal(cells));

      gridFocus.focusCell(cells[1][1]);

      expect(gridFocus.stateStale()).toBe(false);
    });
  });

  describe('activeDescendant', () => {
    it('should return the ID of the active cell in activedescendant mode', () => {
      const cells = createTestGrid(createGridA);
      const gridFocus = setupGridFocus(signal(cells), {
        focusMode: signal('activedescendant'),
      });

      gridFocus.focusCell(cells[1][1]);

      expect(gridFocus.activeDescendant()).toBe('cell-1-1');
    });

    it('should be undefined in roving focus mode', () => {
      const cells = createTestGrid(createGridA);
      const gridFocus = setupGridFocus(signal(cells), {focusMode: signal('roving')});

      gridFocus.focusCell(cells[1][1]);

      expect(gridFocus.activeDescendant()).toBeUndefined();
    });

    it('should be undefined if the grid is disabled', () => {
      const cells = createTestGrid(createGridA);
      const gridFocus = setupGridFocus(signal(cells), {
        focusMode: signal('activedescendant'),
        disabled: signal(true),
      });

      gridFocus.activeCell.set(cells[1][1]);

      expect(gridFocus.activeDescendant()).toBeUndefined();
    });
  });

  describe('gridDisabled', () => {
    it('should be true if the grid is disabled via inputs', () => {
      const cells = createTestGrid(createGridA);
      const gridFocus = setupGridFocus(signal(cells), {
        disabled: signal(true),
      });
      expect(gridFocus.gridDisabled()).toBe(true);
    });

    it('should be true if all cells are disabled', () => {
      const cells = createTestGrid(createGridA);
      for (const row of cells) {
        for (const cell of row) {
          cell.disabled.set(true);
        }
      }
      const gridFocus = setupGridFocus(signal(cells));
      expect(gridFocus.gridDisabled()).toBe(true);
    });

    it('should be true if there are no cells', () => {
      const gridFocus = setupGridFocus(signal([]));
      expect(gridFocus.gridDisabled()).toBe(true);
    });

    it('should be false if at least one cell is enabled', () => {
      const cells = createTestGrid(createGridA);
      for (const row of cells) {
        for (const cell of row) {
          cell.disabled.set(true);
        }
      }
      // Enable one cell.
      cells[1][1].disabled.set(false);
      const gridFocus = setupGridFocus(signal(cells));
      expect(gridFocus.gridDisabled()).toBe(false);
    });
  });

  describe('gridTabIndex', () => {
    it('should be 0 in activedescendant mode', () => {
      const cells = createTestGrid(createGridA);
      const gridFocus = setupGridFocus(signal(cells), {
        focusMode: signal('activedescendant'),
      });
      expect(gridFocus.gridTabIndex()).toBe(0);
    });

    it('should be -1 in roving focus mode', () => {
      const cells = createTestGrid(createGridA);
      const gridFocus = setupGridFocus(signal(cells), {
        focusMode: signal('roving'),
      });
      expect(gridFocus.gridTabIndex()).toBe(-1);
    });

    it('should be 0 if the grid is disabled', () => {
      const cells = createTestGrid(createGridA);
      const gridFocus = setupGridFocus(signal(cells), {
        disabled: signal(true),
      });
      expect(gridFocus.gridTabIndex()).toBe(0);
    });
  });

  describe('getCellTabindex', () => {
    it('should return 0 for the active cell in roving mode', () => {
      const cells = createTestGrid(createGridA);
      const gridFocus = setupGridFocus(signal(cells), {
        focusMode: signal('roving'),
      });

      gridFocus.focusCell(cells[1][1]);

      expect(gridFocus.getCellTabindex(cells[1][1])).toBe(0);
    });

    it('should return -1 for inactive cells in roving mode', () => {
      const cells = createTestGrid(createGridA);
      const gridFocus = setupGridFocus(signal(cells), {
        focusMode: signal('roving'),
      });

      gridFocus.focusCell(cells[1][1]);

      expect(gridFocus.getCellTabindex(cells[0][0])).toBe(-1);
      expect(gridFocus.getCellTabindex(cells[2][2])).toBe(-1);
    });

    it('should return -1 for all cells in activedescendant mode', () => {
      const cells = createTestGrid(createGridA);
      const gridFocus = setupGridFocus(signal(cells), {
        focusMode: signal('activedescendant'),
      });

      gridFocus.focusCell(cells[1][1]);

      expect(gridFocus.getCellTabindex(cells[0][0])).toBe(-1);
      expect(gridFocus.getCellTabindex(cells[1][1])).toBe(-1);
    });

    it('should return -1 for all cells when the grid is disabled', () => {
      const cells = createTestGrid(createGridA);
      const gridFocus = setupGridFocus(signal(cells), {disabled: signal(true)});
      expect(gridFocus.getCellTabindex(cells[1][1])).toBe(-1);
    });
  });

  describe('isFocusable', () => {
    it('should return true for an enabled cell', () => {
      const cells = createTestGrid(createGridA);
      const gridFocus = setupGridFocus(signal(cells));
      expect(gridFocus.isFocusable(cells[1][1])).toBe(true);
    });

    it('should return false for a disabled cell when softDisabled is false', () => {
      const cells = createTestGrid(createGridA);
      const gridFocus = setupGridFocus(signal(cells), {softDisabled: signal(false)});

      cells[1][1].disabled.set(true);

      expect(gridFocus.isFocusable(cells[1][1])).toBe(false);
    });

    it('should return true for a disabled cell when softDisabled is true', () => {
      const cells = createTestGrid(createGridA);
      const gridFocus = setupGridFocus(signal(cells), {softDisabled: signal(true)});

      cells[1][1].disabled.set(true);

      expect(gridFocus.isFocusable(cells[1][1])).toBe(true);
    });
  });

  describe('focusCell', () => {
    it('should set the active cell and coordinates', () => {
      const cells = createTestGrid(createGridA);
      const gridFocus = setupGridFocus(signal(cells));

      const result = gridFocus.focusCell(cells[1][1]);

      expect(result).toBe(true);
      expect(gridFocus.activeCell()).toBe(cells[1][1]);
      expect(gridFocus.activeCoords()).toEqual({row: 1, col: 1});
    });

    it('should not focus a disabled cell if softDisabled is false', () => {
      const cells = createTestGrid(createGridA);
      const gridFocus = setupGridFocus(signal(cells), {softDisabled: signal(false)});

      gridFocus.focusCell(cells[0][0]);
      cells[1][1].disabled.set(true);

      const result = gridFocus.focusCell(cells[1][1]);

      expect(result).toBe(false);
      expect(gridFocus.activeCell()).toBe(cells[0][0]);
      expect(gridFocus.activeCoords()).toEqual({row: 0, col: 0});
    });

    it('should focus a disabled cell if softDisabled is true', () => {
      const cells = createTestGrid(createGridA);
      const gridFocus = setupGridFocus(signal(cells), {softDisabled: signal(true)});

      cells[1][1].disabled.set(true);
      const result = gridFocus.focusCell(cells[1][1]);

      expect(result).toBe(true);
      expect(gridFocus.activeCell()).toBe(cells[1][1]);
      expect(gridFocus.activeCoords()).toEqual({row: 1, col: 1});
    });

    it('should return false if the cell is not in the grid', () => {
      const cells = createTestGrid(createGridA);
      const gridFocus = setupGridFocus(signal(cells));
      const unrelatedCell = createTestGrid(createGridB)[0][0];

      const result = gridFocus.focusCell(unrelatedCell);

      expect(result).toBe(false);
    });
  });

  describe('focusCoordinates', () => {
    it('should set the active cell and coordinates', () => {
      const cells = createTestGrid(createGridD);
      const gridFocus = setupGridFocus(signal(cells));

      const result = gridFocus.focusCoordinates({row: 1, col: 2});

      expect(result).toBe(true);
      // The cell at `[1][0]` spans `[1,1]`, `[1,2]`, `[2,1]`, and `[2,2]`.
      expect(gridFocus.activeCell()).toBe(cells[1][0]);
      expect(gridFocus.activeCoords()).toEqual({row: 1, col: 2});
    });

    it('should not focus coordinates of a disabled cell if softDisabled is false', () => {
      const cells = createTestGrid(createGridD);
      const gridFocus = setupGridFocus(signal(cells), {softDisabled: signal(false)});

      gridFocus.focusCoordinates({row: 0, col: 0});
      cells[1][0].disabled.set(true); // This cell spans {row: 1, col: 2}

      const result = gridFocus.focusCoordinates({row: 1, col: 2});

      expect(result).toBe(false);
      expect(gridFocus.activeCell()).toBe(cells[0][0]);
      expect(gridFocus.activeCoords()).toEqual({row: 0, col: 0});
    });

    it('should focus coordinates of a disabled cell if softDisabled is true', () => {
      const cells = createTestGrid(createGridD);
      const gridFocus = setupGridFocus(signal(cells), {softDisabled: signal(true)});

      cells[1][0].disabled.set(true); // This cell spans {row: 1, col: 2}
      const result = gridFocus.focusCoordinates({row: 1, col: 2});

      expect(result).toBe(true);
      expect(gridFocus.activeCell()).toBe(cells[1][0]);
      expect(gridFocus.activeCoords()).toEqual({row: 1, col: 2});
    });

    it('should return false for out-of-bounds coordinates', () => {
      const cells = createTestGrid(createGridD);
      const gridFocus = setupGridFocus(signal(cells));

      const result = gridFocus.focusCoordinates({row: 10, col: 10});

      expect(result).toBe(false);
    });
  });
});
