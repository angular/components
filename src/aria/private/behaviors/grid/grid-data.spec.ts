/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {signal, SignalLike, WritableSignalLike} from '../signal-like/signal-like';
import {BaseGridCell, GridData} from './grid-data';

export interface TestBaseGridCell extends BaseGridCell {
  rowSpan: WritableSignalLike<number>;
  colSpan: WritableSignalLike<number>;
  id: SignalLike<string>;
}

/**
 * GRID A:
 * ┌─────┬─────┬─────┐
 * │ 0,0 │ 0,1 │ 0,2 │
 * ├─────┼─────┼─────┤
 * │ 1,0 │ 1,1 │ 1,2 │
 * ├─────┼─────┼─────┤
 * │ 2,0 │ 2,1 │ 2,2 │
 * └─────┴─────┴─────┘
 */
export function createGridA(): TestBaseGridCell[][] {
  return [
    [
      {rowSpan: signal(1), colSpan: signal(1), id: signal('cell-0-0')},
      {rowSpan: signal(1), colSpan: signal(1), id: signal('cell-0-1')},
      {rowSpan: signal(1), colSpan: signal(1), id: signal('cell-0-2')},
    ],
    [
      {rowSpan: signal(1), colSpan: signal(1), id: signal('cell-1-0')},
      {rowSpan: signal(1), colSpan: signal(1), id: signal('cell-1-1')},
      {rowSpan: signal(1), colSpan: signal(1), id: signal('cell-1-2')},
    ],
    [
      {rowSpan: signal(1), colSpan: signal(1), id: signal('cell-2-0')},
      {rowSpan: signal(1), colSpan: signal(1), id: signal('cell-2-1')},
      {rowSpan: signal(1), colSpan: signal(1), id: signal('cell-2-2')},
    ],
  ];
}

/**
 * GRID B:
 * ┌─────┬─────┬─────┐
 * │ 0,0 │ 0,1 │ 0,2 │
 * ├─────┼─────┤     │
 * │ 1,0 │ 1,1 │     │
 * ├─────┤     ├─────┤
 * │ 2,0 │     │ 2,2 │
 * │     ├─────┼─────┤
 * │     │ 3,1 │ 3,2 │
 * └─────┴─────┴─────┘
 */
export function createGridB(): TestBaseGridCell[][] {
  return [
    [
      {rowSpan: signal(1), colSpan: signal(1), id: signal('cell-0-0')},
      {rowSpan: signal(1), colSpan: signal(1), id: signal('cell-0-1')},
      {rowSpan: signal(2), colSpan: signal(1), id: signal('cell-0-2')},
    ],
    [
      {rowSpan: signal(1), colSpan: signal(1), id: signal('cell-1-0')},
      {rowSpan: signal(2), colSpan: signal(1), id: signal('cell-1-1')},
    ],
    [
      {rowSpan: signal(2), colSpan: signal(1), id: signal('cell-2-0')},
      {rowSpan: signal(1), colSpan: signal(1), id: signal('cell-2-2')},
    ],
    [
      {rowSpan: signal(1), colSpan: signal(1), id: signal('cell-3-1')},
      {rowSpan: signal(1), colSpan: signal(1), id: signal('cell-3-2')},
    ],
  ];
}

/**
 * GRID C:
 * ┌───────────┬─────┬─────┐
 * │ 0,0       │ 0,2 │ 0,3 │
 * ├─────┬─────┴─────┼─────┤
 * │ 1,0 │ 1,1       │ 1,3 │
 * ├─────┼─────┬─────┴─────┤
 * │ 2,0 │ 2,1 │ 2,2       │
 * └─────┴─────┴───────────┘
 */
export function createGridC(): TestBaseGridCell[][] {
  return [
    [
      {rowSpan: signal(1), colSpan: signal(2), id: signal('cell-0-0')},
      {rowSpan: signal(1), colSpan: signal(1), id: signal('cell-0-2')},
      {rowSpan: signal(1), colSpan: signal(1), id: signal('cell-0-3')},
    ],
    [
      {rowSpan: signal(1), colSpan: signal(1), id: signal('cell-1-0')},
      {rowSpan: signal(1), colSpan: signal(2), id: signal('cell-1-1')},
      {rowSpan: signal(1), colSpan: signal(1), id: signal('cell-1-3')},
    ],
    [
      {rowSpan: signal(1), colSpan: signal(1), id: signal('cell-2-0')},
      {rowSpan: signal(1), colSpan: signal(1), id: signal('cell-2-1')},
      {rowSpan: signal(1), colSpan: signal(2), id: signal('cell-2-2')},
    ],
  ];
}

