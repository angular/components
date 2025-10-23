/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {signal, Signal, WritableSignal} from '@angular/core';
import {Grid, GridInputs} from './grid';
import {createGridA, createGridD, TestBaseGridCell} from './grid-data.spec';
import {WrapStrategy} from './grid-navigation';

interface TestGridCell extends TestBaseGridCell {
  element: WritableSignal<HTMLElement>;
  disabled: WritableSignal<boolean>;
  selected: WritableSignal<boolean>;
  selectable: WritableSignal<boolean>;
}

function createTestCell(): Omit<TestGridCell, keyof TestBaseGridCell> {
  return {
    element: signal(document.createElement('div')),
    disabled: signal(false),
    selected: signal(false),
    selectable: signal(true),
  };
}

function createTestGrid(createGridFn: () => TestBaseGridCell[][]): TestGridCell[][] {
  return createGridFn().map(row =>
    row.map(cell => {
      return {...createTestCell(), ...cell};
    }),
  );
}

function setupGrid(
  cells: Signal<TestGridCell[][]>,
  inputs: Partial<GridInputs<TestGridCell>> = {},
): Grid<TestGridCell> {
  const gridInputs: GridInputs<TestGridCell> = {
    cells,
    focusMode: signal('roving'),
    disabled: signal(false),
    skipDisabled: signal(true),
    rowWrap: signal<WrapStrategy>('loop'),
    colWrap: signal<WrapStrategy>('loop'),
    enableSelection: signal(true),
    ...inputs,
  };

  return new Grid(gridInputs);
}

