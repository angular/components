/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {signal, Signal, WritableSignal} from '@angular/core';
import {GridData} from './grid-data';
import {
  createGridA,
  createGridB,
  createGridC,
  createGridD,
  createGridE,
  createGridF,
  TestBaseGridCell,
} from './grid-data.spec';
import {GridFocus, GridFocusInputs} from './grid-focus';
import {direction, GridNavigation, GridNavigationInputs, WrapStrategy} from './grid-navigation';

export interface TestGridNavigationCell extends TestBaseGridCell {
  element: WritableSignal<HTMLElement>;
  disabled: WritableSignal<boolean>;
}

function createTestCell(): Omit<TestGridNavigationCell, keyof TestBaseGridCell> {
  return {
    element: signal(document.createElement('div')),
    disabled: signal(false),
  };
}

function createTestGrid(createGridFn: () => TestBaseGridCell[][]): TestGridNavigationCell[][] {
  return createGridFn().map((row, r) =>
    row.map((cell, c) => {
      return {...createTestCell(), ...cell};
    }),
  );
}

function setupGridNavigation(
  cells: Signal<TestGridNavigationCell[][]>,
  inputs: Partial<GridNavigationInputs & GridFocusInputs> = {},
): {
  gridNav: GridNavigation<TestGridNavigationCell>;
  gridFocus: GridFocus<TestGridNavigationCell>;
} {
  const gridData = new GridData({cells});
  const gridFocusInputs: GridFocusInputs = {
    focusMode: signal('roving'),
    disabled: signal(false),
    softDisabled: signal(true),
  };
  const gridFocus = new GridFocus({
    grid: gridData,
    ...gridFocusInputs,
    ...inputs,
  });

  const gridNav = new GridNavigation({
    grid: gridData,
    gridFocus: gridFocus,
    rowWrap: signal<WrapStrategy>('loop'),
    colWrap: signal<WrapStrategy>('loop'),
    ...gridFocusInputs,
    ...inputs,
  });

  return {
    gridNav,
    gridFocus,
  };
}