/**
 * GRID D:
 * ┌─────┬───────────┬─────┐
 * │ 0,0 │ 0,1       │ 0,3 │
 * │     ├───────────┼─────┤
 * │     │ 1,1       │ 1,3 │
 * ├─────┤           │     │
 * │ 2,0 │           │     │
 * ├─────┼─────┬─────┴─────┤
 * │ 3,0 │ 3,1 │ 3,2       │
 * └─────┴─────┴───────────┘
 */
export function createGridD(): TestBaseGridCell[][] {
  return [
    [
      {rowSpan: signal(2), colSpan: signal(1), id: signal('cell-0-0')},
      {rowSpan: signal(1), colSpan: signal(2), id: signal('cell-0-1')},
      {rowSpan: signal(1), colSpan: signal(1), id: signal('cell-0-3')},
    ],
    [
      {rowSpan: signal(2), colSpan: signal(2), id: signal('cell-1-1')},
      {rowSpan: signal(2), colSpan: signal(1), id: signal('cell-1-3')},
    ],
    [{rowSpan: signal(1), colSpan: signal(1), id: signal('cell-2-0')}],
    [
      {rowSpan: signal(1), colSpan: signal(1), id: signal('cell-3-0')},
      {rowSpan: signal(1), colSpan: signal(1), id: signal('cell-3-1')},
      {rowSpan: signal(1), colSpan: signal(2), id: signal('cell-3-2')},
    ],
  ];
}

/**
 * GRID E: Uneven rows (jagged)
 * ┌─────┬─────┬─────┐
 * │ 0,0 │ 0,1 │ 0,2 │
 * ├─────┤     ├─────┘
 * │ 1,0 │     │
 * ├─────┼─────┤
 * │ 2,0 │ 2,1 │
 * └─────┴─────┴
 */
export function createGridE(): TestBaseGridCell[][] {
  return [
    [
      {rowSpan: signal(1), colSpan: signal(1), id: signal('cell-0-0')},
      {rowSpan: signal(2), colSpan: signal(1), id: signal('cell-0-1')},
      {rowSpan: signal(1), colSpan: signal(1), id: signal('cell-0-2')},
    ],
    [{rowSpan: signal(1), colSpan: signal(1), id: signal('cell-1-0')}],
    [
      {rowSpan: signal(1), colSpan: signal(1), id: signal('cell-2-0')},
      {rowSpan: signal(1), colSpan: signal(1), id: signal('cell-2-1')},
    ],
  ];
}

/**
 * GRID F: Grid with empty rows
 * ┌─────┬─────┬─────┐
 * │ 0,0 │ 0,1 │ 0,2 │
 * ├─────┼─────┼─────┤
 * │     │     │     │
 * ├─────┼─────┼─────┤
 * │ 2,0 │ 2,1 │ 2,2 │
 * └─────┴─────┴─────┘
 */
export function createGridF(): TestBaseGridCell[][] {
  return [
    [
      {rowSpan: signal(1), colSpan: signal(1), id: signal('cell-0-0')},
      {rowSpan: signal(1), colSpan: signal(1), id: signal('cell-0-1')},
      {rowSpan: signal(1), colSpan: signal(1), id: signal('cell-0-2')},
    ],
    [],
    [
      {rowSpan: signal(1), colSpan: signal(1), id: signal('cell-2-0')},
      {rowSpan: signal(1), colSpan: signal(1), id: signal('cell-2-1')},
      {rowSpan: signal(1), colSpan: signal(1), id: signal('cell-2-2')},
    ],
  ];
}

function createGridData(cells: TestBaseGridCell[][]): GridData<TestBaseGridCell> {
  return new GridData({cells: signal(cells)});
}

