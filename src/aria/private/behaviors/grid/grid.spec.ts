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
import {GridWrapStrategy} from './grid-navigation';

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
    softDisabled: signal(true),
    rowWrap: signal<GridWrapStrategy>('loop'),
    colWrap: signal<GridWrapStrategy>('loop'),
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
    it('should return the tab index for a cell', () => {
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

    describe('with selection', () => {
      it('should select one on navigate when `selectOne` is true', () => {
        const cells = createTestGrid(createGridA);
        const grid = setupGrid(signal(cells));
        grid.gotoCell(cells[0][0]);
        grid.select(); // cell 0,0 is selected

        grid.down({selectOne: true});

        expect(cells[0][0].selected()).toBe(false);
        expect(cells[1][0].selected()).toBe(true);
        expect(grid.focusBehavior.activeCell()).toBe(cells[1][0]);
      });

      it('should select on navigate when `select` is true', () => {
        const cells = createTestGrid(createGridA);
        const grid = setupGrid(signal(cells));
        grid.gotoCell(cells[0][0]);
        grid.select(); // cell 0,0 is selected

        grid.down({select: true});

        expect(cells[0][0].selected()).toBe(true);
        expect(cells[1][0].selected()).toBe(true);
        expect(grid.focusBehavior.activeCell()).toBe(cells[1][0]);
      });

      it('should toggle on navigate when `toggle` is true', () => {
        const cells = createTestGrid(createGridA);
        const grid = setupGrid(signal(cells));
        grid.gotoCell(cells[0][0]);

        grid.down({toggle: true}); // Move to 1,0 and select it
        expect(cells[1][0].selected()).toBe(true);

        grid.up({toggle: true}); // Move to 0,0 and select it
        expect(cells[0][0].selected()).toBe(true);
        expect(cells[1][0].selected()).toBe(true); // 1,0 remains selected

        grid.down({toggle: true}); // Move to 1,0 and deselect it
        expect(cells[1][0].selected()).toBe(false);
      });

      it('should toggle one on navigate when `toggleOne` is true', () => {
        const cells = createTestGrid(createGridA);
        const grid = setupGrid(signal(cells));
        grid.gotoCell(cells[0][0]);
        grid.select(); // cell 0,0 is selected

        grid.down({toggleOne: true}); // Move to 1,0

        expect(cells[0][0].selected()).toBe(false);
        expect(cells[1][0].selected()).toBe(true);

        grid.down({toggleOne: true}); // Move to 2,0
        expect(cells[1][0].selected()).toBe(false);
        expect(cells[2][0].selected()).toBe(true);
      });

      it('should range select on navigate when `anchor` is true', () => {
        const cells = createTestGrid(createGridA);
        const grid = setupGrid(signal(cells));
        grid.gotoCell(cells[1][1]);
        grid.down({anchor: true});
        expect(cells.flat().filter(c => c.selected()).length).toBe(2);
        expect(cells[1][1].selected()).toBe(true);
        expect(cells[2][1].selected()).toBe(true);
      });
    });
  });

  describe('selection', () => {
    describe('selectRow', () => {
      it('should select all cells in the current row', () => {
        const cells = createTestGrid(createGridA);
        const grid = setupGrid(signal(cells));
        grid.gotoCell(cells[0][0]);
        grid.select();
        expect(cells[0][0].selected()).toBe(true);

        grid.gotoCell(cells[1][1]);
        grid.selectRow();

        expect(cells[0][0].selected()).toBe(false);
        expect(cells[1][0].selected()).toBe(true);
        expect(cells[1][1].selected()).toBe(true);
        expect(cells[1][2].selected()).toBe(true);
        expect(cells[2][0].selected()).toBe(false);
      });
    });

    describe('selectCol', () => {
      it('should select all cells in the current column', () => {
        const cells = createTestGrid(createGridD);
        const grid = setupGrid(signal(cells));
        grid.gotoCell(cells[0][0]);
        grid.selectCol();

        expect(cells[0][0].selected()).toBe(true); // spans row 0 and 1 in col 0
        expect(cells[2][0].selected()).toBe(true);
        expect(cells[3][0].selected()).toBe(true);
        expect(cells[0][1].selected()).toBe(false);
      });
    });

    describe('select', () => {
      it('should select the active cell', () => {
        const cells = createTestGrid(createGridA);
        const grid = setupGrid(signal(cells));
        grid.gotoCell(cells[1][1]);
        grid.select();

        expect(cells[1][1].selected()).toBe(true);
        expect(cells[0][0].selected()).toBe(false);
      });
    });

    describe('deselect', () => {
      it('should deselect the active cell', () => {
        const cells = createTestGrid(createGridA);
        const grid = setupGrid(signal(cells));
        grid.gotoCell(cells[1][1]);
        grid.select();
        expect(cells[1][1].selected()).toBe(true);

        grid.deselect();
        expect(cells[1][1].selected()).toBe(false);
      });
    });

    describe('toggle', () => {
      it('should toggle the selection of the active cell', () => {
        const cells = createTestGrid(createGridA);
        const grid = setupGrid(signal(cells));
        grid.gotoCell(cells[1][1]);

        grid.toggle();
        expect(cells[1][1].selected()).toBe(true);

        grid.toggle();
        expect(cells[1][1].selected()).toBe(false);
      });
    });

    describe('toggleOne', () => {
      it('should toggle the selection of the active cell and deselect others', () => {
        const cells = createTestGrid(createGridA);
        const grid = setupGrid(signal(cells));
        grid.gotoCell(cells[0][0]);
        grid.select();

        grid.gotoCell(cells[1][1]);
        grid.toggleOne();

        expect(cells[0][0].selected()).toBe(false);
        expect(cells[1][1].selected()).toBe(true);

        grid.toggleOne();
        expect(cells[1][1].selected()).toBe(false);
      });
    });

    describe('selectAll', () => {
      it('should select all selectable cells', () => {
        const cells = createTestGrid(createGridA);
        cells[1][1].selectable.set(false);
        const grid = setupGrid(signal(cells));
        grid.selectAll();

        expect(cells.flat().filter(c => c.selected()).length).toBe(8);
        expect(cells[1][1].selected()).toBe(false);
      });
    });
  });

  describe('setDefaultState', () => {
    it('should focus the first focusable selected cell if one exists', () => {
      const cells = createTestGrid(createGridA);
      const grid = setupGrid(signal(cells), {softDisabled: signal(false)});

      // This one is selected but not focusable.
      cells[1][1].selected.set(true);
      cells[1][1].disabled.set(true);

      // This is the first focusable selected cell.
      cells[2][0].selected.set(true);

      // This one is also focusable and selected, but comes after.
      cells[2][2].selected.set(true);

      const result = grid.setDefaultState();

      expect(result).toBe(true);
      expect(grid.focusBehavior.activeCell()).toBe(cells[2][0]);
    });

    it('should focus the first focusable cell if no selected cell exists', () => {
      const cells = createTestGrid(createGridA);
      const grid = setupGrid(signal(cells), {softDisabled: signal(false)});

      cells[0][0].disabled.set(true);

      const result = grid.setDefaultState();

      expect(result).toBe(true);
      expect(grid.focusBehavior.activeCell()).toBe(cells[0][1]);
    });

    it('should return false if no focusable cell is found', () => {
      const cells = createTestGrid(createGridA);
      cells.flat().forEach(c => c.disabled.set(true));
      const grid = setupGrid(signal(cells), {softDisabled: signal(false)});

      const result = grid.setDefaultState();

      expect(result).toBe(false);
      expect(grid.focusBehavior.activeCell()).toBeUndefined();
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