describe('GridNavigation', () => {
  describe('gotoCell', () => {
    it('should focus the given cell', () => {
      const cells = createTestGrid(createGridA);
      const {gridNav, gridFocus} = setupGridNavigation(signal(cells));

      const result = gridNav.gotoCell(cells[1][1]);

      expect(result).toBe(true);
      expect(gridFocus.activeCell()).toBe(cells[1][1]);
      expect(gridFocus.activeCoords()).toEqual({row: 1, col: 1});
    });

    it('should return false if the cell cannot be focused', () => {
      const cells = createTestGrid(createGridA);
      const {gridNav, gridFocus} = setupGridNavigation(signal(cells), {
        softDisabled: signal(false),
      });

      cells[1][1].disabled.set(true);
      const result = gridNav.gotoCell(cells[1][1]);

      expect(result).toBe(false);
      expect(gridFocus.activeCell()).toBeUndefined();
    });
  });

  describe('gotoCoords', () => {
    it('should focus the cell at the given coordinates', () => {
      const cells = createTestGrid(createGridD);
      const {gridNav, gridFocus} = setupGridNavigation(signal(cells));

      const result = gridNav.gotoCoords({row: 1, col: 2});

      expect(result).toBe(true);
      // The cell at `[1][0]` spans `[1,1]`, `[1,2]`, `[2,1]`, and `[2,2]`.
      expect(gridFocus.activeCell()).toBe(cells[1][0]);
      expect(gridFocus.activeCoords()).toEqual({row: 1, col: 2});
    });

    it('should return false if the coordinates cannot be focused when softDisabled is false', () => {
      const cells = createTestGrid(createGridD);
      const {gridNav, gridFocus} = setupGridNavigation(signal(cells), {
        softDisabled: signal(false),
      });

      cells[1][0].disabled.set(true); // This cell spans {row: 1, col: 2}
      const result = gridNav.gotoCoords({row: 1, col: 2});

      expect(result).toBe(false);
      expect(gridFocus.activeCell()).toBeUndefined();
    });
  });

  describe('peek', () => {
    let cells: TestGridNavigationCell[][];
    let gridNav: GridNavigation<TestGridNavigationCell>;
    let gridFocus: GridFocus<TestGridNavigationCell>;

    beforeEach(() => {
      cells = createTestGrid(createGridB);
      const setup = setupGridNavigation(signal(cells));
      gridNav = setup.gridNav;
      gridFocus = setup.gridFocus;
    });

    describe('up', () => {
      it('should get the next coordinates without changing focus', () => {
        gridNav.gotoCoords({row: 1, col: 0});

        const nextCoords = gridNav.peek(direction.Up, gridFocus.activeCoords());

        expect(nextCoords).toEqual({row: 0, col: 0});
        expect(gridFocus.activeCoords()).toEqual({row: 1, col: 0});
      });

      it('should respect the wrap strategy', () => {
        const from = {row: 0, col: 0};
        gridNav.gotoCoords(from);
        expect(gridNav.peek(direction.Up, from, 'loop')).toEqual({row: 3, col: 0});
        expect(gridNav.peek(direction.Up, from, 'nowrap')).toBeUndefined();
        expect(gridNav.peek(direction.Up, from, 'continuous')).toEqual({row: 3, col: 2});
      });

      it('should return the next coordinates even if all cells are disabled', () => {
        cells.flat().forEach(cell => cell.disabled.set(true));
        gridNav.gotoCoords({row: 1, col: 0});

        const nextCoords = gridNav.peek(direction.Up, gridFocus.activeCoords());

        expect(nextCoords).toEqual({row: 0, col: 0});
      });

      it('should return undefined if all cells are disabled when softDisabled is false', () => {
        const {gridNav} = setupGridNavigation(signal(cells), {
          softDisabled: signal(false),
        });
        cells.flat().forEach(cell => cell.disabled.set(true));

        const nextCoords = gridNav.peek(direction.Up, {row: 1, col: 0});

        expect(nextCoords).toBeUndefined();
      });
    });

    describe('down', () => {
      it('should get the next coordinates without changing focus', () => {
        gridNav.gotoCoords({row: 1, col: 0});

        const nextCoords = gridNav.peek(direction.Down, gridFocus.activeCoords());

        expect(nextCoords).toEqual({row: 2, col: 0});
        expect(gridFocus.activeCoords()).toEqual({row: 1, col: 0});
      });

      it('should respect the wrap strategy', () => {
        const from = {row: 3, col: 1};
        gridNav.gotoCoords(from);
        expect(gridNav.peek(direction.Down, from, 'loop')).toEqual({row: 0, col: 1});
        expect(gridNav.peek(direction.Down, from, 'nowrap')).toBeUndefined();
        expect(gridNav.peek(direction.Down, from, 'continuous')).toEqual({row: 0, col: 2});
      });

      it('should return the next coordinates even if all cells are disabled', () => {
        cells.flat().forEach(cell => cell.disabled.set(true));
        gridNav.gotoCoords({row: 1, col: 0});

        const nextCoords = gridNav.peek(direction.Down, gridFocus.activeCoords());

        expect(nextCoords).toEqual({row: 2, col: 0});
      });

      it('should return undefined if all cells are disabled when softDisabled is false', () => {
        const {gridNav} = setupGridNavigation(signal(cells), {
          softDisabled: signal(false),
        });
        cells.flat().forEach(cell => cell.disabled.set(true));

        const nextCoords = gridNav.peek(direction.Down, {row: 1, col: 0});

        expect(nextCoords).toBeUndefined();
      });
    });

    describe('left', () => {
      it('should get the next coordinates without changing focus', () => {
        gridNav.gotoCoords({row: 0, col: 1});

        const nextCoords = gridNav.peek(direction.Left, gridFocus.activeCoords());

        expect(nextCoords).toEqual({row: 0, col: 0});
        expect(gridFocus.activeCoords()).toEqual({row: 0, col: 1});
      });

      it('should respect the wrap strategy', () => {
        const from = {row: 0, col: 0};
        gridNav.gotoCoords(from);
        expect(gridNav.peek(direction.Left, from, 'loop')).toEqual({row: 0, col: 2});
        expect(gridNav.peek(direction.Left, from, 'nowrap')).toBeUndefined();
        expect(gridNav.peek(direction.Left, from, 'continuous')).toEqual({row: 3, col: 2});
      });

      it('should return the next coordinates even if all cells are disabled', () => {
        cells.flat().forEach(function (cell) {
          cell.disabled.set(true);
        });
        gridNav.gotoCoords({row: 1, col: 0});

        const nextCoords = gridNav.peek(direction.Left, gridFocus.activeCoords());

        expect(nextCoords).toEqual({row: 1, col: 2});
      });

      it('should return undefined if all cells are disabled when softDisabled is false', () => {
        const {gridNav} = setupGridNavigation(signal(cells), {
          softDisabled: signal(false),
        });
        cells.flat().forEach(cell => cell.disabled.set(true));

        const nextCoords = gridNav.peek(direction.Left, {row: 1, col: 0});

        expect(nextCoords).toBeUndefined();
      });
    });

    describe('right', () => {
      it('should get the next coordinates without changing focus', () => {
        gridNav.gotoCoords({row: 0, col: 1});

        const nextCoords = gridNav.peek(direction.Right, gridFocus.activeCoords());

        expect(nextCoords).toEqual({row: 0, col: 2});
        expect(gridFocus.activeCoords()).toEqual({row: 0, col: 1});
      });

      it('should respect the wrap strategy', () => {
        const from = {row: 0, col: 2};
        gridNav.gotoCoords(from);
        expect(gridNav.peek(direction.Right, from, 'loop')).toEqual({row: 0, col: 0});
        expect(gridNav.peek(direction.Right, from, 'nowrap')).toBeUndefined();
        expect(gridNav.peek(direction.Right, from, 'continuous')).toEqual({row: 1, col: 0});
      });

      it('should return the next coordinates even if all cells are disabled', () => {
        cells.flat().forEach(function (cell) {
          cell.disabled.set(true);
        });
        gridNav.gotoCoords({row: 1, col: 0});

        const nextCoords = gridNav.peek(direction.Right, gridFocus.activeCoords());

        expect(nextCoords).toEqual({row: 1, col: 1});
      });

      it('should return undefined if all cells are disabled when softDisabled is false', () => {
        const {gridNav} = setupGridNavigation(signal(cells), {
          softDisabled: signal(false),
        });
        cells.flat().forEach(cell => cell.disabled.set(true));

        const nextCoords = gridNav.peek(direction.Right, {row: 1, col: 0});

        expect(nextCoords).toBeUndefined();
      });
    });
  });

  describe('advance', () => {
    describe('wrap=continuous', () => {
      describe('up', () => {
        it('case 1', () => {
          const cells = createTestGrid(createGridA);
          const setup = setupGridNavigation(signal(cells), {
            rowWrap: signal('continuous'),
            colWrap: signal('continuous'),
          });
          const gridNav = setup.gridNav;
          const gridFocus = setup.gridFocus;

          gridNav.gotoCoords({row: 0, col: 0});
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-2');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-2');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-2');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-1');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-1');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-1');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-0');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-0');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
        });

        it('case 2', () => {
          const cells = createTestGrid(createGridB);
          const setup = setupGridNavigation(signal(cells), {
            rowWrap: signal('continuous'),
            colWrap: signal('continuous'),
          });
          const gridNav = setup.gridNav;
          const gridFocus = setup.gridFocus;

          gridNav.gotoCoords({row: 0, col: 0});
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-3-2');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-2');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-2');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-3-1');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-1');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-1');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-0');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-0');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
        });

        it('case 3', () => {
          const cells = createTestGrid(createGridC);
          const setup = setupGridNavigation(signal(cells), {
            rowWrap: signal('continuous'),
            colWrap: signal('continuous'),
          });
          const gridNav = setup.gridNav;
          const gridFocus = setup.gridFocus;

          gridNav.gotoCoords({row: 0, col: 0});
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-2');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-3');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-3');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-2');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-1');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-2');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-1');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-1');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-0');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-0');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
        });

        it('case 4', () => {
          const cells = createTestGrid(createGridD);
          const setup = setupGridNavigation(signal(cells), {
            rowWrap: signal('continuous'),
            colWrap: signal('continuous'),
          });
          const gridNav = setup.gridNav;
          const gridFocus = setup.gridFocus;

          gridNav.gotoCoords({row: 0, col: 0});
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-3-2');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-3');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-3');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-3-2');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-1');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-1');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-3-1');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-1');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-1');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-3-0');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-0');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
        });

        it('case 5', () => {
          const cells = createTestGrid(createGridE);
          const setup = setupGridNavigation(signal(cells), {
            rowWrap: signal('continuous'),
            colWrap: signal('continuous'),
          });
          const gridNav = setup.gridNav;
          const gridFocus = setup.gridFocus;

          gridNav.gotoCoords({row: 0, col: 0});
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-2');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-1');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-1');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-0');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-0');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
        });

        it('case 6', () => {
          const cells = createTestGrid(createGridF);
          const setup = setupGridNavigation(signal(cells), {
            rowWrap: signal('continuous'),
            colWrap: signal('continuous'),
          });
          const gridNav = setup.gridNav;
          const gridFocus = setup.gridFocus;

          gridNav.gotoCoords({row: 0, col: 0});
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-2');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-2');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-1');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-1');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-0');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
        });
      });

      describe('down', () => {
        it('case 1', () => {
          const cells = createTestGrid(createGridA);
          const setup = setupGridNavigation(signal(cells), {
            rowWrap: signal('continuous'),
            colWrap: signal('continuous'),
          });
          const gridNav = setup.gridNav;
          const gridFocus = setup.gridFocus;

          gridNav.gotoCoords({row: 0, col: 0});
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-0');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-0');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-1');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-1');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-1');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-2');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-2');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-2');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
        });

        it('case 2', () => {
          const cells = createTestGrid(createGridB);
          const setup = setupGridNavigation(signal(cells), {
            rowWrap: signal('continuous'),
            colWrap: signal('continuous'),
          });
          const gridNav = setup.gridNav;
          const gridFocus = setup.gridFocus;

          gridNav.gotoCoords({row: 0, col: 0});
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-0');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-0');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-1');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-1');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-3-1');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-2');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-2');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-3-2');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
        });

        it('case 3', () => {
          const cells = createTestGrid(createGridC);
          const setup = setupGridNavigation(signal(cells), {
            rowWrap: signal('continuous'),
            colWrap: signal('continuous'),
          });
          const gridNav = setup.gridNav;
          const gridFocus = setup.gridFocus;

          gridNav.gotoCoords({row: 0, col: 0});
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-0');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-0');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-1');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-1');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-2');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-1');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-2');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-3');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-3');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-2');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
        });

        it('case 4', () => {
          const cells = createTestGrid(createGridD);
          const setup = setupGridNavigation(signal(cells), {
            rowWrap: signal('continuous'),
            colWrap: signal('continuous'),
          });
          const gridNav = setup.gridNav;
          const gridFocus = setup.gridFocus;

          gridNav.gotoCoords({row: 0, col: 0});
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-0');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-3-0');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-1');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-1');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-3-1');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-1');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-1');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-3-2');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-3');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-3');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-3-2');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
        });

        it('case 5', () => {
          const cells = createTestGrid(createGridE);
          const setup = setupGridNavigation(signal(cells), {
            rowWrap: signal('continuous'),
            colWrap: signal('continuous'),
          });
          const gridNav = setup.gridNav;
          const gridFocus = setup.gridFocus;

          gridNav.gotoCoords({row: 0, col: 0});
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-0');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-0');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-1');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-1');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-2');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
        });

        it('case 6', () => {
          const cells = createTestGrid(createGridF);
          const setup = setupGridNavigation(signal(cells), {
            rowWrap: signal('continuous'),
            colWrap: signal('continuous'),
          });
          const gridNav = setup.gridNav;
          const gridFocus = setup.gridFocus;

          gridNav.gotoCoords({row: 0, col: 0});
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-0');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-1');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-1');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-2');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-2');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
        });
      });

      describe('left', () => {
        it('case 1', () => {
          const cells = createTestGrid(createGridA);
          const setup = setupGridNavigation(signal(cells), {
            rowWrap: signal('continuous'),
            colWrap: signal('continuous'),
          });
          const gridNav = setup.gridNav;
          const gridFocus = setup.gridFocus;

          gridNav.gotoCoords({row: 0, col: 0});
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-2');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-1');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-0');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-2');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-1');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-0');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-2');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-1');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
        });

        it('case 2', () => {
          const cells = createTestGrid(createGridB);
          const setup = setupGridNavigation(signal(cells), {
            rowWrap: signal('continuous'),
            colWrap: signal('continuous'),
          });
          const gridNav = setup.gridNav;
          const gridFocus = setup.gridFocus;

          gridNav.gotoCoords({row: 0, col: 0});
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-3-2');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-3-1');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-0');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-2');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-1');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-0');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-2');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-1');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-0');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-2');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-1');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
        });

        it('case 3', () => {
          const cells = createTestGrid(createGridC);
          const setup = setupGridNavigation(signal(cells), {
            rowWrap: signal('continuous'),
            colWrap: signal('continuous'),
          });
          const gridNav = setup.gridNav;
          const gridFocus = setup.gridFocus;

          gridNav.gotoCoords({row: 0, col: 0});
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-2');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-1');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-0');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-3');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-1');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-0');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-3');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-2');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
        });

        it('case 4', () => {
          const cells = createTestGrid(createGridD);
          const setup = setupGridNavigation(signal(cells), {
            rowWrap: signal('continuous'),
            colWrap: signal('continuous'),
          });
          const gridNav = setup.gridNav;
          const gridFocus = setup.gridFocus;

          gridNav.gotoCoords({row: 0, col: 0});
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-3-2');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-3-1');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-3-0');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-3');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-1');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-0');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-3');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-1');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-3');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-1');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
        });

        it('case 5', () => {
          const cells = createTestGrid(createGridE);
          const setup = setupGridNavigation(signal(cells), {
            rowWrap: signal('continuous'),
            colWrap: signal('continuous'),
          });
          const gridNav = setup.gridNav;
          const gridFocus = setup.gridFocus;

          gridNav.gotoCoords({row: 0, col: 0});
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-1');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-0');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-1');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-0');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-2');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-1');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
        });

        it('case 6', () => {
          const cells = createTestGrid(createGridF);
          const setup = setupGridNavigation(signal(cells), {
            rowWrap: signal('continuous'),
            colWrap: signal('continuous'),
          });
          const gridNav = setup.gridNav;
          const gridFocus = setup.gridFocus;

          gridNav.gotoCoords({row: 0, col: 0});
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-2');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-1');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-0');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-2');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-1');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
        });
      });

      describe('right', () => {
        it('case 1', () => {
          const cells = createTestGrid(createGridA);
          const setup = setupGridNavigation(signal(cells), {
            rowWrap: signal('continuous'),
            colWrap: signal('continuous'),
          });
          const gridNav = setup.gridNav;
          const gridFocus = setup.gridFocus;

          gridNav.gotoCoords({row: 0, col: 0});
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-1');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-2');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-0');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-1');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-2');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-0');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-1');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-2');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
        });

        it('case 2', () => {
          const cells = createTestGrid(createGridB);
          const setup = setupGridNavigation(signal(cells), {
            rowWrap: signal('continuous'),
            colWrap: signal('continuous'),
          });
          const gridNav = setup.gridNav;
          const gridFocus = setup.gridFocus;

          gridNav.gotoCoords({row: 0, col: 0});
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-1');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-2');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-0');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-1');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-2');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-0');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-1');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-2');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-0');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-3-1');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-3-2');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
        });

        it('case 3', () => {
          const cells = createTestGrid(createGridC);
          const setup = setupGridNavigation(signal(cells), {
            rowWrap: signal('continuous'),
            colWrap: signal('continuous'),
          });
          const gridNav = setup.gridNav;
          const gridFocus = setup.gridFocus;

          gridNav.gotoCoords({row: 0, col: 0});
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-2');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-3');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-0');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-1');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-3');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-0');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-1');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-2');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
        });

        it('case 4', () => {
          const cells = createTestGrid(createGridD);
          const setup = setupGridNavigation(signal(cells), {
            rowWrap: signal('continuous'),
            colWrap: signal('continuous'),
          });
          const gridNav = setup.gridNav;
          const gridFocus = setup.gridFocus;

          gridNav.gotoCoords({row: 0, col: 0});
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-1');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-3');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-1');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-3');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-0');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-1');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-3');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-3-0');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-3-1');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-3-2');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
        });

        it('case 5', () => {
          const cells = createTestGrid(createGridE);
          const setup = setupGridNavigation(signal(cells), {
            rowWrap: signal('continuous'),
            colWrap: signal('continuous'),
          });
          const gridNav = setup.gridNav;
          const gridFocus = setup.gridFocus;

          gridNav.gotoCoords({row: 0, col: 0});
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-1');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-2');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-0');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-1');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-0');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-1');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
        });

        it('case 6', () => {
          const cells = createTestGrid(createGridF);
          const setup = setupGridNavigation(signal(cells), {
            rowWrap: signal('continuous'),
            colWrap: signal('continuous'),
          });
          const gridNav = setup.gridNav;
          const gridFocus = setup.gridFocus;

          gridNav.gotoCoords({row: 0, col: 0});
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-1');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-2');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-0');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-1');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-2');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
        });
      });
    });

    describe('wrap=loop', () => {
      describe('up', () => {
        it('case 1', () => {
          const cells = createTestGrid(createGridA);
          const {gridNav, gridFocus} = setupGridNavigation(signal(cells), {
            rowWrap: signal('loop'),
            colWrap: signal('loop'),
          });

          gridNav.gotoCoords({row: 0, col: 0});
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-0');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-0');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
        });

        it('case 2', () => {
          const cells = createTestGrid(createGridB);
          const {gridNav, gridFocus} = setupGridNavigation(signal(cells), {
            rowWrap: signal('loop'),
            colWrap: signal('loop'),
          });

          gridNav.gotoCoords({row: 0, col: 0});
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-0');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-0');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
        });

        it('case 3', () => {
          const cells = createTestGrid(createGridC);
          const {gridNav, gridFocus} = setupGridNavigation(signal(cells), {
            rowWrap: signal('loop'),
            colWrap: signal('loop'),
          });

          gridNav.gotoCoords({row: 0, col: 0});
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-0');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-0');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
        });

        it('case 4', () => {
          const cells = createTestGrid(createGridD);
          const {gridNav, gridFocus} = setupGridNavigation(signal(cells), {
            rowWrap: signal('loop'),
            colWrap: signal('loop'),
          });

          gridNav.gotoCoords({row: 0, col: 0});
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-3-0');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-0');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
        });

        it('case 5', () => {
          const cells = createTestGrid(createGridE);
          const {gridNav, gridFocus} = setupGridNavigation(signal(cells), {
            rowWrap: signal('loop'),
            colWrap: signal('loop'),
          });

          gridNav.gotoCoords({row: 0, col: 0});
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-0');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-0');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
        });

        it('case 6', () => {
          const cells = createTestGrid(createGridF);
          const {gridNav, gridFocus} = setupGridNavigation(signal(cells), {
            rowWrap: signal('loop'),
            colWrap: signal('loop'),
          });

          gridNav.gotoCoords({row: 0, col: 0});
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-0');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
        });
      });

      describe('down', () => {
        it('case 1', () => {
          const cells = createTestGrid(createGridA);
          const {gridNav, gridFocus} = setupGridNavigation(signal(cells), {
            rowWrap: signal('loop'),
            colWrap: signal('loop'),
          });

          gridNav.gotoCoords({row: 0, col: 0});
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-0');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-0');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
        });

        it('case 2', () => {
          const cells = createTestGrid(createGridB);
          const {gridNav, gridFocus} = setupGridNavigation(signal(cells), {
            rowWrap: signal('loop'),
            colWrap: signal('loop'),
          });

          gridNav.gotoCoords({row: 0, col: 0});
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-0');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-0');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
        });

        it('case 3', () => {
          const cells = createTestGrid(createGridC);
          const {gridNav, gridFocus} = setupGridNavigation(signal(cells), {
            rowWrap: signal('loop'),
            colWrap: signal('loop'),
          });

          gridNav.gotoCoords({row: 0, col: 0});
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-0');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-0');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
        });

        it('case 4', () => {
          const cells = createTestGrid(createGridD);
          const {gridNav, gridFocus} = setupGridNavigation(signal(cells), {
            rowWrap: signal('loop'),
            colWrap: signal('loop'),
          });

          gridNav.gotoCoords({row: 0, col: 0});
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-0');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-3-0');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
        });

        it('case 5', () => {
          const cells = createTestGrid(createGridE);
          const {gridNav, gridFocus} = setupGridNavigation(signal(cells), {
            rowWrap: signal('loop'),
            colWrap: signal('loop'),
          });

          gridNav.gotoCoords({row: 0, col: 0});
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-0');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-0');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
        });

        it('case 6', () => {
          const cells = createTestGrid(createGridF);
          const {gridNav, gridFocus} = setupGridNavigation(signal(cells), {
            rowWrap: signal('loop'),
            colWrap: signal('loop'),
          });

          gridNav.gotoCoords({row: 0, col: 0});
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-0');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
        });
      });

      describe('left', () => {
        it('case 1', () => {
          const cells = createTestGrid(createGridA);
          const {gridNav, gridFocus} = setupGridNavigation(signal(cells), {
            rowWrap: signal('loop'),
            colWrap: signal('loop'),
          });

          gridNav.gotoCoords({row: 0, col: 0});
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-2');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-1');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
        });

        it('case 2', () => {
          const cells = createTestGrid(createGridB);
          const {gridNav, gridFocus} = setupGridNavigation(signal(cells), {
            rowWrap: signal('loop'),
            colWrap: signal('loop'),
          });

          gridNav.gotoCoords({row: 0, col: 0});
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-2');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-1');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
        });

        it('case 3', () => {
          const cells = createTestGrid(createGridC);
          const {gridNav, gridFocus} = setupGridNavigation(signal(cells), {
            rowWrap: signal('loop'),
            colWrap: signal('loop'),
          });

          gridNav.gotoCoords({row: 0, col: 0});
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-3');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-2');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
        });

        it('case 4', () => {
          const cells = createTestGrid(createGridD);
          const {gridNav, gridFocus} = setupGridNavigation(signal(cells), {
            rowWrap: signal('loop'),
            colWrap: signal('loop'),
          });

          gridNav.gotoCoords({row: 0, col: 0});
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-3');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-1');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
        });

        it('case 5', () => {
          const cells = createTestGrid(createGridE);
          const {gridNav, gridFocus} = setupGridNavigation(signal(cells), {
            rowWrap: signal('loop'),
            colWrap: signal('loop'),
          });

          gridNav.gotoCoords({row: 0, col: 0});
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-2');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-1');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
        });

        it('case 6', () => {
          const cells = createTestGrid(createGridF);
          const {gridNav, gridFocus} = setupGridNavigation(signal(cells), {
            rowWrap: signal('loop'),
            colWrap: signal('loop'),
          });

          gridNav.gotoCoords({row: 0, col: 0});
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-2');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-1');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
        });
      });

      describe('right', () => {
        it('case 1', () => {
          const cells = createTestGrid(createGridA);
          const {gridNav, gridFocus} = setupGridNavigation(signal(cells), {
            rowWrap: signal('loop'),
            colWrap: signal('loop'),
          });

          gridNav.gotoCoords({row: 0, col: 0});
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-1');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-2');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
        });

        it('case 2', () => {
          const cells = createTestGrid(createGridB);
          const {gridNav, gridFocus} = setupGridNavigation(signal(cells), {
            rowWrap: signal('loop'),
            colWrap: signal('loop'),
          });

          gridNav.gotoCoords({row: 0, col: 0});
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-1');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-2');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
        });

        it('case 3', () => {
          const cells = createTestGrid(createGridC);
          const {gridNav, gridFocus} = setupGridNavigation(signal(cells), {
            rowWrap: signal('loop'),
            colWrap: signal('loop'),
          });

          gridNav.gotoCoords({row: 0, col: 0});
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-2');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-3');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
        });

        it('case 4', () => {
          const cells = createTestGrid(createGridD);
          const {gridNav, gridFocus} = setupGridNavigation(signal(cells), {
            rowWrap: signal('loop'),
            colWrap: signal('loop'),
          });

          gridNav.gotoCoords({row: 0, col: 0});
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-1');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-3');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
        });

        it('case 5', () => {
          const cells = createTestGrid(createGridE);
          const {gridNav, gridFocus} = setupGridNavigation(signal(cells), {
            rowWrap: signal('loop'),
            colWrap: signal('loop'),
          });

          gridNav.gotoCoords({row: 0, col: 0});
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-1');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-2');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
        });

        it('case 6', () => {
          const cells = createTestGrid(createGridF);
          const {gridNav, gridFocus} = setupGridNavigation(signal(cells), {
            rowWrap: signal('loop'),
            colWrap: signal('loop'),
          });

          gridNav.gotoCoords({row: 0, col: 0});
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-1');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-2');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
        });
      });
    });

    describe('wrap=nowrap', () => {
      describe('up', () => {
        it('case 1', () => {
          const cells = createTestGrid(createGridA);
          const {gridNav, gridFocus} = setupGridNavigation(signal(cells), {
            rowWrap: signal('nowrap'),
            colWrap: signal('nowrap'),
          });

          gridNav.gotoCoords({row: 2, col: 0});
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-0');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-0');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
        });

        it('case 2', () => {
          const cells = createTestGrid(createGridB);
          const {gridNav, gridFocus} = setupGridNavigation(signal(cells), {
            rowWrap: signal('nowrap'),
            colWrap: signal('nowrap'),
          });

          gridNav.gotoCoords({row: 3, col: 1});
          expect(gridFocus.activeCell()!.id()).toBe('cell-3-1');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-1');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-1');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-1');
        });

        it('case 3', () => {
          const cells = createTestGrid(createGridC);
          const {gridNav, gridFocus} = setupGridNavigation(signal(cells), {
            rowWrap: signal('nowrap'),
            colWrap: signal('nowrap'),
          });

          gridNav.gotoCoords({row: 2, col: 0});
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-0');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-0');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
        });

        it('case 4', () => {
          const cells = createTestGrid(createGridD);
          const {gridNav, gridFocus} = setupGridNavigation(signal(cells), {
            rowWrap: signal('nowrap'),
            colWrap: signal('nowrap'),
          });

          gridNav.gotoCoords({row: 3, col: 0});
          expect(gridFocus.activeCell()!.id()).toBe('cell-3-0');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-0');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
        });

        it('case 5', () => {
          const cells = createTestGrid(createGridE);
          const {gridNav, gridFocus} = setupGridNavigation(signal(cells), {
            rowWrap: signal('nowrap'),
            colWrap: signal('nowrap'),
          });

          gridNav.gotoCoords({row: 2, col: 0});
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-0');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-0');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
        });

        it('case 6', () => {
          const cells = createTestGrid(createGridF);
          const {gridNav, gridFocus} = setupGridNavigation(signal(cells), {
            rowWrap: signal('nowrap'),
            colWrap: signal('nowrap'),
          });

          gridNav.gotoCoords({row: 2, col: 0});
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-0');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Up);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
        });
      });

      describe('down', () => {
        it('case 1', () => {
          const cells = createTestGrid(createGridA);
          const {gridNav, gridFocus} = setupGridNavigation(signal(cells), {
            rowWrap: signal('nowrap'),
            colWrap: signal('nowrap'),
          });

          gridNav.gotoCoords({row: 0, col: 0});
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-0');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-0');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-0');
        });

        it('case 2', () => {
          const cells = createTestGrid(createGridB);
          const {gridNav, gridFocus} = setupGridNavigation(signal(cells), {
            rowWrap: signal('nowrap'),
            colWrap: signal('nowrap'),
          });

          gridNav.gotoCoords({row: 0, col: 1});
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-1');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-1');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-3-1');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-3-1');
        });

        it('case 3', () => {
          const cells = createTestGrid(createGridC);
          const {gridNav, gridFocus} = setupGridNavigation(signal(cells), {
            rowWrap: signal('nowrap'),
            colWrap: signal('nowrap'),
          });

          gridNav.gotoCoords({row: 0, col: 0});
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-0');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-0');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-0');
        });

        it('case 4', () => {
          const cells = createTestGrid(createGridD);
          const {gridNav, gridFocus} = setupGridNavigation(signal(cells), {
            rowWrap: signal('nowrap'),
            colWrap: signal('nowrap'),
          });

          gridNav.gotoCoords({row: 0, col: 0});
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-0');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-3-0');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-3-0');
        });

        it('case 5', () => {
          const cells = createTestGrid(createGridE);
          const {gridNav, gridFocus} = setupGridNavigation(signal(cells), {
            rowWrap: signal('nowrap'),
            colWrap: signal('nowrap'),
          });

          gridNav.gotoCoords({row: 0, col: 0});
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-1-0');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-0');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-0');
        });

        it('case 6', () => {
          const cells = createTestGrid(createGridF);
          const {gridNav, gridFocus} = setupGridNavigation(signal(cells), {
            rowWrap: signal('nowrap'),
            colWrap: signal('nowrap'),
          });

          gridNav.gotoCoords({row: 0, col: 0});
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-0');
          gridNav.advance(direction.Down);
          expect(gridFocus.activeCell()!.id()).toBe('cell-2-0');
        });
      });

      describe('left', () => {
        it('case 1', () => {
          const cells = createTestGrid(createGridA);
          const {gridNav, gridFocus} = setupGridNavigation(signal(cells), {
            rowWrap: signal('nowrap'),
            colWrap: signal('nowrap'),
          });

          gridNav.gotoCoords({row: 0, col: 2});
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-2');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-1');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
        });

        it('case 2', () => {
          const cells = createTestGrid(createGridB);
          const {gridNav, gridFocus} = setupGridNavigation(signal(cells), {
            rowWrap: signal('nowrap'),
            colWrap: signal('nowrap'),
          });

          gridNav.gotoCoords({row: 0, col: 2});
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-2');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-1');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
        });

        it('case 3', () => {
          const cells = createTestGrid(createGridC);
          const {gridNav, gridFocus} = setupGridNavigation(signal(cells), {
            rowWrap: signal('nowrap'),
            colWrap: signal('nowrap'),
          });

          gridNav.gotoCoords({row: 0, col: 3});
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-3');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-2');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
        });

        it('case 4', () => {
          const cells = createTestGrid(createGridD);
          const {gridNav, gridFocus} = setupGridNavigation(signal(cells), {
            rowWrap: signal('nowrap'),
            colWrap: signal('nowrap'),
          });

          gridNav.gotoCoords({row: 0, col: 3});
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-3');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-1');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
        });

        it('case 5', () => {
          const cells = createTestGrid(createGridE);
          const {gridNav, gridFocus} = setupGridNavigation(signal(cells), {
            rowWrap: signal('nowrap'),
            colWrap: signal('nowrap'),
          });

          gridNav.gotoCoords({row: 0, col: 2});
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-2');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-1');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
        });

        it('case 6', () => {
          const cells = createTestGrid(createGridF);
          const {gridNav, gridFocus} = setupGridNavigation(signal(cells), {
            rowWrap: signal('nowrap'),
            colWrap: signal('nowrap'),
          });

          gridNav.gotoCoords({row: 0, col: 2});
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-2');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-1');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Left);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
        });
      });

      describe('right', () => {
        it('case 1', () => {
          const cells = createTestGrid(createGridA);
          const {gridNav, gridFocus} = setupGridNavigation(signal(cells), {
            rowWrap: signal('nowrap'),
            colWrap: signal('nowrap'),
          });

          gridNav.gotoCoords({row: 0, col: 0});
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-1');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-2');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-2');
        });

        it('case 2', () => {
          const cells = createTestGrid(createGridB);
          const {gridNav, gridFocus} = setupGridNavigation(signal(cells), {
            rowWrap: signal('nowrap'),
            colWrap: signal('nowrap'),
          });

          gridNav.gotoCoords({row: 0, col: 0});
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-1');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-2');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-2');
        });

        it('case 3', () => {
          const cells = createTestGrid(createGridC);
          const {gridNav, gridFocus} = setupGridNavigation(signal(cells), {
            rowWrap: signal('nowrap'),
            colWrap: signal('nowrap'),
          });

          gridNav.gotoCoords({row: 0, col: 0});
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-2');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-3');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-3');
        });

        it('case 4', () => {
          const cells = createTestGrid(createGridD);
          const {gridNav, gridFocus} = setupGridNavigation(signal(cells), {
            rowWrap: signal('nowrap'),
            colWrap: signal('nowrap'),
          });

          gridNav.gotoCoords({row: 0, col: 0});
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-1');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-3');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-3');
        });

        it('case 5', () => {
          const cells = createTestGrid(createGridE);
          const {gridNav, gridFocus} = setupGridNavigation(signal(cells), {
            rowWrap: signal('nowrap'),
            colWrap: signal('nowrap'),
          });

          gridNav.gotoCoords({row: 0, col: 0});
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-1');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-2');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-2');
        });

        it('case 6', () => {
          const cells = createTestGrid(createGridF);
          const {gridNav, gridFocus} = setupGridNavigation(signal(cells), {
            rowWrap: signal('nowrap'),
            colWrap: signal('nowrap'),
          });

          gridNav.gotoCoords({row: 0, col: 0});
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-1');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-2');
          gridNav.advance(direction.Right);
          expect(gridFocus.activeCell()!.id()).toBe('cell-0-2');
        });
      });
    });
  });

  describe('first/peekFirst', () => {
    it('should navigate to the first focusable cell in the grid when softDisabled is false', () => {
      const cells = createTestGrid(createGridB);
      const {gridNav, gridFocus} = setupGridNavigation(signal(cells), {
        softDisabled: signal(false),
      });

      // Disable the first few cells to make it more interesting.
      cells[0][0].disabled.set(true);
      cells[0][1].disabled.set(true);

      const firstCoords = gridNav.peekFirst();
      expect(firstCoords).toEqual({row: 0, col: 2});

      // The active cell should not have changed yet.
      expect(gridFocus.activeCell()).toBeUndefined();

      const result = gridNav.first();
      expect(result).toBe(true);
      expect(gridFocus.activeCell()).toBe(cells[0][2]);
      expect(gridFocus.activeCoords()).toEqual({row: 0, col: 2});
    });

    it('should navigate to the first focusable cell in the grid', () => {
      const cells = createTestGrid(createGridB);
      const {gridNav, gridFocus} = setupGridNavigation(signal(cells));

      // Disable the first few cells to make it more interesting.
      cells[0][0].disabled.set(true);
      cells[0][1].disabled.set(true);

      const firstCoords = gridNav.peekFirst();
      expect(firstCoords).toEqual({row: 0, col: 0});

      // The active cell should not have changed yet.
      expect(gridFocus.activeCell()).toBeUndefined();

      const result = gridNav.first();
      expect(result).toBe(true);
      expect(gridFocus.activeCell()).toBe(cells[0][0]);
      expect(gridFocus.activeCoords()).toEqual({row: 0, col: 0});
    });

    it('should navigate to the first focusable cell in a specific row when softDisabled is false', () => {
      const cells = createTestGrid(createGridC);
      const {gridNav, gridFocus} = setupGridNavigation(signal(cells), {
        softDisabled: signal(false),
      });

      // Disable the first cell in row 1.
      cells[1][0].disabled.set(true);

      const firstInRowCoords = gridNav.peekFirst(1);
      expect(firstInRowCoords).toEqual({row: 1, col: 1});

      // The active cell should not have changed yet.
      expect(gridFocus.activeCell()).toBeUndefined();

      const result = gridNav.first(1);
      expect(result).toBe(true);
      expect(gridFocus.activeCell()).toBe(cells[1][1]);
      expect(gridFocus.activeCoords()).toEqual({row: 1, col: 1});
    });

    it('should navigate to the first focusable cell in a specific row', () => {
      const cells = createTestGrid(createGridC);
      const {gridNav, gridFocus} = setupGridNavigation(signal(cells));

      // Disable the first cell in row 1.
      cells[1][0].disabled.set(true);

      const firstInRowCoords = gridNav.peekFirst(1);
      expect(firstInRowCoords).toEqual({row: 1, col: 0});

      // The active cell should not have changed yet.
      expect(gridFocus.activeCell()).toBeUndefined();

      const result = gridNav.first(1);
      expect(result).toBe(true);
      expect(gridFocus.activeCell()).toBe(cells[1][0]);
      expect(gridFocus.activeCoords()).toEqual({row: 1, col: 0});
    });
  });

  describe('last/peekLast', () => {
    it('should navigate to the last focusable cell in the grid when softDisabled is false', () => {
      const cells = createTestGrid(createGridB);
      const {gridNav, gridFocus} = setupGridNavigation(signal(cells), {
        softDisabled: signal(false),
      });

      // Disable the last few cells to make it more interesting.
      cells[3][1].disabled.set(true); // cell-3-2
      cells[3][0].disabled.set(true); // cell-3-1

      const lastCoords = gridNav.peekLast();
      expect(lastCoords).toEqual({row: 3, col: 0});

      // The active cell should not have changed yet.
      expect(gridFocus.activeCell()).toBeUndefined();

      const result = gridNav.last();
      expect(result).toBe(true);
      expect(gridFocus.activeCell()!.id()).toBe('cell-2-0');
      expect(gridFocus.activeCoords()).toEqual({row: 3, col: 0});
    });

    it('should navigate to the last focusable cell in the grid', () => {
      const cells = createTestGrid(createGridB);
      const {gridNav, gridFocus} = setupGridNavigation(signal(cells));

      // Disable the last few cells to make it more interesting.
      cells[3][1].disabled.set(true); // cell-3-2
      cells[3][0].disabled.set(true); // cell-3-1

      const lastCoords = gridNav.peekLast();
      expect(lastCoords).toEqual({row: 3, col: 2});

      // The active cell should not have changed yet.
      expect(gridFocus.activeCell()).toBeUndefined();

      const result = gridNav.last();
      expect(result).toBe(true);
      expect(gridFocus.activeCell()!.id()).toBe('cell-3-2');
      expect(gridFocus.activeCoords()).toEqual({row: 3, col: 2});
    });

    it('should navigate to the last focusable cell in a specific row when softDisabled is false', () => {
      const cells = createTestGrid(createGridC);
      const {gridNav, gridFocus} = setupGridNavigation(signal(cells), {
        softDisabled: signal(false),
      });

      // Disable the last cell in row 1.
      cells[1][2].disabled.set(true);

      const lastInRowCoords = gridNav.peekLast(1);
      expect(lastInRowCoords).toEqual({row: 1, col: 2});

      const result = gridNav.last(1);
      expect(result).toBe(true);
      expect(gridFocus.activeCell()!.id()).toBe('cell-1-1');
      expect(gridFocus.activeCoords()).toEqual({row: 1, col: 2});
    });

    it('should navigate to the last focusable cell in a specific row', () => {
      const cells = createTestGrid(createGridC);
      const {gridNav, gridFocus} = setupGridNavigation(signal(cells));

      // Disable the last cell in row 1.
      cells[1][2].disabled.set(true);

      const lastInRowCoords = gridNav.peekLast(1);
      expect(lastInRowCoords).toEqual({row: 1, col: 3});

      const result = gridNav.last(1);
      expect(result).toBe(true);
      expect(gridFocus.activeCell()!.id()).toBe('cell-1-3');
      expect(gridFocus.activeCoords()).toEqual({row: 1, col: 3});
    });
  });
});