describe('GridData', () => {
  describe('rowCount', () => {
    it('should return the number of rows in the grid', () => {});
  });

  describe('maxRowCount', () => {
    it('should return the maximum number of rows, accounting for row spans', () => {
      const gridA = createGridData(createGridA());
      expect(gridA.maxRowCount()).toBe(3);

      const gridB = createGridData(createGridB());
      expect(gridB.maxRowCount()).toBe(4);

      const gridC = createGridData(createGridC());
      expect(gridC.maxRowCount()).toBe(3);

      const gridD = createGridData(createGridD());
      expect(gridD.maxRowCount()).toBe(4);

      const gridF = createGridData(createGridE());
      expect(gridF.maxRowCount()).toBe(3);

      const gridG = createGridData(createGridF());
      expect(gridG.maxRowCount()).toBe(3);
    });
  });

  describe('maxColCount', () => {
    it('should return the maximum number of columns, accounting for column spans', () => {
      const gridA = createGridData(createGridA());
      expect(gridA.maxColCount()).toBe(3);

      const gridB = createGridData(createGridB());
      expect(gridB.maxColCount()).toBe(3);

      const gridC = createGridData(createGridC());
      expect(gridC.maxColCount()).toBe(4);

      const gridD = createGridData(createGridD());
      expect(gridD.maxColCount()).toBe(4);

      const gridE = createGridData(createGridE());
      expect(gridE.maxColCount()).toBe(3);

      const gridF = createGridData(createGridF());
      expect(gridF.maxColCount()).toBe(3);
    });
  });

  describe('getCell', () => {
    it('should get the cell at the given coordinates', () => {
      const cells = createGridD();
      const grid = createGridData(cells);

      expect(grid.getCell({row: 0, col: 0})).toBe(cells[0][0]);
      expect(grid.getCell({row: 1, col: 0})).toBe(cells[0][0]);
      expect(grid.getCell({row: 0, col: 1})).toBe(cells[0][1]);
      expect(grid.getCell({row: 0, col: 2})).toBe(cells[0][1]);
      expect(grid.getCell({row: 1, col: 1})).toBe(cells[1][0]);
      expect(grid.getCell({row: 2, col: 2})).toBe(cells[1][0]);
    });

    it('should return undefined for out-of-bounds coordinates', () => {
      const grid = createGridData(createGridA());
      expect(grid.getCell({row: 5, col: 5})).toBeUndefined();
      expect(grid.getCell({row: -1, col: 0})).toBeUndefined();
    });
  });

  describe('getCoords', () => {
    it('should get the primary coordinates of the given cell', () => {
      const cells = createGridD();
      const grid = createGridData(cells);

      expect(grid.getCoords(cells[0][0])).toEqual({row: 0, col: 0});
      expect(grid.getCoords(cells[1][0])).toEqual({row: 1, col: 1});
      expect(grid.getCoords(cells[3][2])).toEqual({row: 3, col: 2});
    });
  });

  describe('getAllCoords', () => {
    it('should get all coordinates that the given cell spans', () => {
      const cells = createGridD();
      const grid = createGridData(cells);

      expect(grid.getAllCoords(cells[0][0])).toEqual([
        {row: 0, col: 0},
        {row: 1, col: 0},
      ]);
      expect(grid.getAllCoords(cells[1][0])).toEqual([
        {row: 1, col: 1},
        {row: 1, col: 2},
        {row: 2, col: 1},
        {row: 2, col: 2},
      ]);
      expect(grid.getAllCoords(cells[3][2])).toEqual([
        {row: 3, col: 2},
        {row: 3, col: 3},
      ]);
    });
  });

  describe('getRowCount', () => {
    it('should get the number of rows in the given column', () => {
      const grid = createGridData(createGridD());
      expect(grid.getRowCount(0)).toBe(4);
      expect(grid.getRowCount(1)).toBe(4);
      expect(grid.getRowCount(2)).toBe(4);
      expect(grid.getRowCount(3)).toBe(4);
    });

    it('should return undefined for an out-of-bounds column', () => {
      const grid = createGridData(createGridA());
      expect(grid.getRowCount(5)).toBeUndefined();
      expect(grid.getRowCount(-1)).toBeUndefined();
    });
  });

  describe('getColCount', () => {
    it('should get the number of columns in the given row', () => {
      const gridD = createGridData(createGridD());
      expect(gridD.getColCount(0)).toBe(4);
      expect(gridD.getColCount(1)).toBe(4);
      expect(gridD.getColCount(2)).toBe(4);
      expect(gridD.getColCount(3)).toBe(4);

      const gridE = createGridData(createGridE());
      expect(gridE.getColCount(0)).toBe(3);
      expect(gridE.getColCount(1)).toBe(2);
      expect(gridE.getColCount(2)).toBe(2);
    });

    it('should return undefined for an out-of-bounds row', () => {
      const grid = createGridData(createGridA());
      expect(grid.getColCount(5)).toBeUndefined();
      expect(grid.getColCount(-1)).toBeUndefined();
    });
  });
});