describe('Grid', () => {
  describe('indices', () => {
    it('should return 1-based row and column indices', () => {
      const cells = createTestGrid(createGridA);
      const grid = setupGrid(signal(cells));

      expect(grid.rowIndex(cells[1][2])).toBe(2);
      expect(grid.colIndex(cells[1][2])).toBe(3);
    });

    it('should return undefined for a cell not in the grid', () => {
      const cells = createTestGrid(createGridA);
      const grid = setupGrid(signal(cells));
      const otherCell = createTestGrid(createGridA)[0][0];

      expect(grid.rowIndex(otherCell)).toBeUndefined();
      expect(grid.colIndex(otherCell)).toBeUndefined();
    });
  });

  describe('cellTabIndex', () => {
    it('should return the tabindex for a cell', () => {
      const cells = createTestGrid(createGridA);
      const grid = setupGrid(signal(cells));

      grid.gotoCell(cells[1][1]);

      expect(grid.cellTabIndex(cells[1][1])).toBe(0);
      expect(grid.cellTabIndex(cells[0][0])).toBe(-1);
    });
  });

  describe('navigation', () => {
    let cells: TestGridCell[][];
    let grid: Grid<TestGridCell>;

    beforeEach(() => {
      cells = createTestGrid(createGridA);
      grid = setupGrid(signal(cells));
      grid.gotoCell(cells[1][1]);
    });

    it('should navigate up/down/left/right', () => {
      expect(grid.focusBehavior.activeCell()).toBe(cells[1][1]);
      grid.up();
      expect(grid.focusBehavior.activeCell()).toBe(cells[0][1]);
      grid.down();
      expect(grid.focusBehavior.activeCell()).toBe(cells[1][1]);
      grid.left();
      expect(grid.focusBehavior.activeCell()).toBe(cells[1][0]);
      grid.right();
      expect(grid.focusBehavior.activeCell()).toBe(cells[1][1]);
    });

    it('should navigate to first/last cell in grid', () => {
      grid.last();
      expect(grid.focusBehavior.activeCell()).toBe(cells[2][2]);
      grid.first();
      expect(grid.focusBehavior.activeCell()).toBe(cells[0][0]);
    });

    it('should navigate to first/last cell in row', () => {
      grid.lastInRow();
      expect(grid.focusBehavior.activeCell()).toBe(cells[1][2]);
      grid.firstInRow();
      expect(grid.focusBehavior.activeCell()).toBe(cells[1][0]);
    });
  });

  describe('selection', () => {
    let cells: TestGridCell[][];
    let grid: Grid<TestGridCell>;

    beforeEach(() => {
      cells = createTestGrid(createGridD);
      grid = setupGrid(signal(cells));
      grid.gotoCell(cells[0][0]); // active cell at {0,0}
    });

    it('should toggle selection of a cell', () => {
      grid.toggleSelect(cells[1][0]); // cell at {1,1}
      expect(cells[1][0].selected()).toBe(true);
      grid.toggleSelect(cells[1][0]);
      expect(cells[1][0].selected()).toBe(false);
    });

    it('should select a row', () => {
      grid.gotoCell(cells[1][0]); // active cell at {1,1}
      grid.selectRow();
      // row 1 contains cells at {0,0}, {1,0}, {1,1}
      expect(cells[0][0].selected()).toBe(true); // spans row 0 and 1
      expect(cells[1][0].selected()).toBe(true); // spans row 1 and 2
      expect(cells[1][1].selected()).toBe(true); // spans row 1 and 2
      expect(cells[0][1].selected()).toBe(false); // only in row 0
    });

    it('should select a column', () => {
      grid.gotoCell(cells[1][0]); // active cell at {1,1}
      grid.selectCol();
      // col 1 contains cells at {0,1}, {1,0}
      expect(cells[0][1].selected()).toBe(true);
      expect(cells[1][0].selected()).toBe(true);
      expect(cells[0][0].selected()).toBe(false);
    });

    it('should select all cells', () => {
      grid.selectAll();
      cells.flat().forEach(cell => expect(cell.selected()).toBe(true));
    });
  });

  describe('range selection', () => {
    let cells: TestGridCell[][];
    let grid: Grid<TestGridCell>;

    beforeEach(() => {
      cells = createTestGrid(createGridA);
      grid = setupGrid(signal(cells));
      grid.gotoCell(cells[1][1]); // active cell and anchor at {1,1}
    });

    it('should range select with arrow keys', () => {
      grid.rangeSelectRight();
      expect(cells[1][1].selected()).toBe(true);
      expect(cells[1][2].selected()).toBe(true);
      expect(grid.selectionAnchor()).toEqual({row: 1, col: 2});

      grid.rangeSelectDown();
      expect(cells[1][1].selected()).toBe(true);
      expect(cells[1][2].selected()).toBe(true);
      expect(cells[2][1].selected()).toBe(true);
      expect(cells[2][2].selected()).toBe(true);
      expect(grid.selectionAnchor()).toEqual({row: 2, col: 2});

      grid.rangeSelectUp();
      expect(cells[1][1].selected()).toBe(true);
      expect(cells[1][2].selected()).toBe(true);
      expect(cells[2][1].selected()).toBe(false);
      expect(cells[2][2].selected()).toBe(false);
      expect(grid.selectionAnchor()).toEqual({row: 1, col: 2});

      grid.rangeSelectLeft();
      expect(cells[1][1].selected()).toBe(true);
      expect(cells[1][2].selected()).toBe(false);
      expect(grid.selectionAnchor()).toEqual({row: 1, col: 1});
    });

    it('should range select to a specific cell', () => {
      grid.rangeSelect(cells[2][2]);

      expect(cells[1][1].selected()).toBe(true);
      expect(cells[1][2].selected()).toBe(true);
      expect(cells[2][1].selected()).toBe(true);
      expect(cells[2][2].selected()).toBe(true);
      expect(grid.selectionAnchor()).toEqual({row: 2, col: 2});
    });

    it('should handle range selection with spanning cells', () => {
      const spanningCells = createTestGrid(createGridD);
      grid = setupGrid(signal(spanningCells));
      grid.gotoCell(spanningCells[0][0]); // active cell at {0,0}

      grid.rangeSelect(spanningCells[3][2]); // cell at {3,2}

      // The range is from {0,0} to {3,3} because cell at {3,2} has colspan 2.
      // All cells should be selected.
      spanningCells.flat().forEach(cell => expect(cell.selected()).toBe(true));
      expect(grid.selectionAnchor()).toEqual({row: 3, col: 2});
    });
  });

  describe('resetState', () => {
    it('should focus the first focusable cell if state is empty', () => {
      const cells = createTestGrid(createGridA);
      const grid = setupGrid(signal(cells));

      expect(grid.focusBehavior.stateEmpty()).toBe(true);
      const result = grid.resetState();
      expect(result).toBe(true);
      expect(grid.focusBehavior.activeCell()).toBe(cells[0][0]);
    });

    it('should return false if no focusable cell is found when state is empty', () => {
      const cells = createTestGrid(createGridA);
      cells.flat().forEach(c => c.disabled.set(true));
      const grid = setupGrid(signal(cells));

      const result = grid.resetState();
      expect(result).toBe(false);
      expect(grid.focusBehavior.activeCell()).toBeUndefined();
    });

    it('should re-focus the active cell if it is stale but still exists', () => {
      const cellsSignal = signal(createTestGrid(createGridA));
      const grid = setupGrid(cellsSignal);
      const originalCell = cellsSignal()[1][1];
      grid.gotoCell(originalCell);

      // Simulate reordering by creating a new grid but keeping the original cell instance
      const newCells = createTestGrid(createGridA);
      newCells[2][2] = originalCell;
      cellsSignal.set(newCells);

      expect(grid.focusBehavior.stateStale()).toBe(true);
      const result = grid.resetState();
      expect(result).toBe(true);
      expect(grid.focusBehavior.activeCell()).toBe(originalCell);
      expect(grid.focusBehavior.activeCoords()).toEqual({row: 2, col: 2});
    });

    it('should focus the original coordinates if the active cell is gone', () => {
      const cellsSignal = signal(createTestGrid(createGridA));
      const grid = setupGrid(cellsSignal);
      grid.gotoCell(cellsSignal()[1][1]);

      // Replace the cell at {1,1}
      const newCells = createTestGrid(createGridA);
      cellsSignal.set(newCells);

      expect(grid.focusBehavior.stateStale()).toBe(true);
      const result = grid.resetState();
      expect(result).toBe(true);
      expect(grid.focusBehavior.activeCell()).toBe(newCells[1][1]);
      expect(grid.focusBehavior.activeCoords()).toEqual({row: 1, col: 1});
    });

    it('should focus the first cell if active cell and coords are no longer valid', () => {
      const cellsSignal = signal(createTestGrid(createGridA));
      const grid = setupGrid(cellsSignal);
      grid.gotoCell(cellsSignal()[2][2]);

      // Make grid smaller
      const newCells: TestGridCell[][] = [
        [
          {...createTestCell(), id: signal('cell-0-0'), rowSpan: signal(1), colSpan: signal(1)},
          {...createTestCell(), id: signal('cell-0-1'), rowSpan: signal(1), colSpan: signal(1)},
        ],
        [
          {...createTestCell(), id: signal('cell-1-0'), rowSpan: signal(1), colSpan: signal(1)},
          {...createTestCell(), id: signal('cell-1-1'), rowSpan: signal(1), colSpan: signal(1)},
        ],
      ];
      cellsSignal.set(newCells);

      expect(grid.focusBehavior.stateStale()).toBe(true);
      const result = grid.resetState();
      expect(result).toBe(true);
      expect(grid.focusBehavior.activeCell()).toBe(newCells[0][0]);
      expect(grid.focusBehavior.activeCoords()).toEqual({row: 0, col: 0});
    });
  });
});
