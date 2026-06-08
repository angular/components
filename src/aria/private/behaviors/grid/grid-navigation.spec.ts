/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {signal, SignalLike, WritableSignalLike} from '../signal-like/signal-like';
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
  element: WritableSignalLike<HTMLElement>;
  disabled: WritableSignalLike<boolean>;
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
  cells: SignalLike<TestGridNavigationCell[][]>,
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
      it('should get the next coordinates without changing focus (#peek-up)', () => {
        gridNav.gotoCoords({row: 1, col: 0});

        const nextCoords = gridNav.peek(direction.Up, gridFocus.activeCoords());

        expect(nextCoords).toEqual({row: 0, col: 0});
        expect(gridFocus.activeCoords()).toEqual({row: 1, col: 0});
      });

      it('should respect the wrap strategy (#peek-up)', () => {
        const from = {row: 0, col: 0};
        gridNav.gotoCoords(from);
        expect(gridNav.peek(direction.Up, from, 'loop')).toEqual({row: 3, col: 0});
        expect(gridNav.peek(direction.Up, from, 'nowrap')).toBeUndefined();
        expect(gridNav.peek(direction.Up, from, 'continuous')).toBeUndefined();
      });

      it('should return undefined if all cells are disabled', () => {
        cells.flat().forEach(cell => cell.disabled.set(true));
        gridNav.gotoCoords({row: 1, col: 0});

        const nextCoords = gridNav.peek(direction.Up, gridFocus.activeCoords());

        expect(nextCoords).toBeUndefined();
      });

      it('should return undefined if all cells are disabled when softDisabled is false', () => {
        const {gridNav} = setupGridNavigation(signal(cells), {
          softDisabled: signal(false),
        });
        cells.flat().forEach(cell => cell.disabled.set(true));

        const nextCoords = gridNav.peek(direction.Up, {row: 1, col: 0});

        expect(nextCoords).toBeUndefined();
      });

      it('should get disabled cells when allowDisabled is true and softDisabled is false (up)', () => {
        const {gridNav, gridFocus} = setupGridNavigation(signal(cells), {
          softDisabled: signal(false),
        });
        gridNav.gotoCoords({row: 1, col: 0});
        cells[0][0].disabled.set(true);

        const nextCoords = gridNav.peek(direction.Up, gridFocus.activeCoords(), 'nowrap', true);

        expect(nextCoords).toEqual({row: 0, col: 0});
        expect(gridNav.peek(direction.Up, gridFocus.activeCoords(), 'nowrap')).toBeUndefined();
      });
    });

    describe('down', () => {
      it('should get the next coordinates without changing focus (#peek-down)', () => {
        gridNav.gotoCoords({row: 1, col: 0});

        const nextCoords = gridNav.peek(direction.Down, gridFocus.activeCoords());

        expect(nextCoords).toEqual({row: 2, col: 0});
        expect(gridFocus.activeCoords()).toEqual({row: 1, col: 0});
      });

      it('should respect the wrap strategy (#peek-down)', () => {
        const from = {row: 3, col: 1};
        gridNav.gotoCoords(from);
        expect(gridNav.peek(direction.Down, from, 'loop')).toEqual({row: 0, col: 1});
        expect(gridNav.peek(direction.Down, from, 'nowrap')).toBeUndefined();
        expect(gridNav.peek(direction.Down, from, 'continuous')).toEqual({row: 0, col: 2});
      });

      it('should return undefined if completely disabled (#peek-down)', () => {
        cells.flat().forEach(cell => cell.disabled.set(true));
        gridNav.gotoCoords({row: 1, col: 0});

        const nextCoords = gridNav.peek(direction.Down, gridFocus.activeCoords());

        expect(nextCoords).toBeUndefined();
      });

      it('should get disabled cells when allowDisabled is true and softDisabled is false (down)', () => {
        const {gridNav, gridFocus} = setupGridNavigation(signal(cells), {
          softDisabled: signal(false),
        });
        gridNav.gotoCoords({row: 1, col: 0});
        cells[2][0].disabled.set(true);

        const nextCoords = gridNav.peek(direction.Down, gridFocus.activeCoords(), 'nowrap', true);

        expect(nextCoords).toEqual({row: 2, col: 0});
        expect(gridNav.peek(direction.Down, gridFocus.activeCoords(), 'nowrap')).toBeUndefined();
      });
    });

    describe('left', () => {
      it('should get the next coordinates without changing focus (#peek-left)', () => {
        gridNav.gotoCoords({row: 0, col: 1});

        const nextCoords = gridNav.peek(direction.Left, gridFocus.activeCoords());

        expect(nextCoords).toEqual({row: 0, col: 0});
        expect(gridFocus.activeCoords()).toEqual({row: 0, col: 1});
      });

      it('should respect the wrap strategy (#peek-left)', () => {
        const from = {row: 0, col: 0};
        gridNav.gotoCoords(from);
        expect(gridNav.peek(direction.Left, from, 'loop')).toEqual({row: 0, col: 2});
        expect(gridNav.peek(direction.Left, from, 'nowrap')).toBeUndefined();
        expect(gridNav.peek(direction.Left, from, 'continuous')).toBeUndefined();
      });

      it('should return undefined if completely disabled (#peek-left)', () => {
        cells.flat().forEach(cell => cell.disabled.set(true));
        gridNav.gotoCoords({row: 1, col: 0});

        const nextCoords = gridNav.peek(direction.Down, gridFocus.activeCoords());

        expect(nextCoords).toBeUndefined();
      });

      it('should get disabled cells when allowDisabled is true when softDisabled is false (left)', () => {
        const {gridNav, gridFocus} = setupGridNavigation(signal(cells), {
          softDisabled: signal(false),
        });
        gridNav.gotoCoords({row: 0, col: 1});
        cells[0][0].disabled.set(true);

        const nextCoords = gridNav.peek(direction.Left, gridFocus.activeCoords(), 'nowrap', true);

        expect(nextCoords).toEqual({row: 0, col: 0});
        expect(gridNav.peek(direction.Left, gridFocus.activeCoords(), 'nowrap')).toBeUndefined();
      });
    });

    describe('right', () => {
      it('should get the next coordinates without changing focus (#peek-right)', () => {
        gridNav.gotoCoords({row: 0, col: 1});

        const nextCoords = gridNav.peek(direction.Right, gridFocus.activeCoords());

        expect(nextCoords).toEqual({row: 0, col: 2});
        expect(gridFocus.activeCoords()).toEqual({row: 0, col: 1});
      });

      it('should respect the wrap strategy (#peek-right)', () => {
        const from = {row: 0, col: 2};
        gridNav.gotoCoords(from);
        expect(gridNav.peek(direction.Right, from, 'loop')).toEqual({row: 0, col: 0});
        expect(gridNav.peek(direction.Right, from, 'nowrap')).toBeUndefined();
        expect(gridNav.peek(direction.Right, from, 'continuous')).toEqual({row: 1, col: 0});
      });

      it('should return undefined if completely disabled (#peek-right)', () => {
        cells.flat().forEach(cell => cell.disabled.set(true));
        gridNav.gotoCoords({row: 1, col: 0});

        const nextCoords = gridNav.peek(direction.Down, gridFocus.activeCoords());

        expect(nextCoords).toBeUndefined();
      });

      it('should get disabled cells when allowDisabled is true and softDisabled is false (right)', () => {
        const {gridNav, gridFocus} = setupGridNavigation(signal(cells), {
          softDisabled: signal(false),
        });
        gridNav.gotoCoords({row: 0, col: 1});
        cells[0][2].disabled.set(true);

        const nextCoords = gridNav.peek(direction.Right, gridFocus.activeCoords(), 'nowrap', true);

        expect(nextCoords).toEqual({row: 0, col: 2});
        expect(gridNav.peek(direction.Right, gridFocus.activeCoords(), 'nowrap')).toBeUndefined();
      });
    });
  });

  describe('advance', () => {
    describe('wrap=continuous', () => {
      describe('up', () => {
        describe('case 1 (3x3 grid)', () => {
          it('should advance from (0,0) (up, continuous, case 1)', () => {
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
            expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          });

          it('should advance from (2,2) (up, continuous, case 1)', () => {
            const cells = createTestGrid(createGridA);
            const setup = setupGridNavigation(signal(cells), {
              rowWrap: signal('continuous'),
              colWrap: signal('continuous'),
            });
            const gridNav = setup.gridNav;
            const gridFocus = setup.gridFocus;

            gridNav.gotoCoords({row: 2, col: 2});
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
        });

        describe('case 2 (4x3 grid with spans)', () => {
          it('should advance from (0,0) (up, continuous, case 2)', () => {
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
            expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          });

          it('should advance from (3,2) (up, continuous, case 2)', () => {
            const cells = createTestGrid(createGridB);
            const setup = setupGridNavigation(signal(cells), {
              rowWrap: signal('continuous'),
              colWrap: signal('continuous'),
            });
            const gridNav = setup.gridNav;
            const gridFocus = setup.gridFocus;

            gridNav.gotoCoords({row: 3, col: 2});
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
        });

        describe('case 3 (3x4 grid with col spans)', () => {
          it('should advance from (0,0) (up, continuous, case 3)', () => {
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
            expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          });

          it('should advance from (2,3) (up, continuous, case 3)', () => {
            const cells = createTestGrid(createGridC);
            const setup = setupGridNavigation(signal(cells), {
              rowWrap: signal('continuous'),
              colWrap: signal('continuous'),
            });
            const gridNav = setup.gridNav;
            const gridFocus = setup.gridFocus;

            gridNav.gotoCoords({row: 2, col: 3});
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
        });

        describe('case 4 (4x4 grid with complex span)', () => {
          it('should advance from (0,0) (up, continuous, case 4)', () => {
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
            expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          });

          it('should advance from (3,3) (up, continuous, case 4)', () => {
            const cells = createTestGrid(createGridD);
            const setup = setupGridNavigation(signal(cells), {
              rowWrap: signal('continuous'),
              colWrap: signal('continuous'),
            });
            const gridNav = setup.gridNav;
            const gridFocus = setup.gridFocus;

            gridNav.gotoCoords({row: 3, col: 3});
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
        });

        describe('case 5 (jagged grid)', () => {
          it('should advance from (0,0) (up, continuous, case 5)', () => {
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
            expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          });

          it('should advance from (0,2) (up, continuous, case 5)', () => {
            const cells = createTestGrid(createGridE);
            const setup = setupGridNavigation(signal(cells), {
              rowWrap: signal('continuous'),
              colWrap: signal('continuous'),
            });
            const gridNav = setup.gridNav;
            const gridFocus = setup.gridFocus;

            gridNav.gotoCoords({row: 0, col: 2});
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
        });

        describe('case 6 (grid with empty rows)', () => {
          it('should advance from (0,0) (up, continuous, case 6)', () => {
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
          });

          it('should advance from (2,2) (up, continuous, case 6)', () => {
            const cells = createTestGrid(createGridF);
            const setup = setupGridNavigation(signal(cells), {
              rowWrap: signal('continuous'),
              colWrap: signal('continuous'),
            });
            const gridNav = setup.gridNav;
            const gridFocus = setup.gridFocus;

            gridNav.gotoCoords({row: 2, col: 2});
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
      });

      describe('down', () => {
        describe('case 1 (3x3 grid)', () => {
          it('should advance from (0,0) (down, continuous, case 1)', () => {
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
          });

          it('should advance from (2,2) (down, continuous, case 1)', () => {
            const cells = createTestGrid(createGridA);
            const setup = setupGridNavigation(signal(cells), {
              rowWrap: signal('continuous'),
              colWrap: signal('continuous'),
            });
            const gridNav = setup.gridNav;
            const gridFocus = setup.gridFocus;

            gridNav.gotoCoords({row: 2, col: 2});
            gridNav.advance(direction.Down);
            expect(gridFocus.activeCell()!.id()).toBe('cell-2-2');
          });
        });

        describe('case 2 (4x3 grid with spans)', () => {
          it('should advance from (0,0) (down, continuous, case 2)', () => {
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
            expect(gridFocus.activeCell()!.id()).toBe('cell-3-2');
          });

          it('should advance from (3,2) (down, continuous, case 2)', () => {
            const cells = createTestGrid(createGridB);
            const {gridNav, gridFocus} = setupGridNavigation(signal(cells), {
              rowWrap: signal('continuous'),
              colWrap: signal('continuous'),
            });
            gridNav.gotoCoords({row: 3, col: 2});
            gridNav.advance(direction.Down);
            expect(gridFocus.activeCell()!.id()).toBe('cell-3-2');
          });
        });

        describe('case 3 (3x4 grid with col spans)', () => {
          it('should advance from (0,0) (down, continuous, case 3)', () => {
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
            expect(gridFocus.activeCell()!.id()).toBe('cell-2-2');
          });

          it('should advance from (2,3) (down, continuous, case 3)', () => {
            const cells = createTestGrid(createGridC);
            const {gridNav, gridFocus} = setupGridNavigation(signal(cells), {
              rowWrap: signal('continuous'),
              colWrap: signal('continuous'),
            });
            gridNav.gotoCoords({row: 2, col: 3});
            gridNav.advance(direction.Down);
            expect(gridFocus.activeCell()!.id()).toBe('cell-2-2');
          });
        });

        describe('case 4 (4x4 grid with complex span)', () => {
          it('should advance from (0,0) (down, continuous, case 4)', () => {
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
            expect(gridFocus.activeCell()!.id()).toBe('cell-3-2');
          });

          it('should advance from (3,3) (down, continuous, case 4)', () => {
            const cells = createTestGrid(createGridD);
            const {gridNav, gridFocus} = setupGridNavigation(signal(cells), {
              rowWrap: signal('continuous'),
              colWrap: signal('continuous'),
            });
            gridNav.gotoCoords({row: 3, col: 3});
            gridNav.advance(direction.Down);
            expect(gridFocus.activeCell()!.id()).toBe('cell-3-2');
          });
        });

        describe('case 5 (jagged grid)', () => {
          it('should advance from (0,0) (down, continuous, case 5)', () => {
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
            expect(gridFocus.activeCell()!.id()).toBe('cell-0-2');
          });

          it('should advance from end (down, continuous, case 5)', () => {
            const cells = createTestGrid(createGridE);
            const {gridNav, gridFocus} = setupGridNavigation(signal(cells), {
              rowWrap: signal('continuous'),
              colWrap: signal('continuous'),
            });
            gridNav.gotoCoords({row: 0, col: 2});
            gridNav.advance(direction.Down);
            expect(gridFocus.activeCell()!.id()).toBe('cell-0-2');
          });
        });

        describe('case 6', () => {
          it('should advance from start (down, continuous, case 6)', () => {
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
            expect(gridFocus.activeCell()!.id()).toBe('cell-2-2');
          });

          it('should advance from end (down, continuous, case 6)', () => {
            const cells = createTestGrid(createGridF);
            const {gridNav, gridFocus} = setupGridNavigation(signal(cells), {
              rowWrap: signal('continuous'),
              colWrap: signal('continuous'),
            });
            gridNav.gotoCoords({row: 2, col: 2});
            gridNav.advance(direction.Down);
            expect(gridFocus.activeCell()!.id()).toBe('cell-2-2');
          });
        });
      });

      describe('left', () => {
        describe('case 1', () => {
          it('should advance from start (left, continuous, case 1)', () => {
            const cells = createTestGrid(createGridA);
            const setup = setupGridNavigation(signal(cells), {
              rowWrap: signal('continuous'),
              colWrap: signal('continuous'),
            });
            const gridNav = setup.gridNav;
            const gridFocus = setup.gridFocus;

            gridNav.gotoCoords({row: 0, col: 0});
            expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
            // Advancing left from the first cell should not change the active cell.
            gridNav.advance(direction.Left);
            expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          });

          it('should advance from end (left, continuous, case 1)', () => {
            const cells = createTestGrid(createGridA);
            const setup = setupGridNavigation(signal(cells), {
              rowWrap: signal('continuous'),
              colWrap: signal('continuous'),
            });
            const gridNav = setup.gridNav;
            const gridFocus = setup.gridFocus;

            gridNav.gotoCoords({row: 2, col: 2});
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
        });

        describe('case 2', () => {
          it('should advance from start (left, continuous, case 2)', () => {
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
            expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          });

          it('should advance from end (left, continuous, case 2)', () => {
            const cells = createTestGrid(createGridB);
            const setup = setupGridNavigation(signal(cells), {
              rowWrap: signal('continuous'),
              colWrap: signal('continuous'),
            });
            const gridNav = setup.gridNav;
            const gridFocus = setup.gridFocus;

            gridNav.gotoCoords({row: 3, col: 2});
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
        });

        describe('case 3', () => {
          it('should advance from start (left, continuous, case 3)', () => {
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
            expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          });

          it('should advance from end (left, continuous, case 3)', () => {
            const cells = createTestGrid(createGridC);
            const setup = setupGridNavigation(signal(cells), {
              rowWrap: signal('continuous'),
              colWrap: signal('continuous'),
            });
            const gridNav = setup.gridNav;
            const gridFocus = setup.gridFocus;

            gridNav.gotoCoords({row: 2, col: 2});
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
        });

        describe('case 4', () => {
          it('should advance from start (left, continuous, case 4)', () => {
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
            expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          });

          it('should advance from end (left, continuous, case 4)', () => {
            const cells = createTestGrid(createGridD);
            const setup = setupGridNavigation(signal(cells), {
              rowWrap: signal('continuous'),
              colWrap: signal('continuous'),
            });
            const gridNav = setup.gridNav;
            const gridFocus = setup.gridFocus;

            gridNav.gotoCoords({row: 3, col: 2});
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
        });

        describe('case 5', () => {
          it('should advance from start (left, continuous, case 5)', () => {
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
            expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          });

          it('should advance from end (left, continuous, case 5)', () => {
            const cells = createTestGrid(createGridE);
            const setup = setupGridNavigation(signal(cells), {
              rowWrap: signal('continuous'),
              colWrap: signal('continuous'),
            });
            const gridNav = setup.gridNav;
            const gridFocus = setup.gridFocus;

            gridNav.gotoCoords({row: 2, col: 1});
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
        });

        describe('case 6', () => {
          it('should advance from start (left, continuous, case 6)', () => {
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
            expect(gridFocus.activeCell()!.id()).toBe('cell-0-0');
          });

          it('should advance from end (left, continuous, case 6)', () => {
            const cells = createTestGrid(createGridF);
            const setup = setupGridNavigation(signal(cells), {
              rowWrap: signal('continuous'),
              colWrap: signal('continuous'),
            });
            const gridNav = setup.gridNav;
            const gridFocus = setup.gridFocus;

            gridNav.gotoCoords({row: 2, col: 2});
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
      });

      describe('right', () => {
        describe('case 1', () => {
          it('should advance from start (right, continuous, case 1)', () => {
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
            expect(gridFocus.activeCell()!.id()).toBe('cell-2-2');
          });

          it('should advance from end (right, continuous, case 1)', () => {
            const cells = createTestGrid(createGridA);
            const setup = setupGridNavigation(signal(cells), {
              rowWrap: signal('continuous'),
              colWrap: signal('continuous'),
            });
            const gridNav = setup.gridNav;
            const gridFocus = setup.gridFocus;

            gridNav.gotoCoords({row: 2, col: 2});
            gridNav.advance(direction.Right);
            expect(gridFocus.activeCell()!.id()).toBe('cell-2-2');
          });
        });

        describe('case 2', () => {
          it('should advance from start (right, continuous, case 2)', () => {
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
            expect(gridFocus.activeCell()!.id()).toBe('cell-3-2');
          });

          it('should advance from end (right, continuous, case 2)', () => {
            const cells = createTestGrid(createGridB);
            const setup = setupGridNavigation(signal(cells), {
              rowWrap: signal('continuous'),
              colWrap: signal('continuous'),
            });
            const gridNav = setup.gridNav;
            const gridFocus = setup.gridFocus;

            gridNav.gotoCoords({row: 3, col: 2});
            gridNav.advance(direction.Right);
            expect(gridFocus.activeCell()!.id()).toBe('cell-3-2');
          });
        });

        describe('case 3', () => {
          it('should advance from start (right, continuous, case 3)', () => {
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
            expect(gridFocus.activeCell()!.id()).toBe('cell-2-2');
          });

          it('should advance from end (right, continuous, case 3)', () => {
            const cells = createTestGrid(createGridC);
            const setup = setupGridNavigation(signal(cells), {
              rowWrap: signal('continuous'),
              colWrap: signal('continuous'),
            });
            const gridNav = setup.gridNav;
            const gridFocus = setup.gridFocus;

            gridNav.gotoCoords({row: 2, col: 2});
            gridNav.advance(direction.Right);
            expect(gridFocus.activeCell()!.id()).toBe('cell-2-2');
          });
        });

        describe('case 4', () => {
          it('should advance from start (right, continuous, case 4)', () => {
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
            expect(gridFocus.activeCell()!.id()).toBe('cell-3-2');
          });

          it('should advance from end (right, continuous, case 4)', () => {
            const cells = createTestGrid(createGridD);
            const setup = setupGridNavigation(signal(cells), {
              rowWrap: signal('continuous'),
              colWrap: signal('continuous'),
            });
            const gridNav = setup.gridNav;
            const gridFocus = setup.gridFocus;

            gridNav.gotoCoords({row: 3, col: 2});
            gridNav.advance(direction.Right);
            expect(gridFocus.activeCell()!.id()).toBe('cell-3-2');
          });
        });

        describe('case 5', () => {
          it('should advance from start (right, continuous, case 5)', () => {
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
            expect(gridFocus.activeCell()!.id()).toBe('cell-2-1');
          });

          it('should advance from end (right, continuous, case 5)', () => {
            const cells = createTestGrid(createGridE);
            const setup = setupGridNavigation(signal(cells), {
              rowWrap: signal('continuous'),
              colWrap: signal('continuous'),
            });
            const gridNav = setup.gridNav;
            const gridFocus = setup.gridFocus;

            gridNav.gotoCoords({row: 2, col: 1});
            gridNav.advance(direction.Right);
            expect(gridFocus.activeCell()!.id()).toBe('cell-2-1');
          });
        });

        describe('case 6 (empty rows)', () => {
          it('should advance from (0,0) (right, continuous, case 6)', () => {
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
            expect(gridFocus.activeCell()!.id()).toBe('cell-2-2');
          });

          it('should advance from (2,2) (right, continuous, case 6)', () => {
            const cells = createTestGrid(createGridF);
            const setup = setupGridNavigation(signal(cells), {
              rowWrap: signal('continuous'),
              colWrap: signal('continuous'),
            });
            const gridNav = setup.gridNav;
            const gridFocus = setup.gridFocus;

            gridNav.gotoCoords({row: 2, col: 2});
            gridNav.advance(direction.Right);
            expect(gridFocus.activeCell()!.id()).toBe('cell-2-2');
          });
        });
      });
    });

    describe('wrap=loop', () => {
      describe('up', () => {
        it('should advance (up, loop, case 1)', () => {
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

        it('should advance (up, loop, case 2)', () => {
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

        it('should advance (up, loop, case 3)', () => {
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

        it('should advance (up, loop, case 4)', () => {
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

        it('should advance (up, loop, case 5)', () => {
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

        it('should advance (up, loop, case 6)', () => {
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
        it('should advance (down, loop, case 1)', () => {
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

        it('should advance (down, loop, case 2)', () => {
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

        it('should advance (down, loop, case 3)', () => {
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

        it('should advance (down, loop, case 4)', () => {
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

        it('should advance (down, loop, case 5)', () => {
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

        it('should advance (down, loop, case 6)', () => {
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
        it('should advance (left, loop, case 1)', () => {
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

        it('should advance (left, loop, case 2)', () => {
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

        it('should advance (left, loop, case 3)', () => {
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

        it('should advance (left, loop, case 4)', () => {
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

        it('should advance (left, loop, case 5)', () => {
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

        it('should advance (left, loop, case 6)', () => {
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
        it('should advance (right, loop, case 1)', () => {
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

        it('should advance (right, loop, case 2)', () => {
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

        it('should advance (right, loop, case 3)', () => {
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

        it('should advance (right, loop, case 4)', () => {
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

        it('should advance (right, loop, case 5)', () => {
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

        it('should advance (right, loop, case 6)', () => {
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
        it('should advance from (2,0) (up, nowrap, case 1)', () => {
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

        it('should advance from (3,1) (up, nowrap, case 2)', () => {
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

        it('should advance from (2,0) (up, nowrap, case 3)', () => {
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

        it('should advance from (3,0) (up, nowrap, case 4)', () => {
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

        it('should advance from (2,0) (up, nowrap, case 5)', () => {
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

        it('should advance from (2,0) (up, nowrap, case 6)', () => {
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
        it('should advance from (0,0) (down, nowrap, case 1)', () => {
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

        it('should advance from (0,1) (down, nowrap, case 2)', () => {
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

        it('should advance from (0,0) (down, nowrap, case 3)', () => {
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

        it('should advance from (0,0) (down, nowrap, case 4)', () => {
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

        it('should advance from (0,0) (down, nowrap, case 5)', () => {
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

        it('should advance from (0,0) (down, nowrap, case 6)', () => {
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
        it('should advance from (0,2) (left, nowrap, case 1)', () => {
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

        it('should advance from (0,2) (left, nowrap, case 2)', () => {
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

        it('should advance from (0,3) (left, nowrap, case 3)', () => {
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

        it('should advance from (0,3) (left, nowrap, case 4)', () => {
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

        it('should advance from (0,2) (left, nowrap, case 5)', () => {
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

        it('should advance from (0,2) (left, nowrap, case 6)', () => {
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
        it('should advance from (0,0) (right, nowrap, case 1)', () => {
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

        it('should advance from (0,0) (right, nowrap, case 2)', () => {
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

        it('should advance from (0,0) (right, nowrap, case 3)', () => {
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

        it('should advance from (0,0) (right, nowrap, case 4)', () => {
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

        it('should advance from (0,0) (right, nowrap, case 5)', () => {
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

        it('should advance from (0,0) (right, nowrap, case 6)', () => {
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

    it('should get disabled cells when allowDisabled is true and softDisabled is false (first)', () => {
      const cells = createTestGrid(createGridA);
      const {gridNav} = setupGridNavigation(signal(cells), {softDisabled: signal(false)});
      cells[0][0].disabled.set(true);

      const firstCoords = gridNav.peekFirst(undefined, true);

      expect(firstCoords).toEqual({row: 0, col: 0});
      expect(gridNav.peekFirst()).toEqual({row: 0, col: 1});
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

    it('should get disabled cells when allowDisabled is true and softDisabled is false (last)', () => {
      const cells = createTestGrid(createGridA);
      const {gridNav} = setupGridNavigation(signal(cells), {softDisabled: signal(false)});
      cells[2][2].disabled.set(true);

      const lastCoords = gridNav.peekLast(undefined, true);

      expect(lastCoords).toEqual({row: 2, col: 2});
      expect(gridNav.peekLast()).toEqual({row: 2, col: 1});
    });
  });
});
