/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, signal, WritableSignal} from '@angular/core';
import {GridFocus} from '../grid-focus/grid-focus';
import {GridNavigation, GridNavigationCell, GridNavigationInputs} from './grid-navigation';

type TestGridNav = GridNavigation<TestCell>;

interface TestCell extends GridNavigationCell {
  disabled: WritableSignal<boolean>;
}

interface TestCellInputs {
  rowspan?: number;
  colspan?: number;
}

function createCell(config?: TestCellInputs): TestCell {
  const element = document.createElement('div');
  spyOn(element, 'focus').and.callThrough();

  return {
    id: signal(''),
    element: signal(element),
    disabled: signal(false),
    rowindex: signal(0),
    colindex: signal(0),
    rowspan: signal(config?.rowspan ?? 1),
    colspan: signal(config?.colspan ?? 1),
  };
}

type TestGridNavInputs = Partial<GridNavigationInputs<TestCell>> &
  Pick<GridNavigationInputs<TestCell>, 'cells'>;

function createGridNav(config: TestGridNavInputs): {gridNav: TestGridNav; cells: TestCell[][]} {
  const wrap = signal(true);
  const disabled = signal(false);
  const skipDisabled = signal(false);
  const focusMode = signal('roving' as const);
  const activeCoords = signal({row: 0, col: 0});
  const wrapBehavior = signal('continuous' as const);

  const gridFocus = new GridFocus<TestCell>({
    disabled,
    focusMode,
    activeCoords,
    skipDisabled,
    ...config,
  });

  const gridNav = new GridNavigation<TestCell>({
    wrap,
    disabled,
    focusMode,
    activeCoords,
    skipDisabled,
    wrapBehavior,
    gridFocus,
    ...config,
  });

  for (const row of config.cells()) {
    for (const cell of row) {
      const coordinates = computed(() => gridFocus.getCoordinates(cell) ?? {row: -1, col: -1});
      cell.rowindex = computed(() => coordinates().row);
      cell.colindex = computed(() => coordinates().col);
    }
  }

  return {gridNav, cells: config.cells()};
}

describe('GridNavigation', () => {
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
  let gridA = signal<TestCell[][]>([]);

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
  let gridB = signal<TestCell[][]>([]);

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
  let gridC = signal<TestCell[][]>([]);

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
  let gridD = signal<TestCell[][]>([]);

  beforeEach(() => {
    gridA.set([
      [createCell(), createCell(), createCell()],
      [createCell(), createCell(), createCell()],
      [createCell(), createCell(), createCell()],
    ]);

    gridB.set([
      [createCell(), createCell(), createCell({rowspan: 2})],
      [createCell(), createCell({rowspan: 2})],
      [createCell({rowspan: 2}), createCell()],
      [createCell(), createCell()],
    ]);

    gridC.set([
      [createCell({colspan: 2}), createCell(), createCell()],
      [createCell(), createCell({colspan: 2}), createCell()],
      [createCell(), createCell(), createCell({colspan: 2})],
    ]);

    gridD.set([
      [createCell({rowspan: 2}), createCell({colspan: 2}), createCell()],
      [createCell({rowspan: 2, colspan: 2}), createCell({rowspan: 2})],
      [createCell()],
      [createCell(), createCell(), createCell({colspan: 2})],
    ]);
  });

  describe('up()', () => {
    it('should navigate up', () => {
      const {gridNav} = createGridNav({
        cells: gridA,
        activeCoords: signal({row: 1, col: 1}),
      });
      const result = gridNav.up();
      expect(result).toBeTrue();
      expect(gridNav.inputs.activeCoords()).toEqual({row: 0, col: 1});
    });

    it('(wrap: false) should not wrap', () => {
      const {gridNav} = createGridNav({
        cells: gridA,
        wrap: signal(false),
        activeCoords: signal({row: 0, col: 1}),
      });
      gridNav.up();
      expect(gridNav.inputs.activeCoords()).toEqual({row: 0, col: 1});
    });

    it('(skip disabled: false) should be able to navigate through disabled cells', () => {
      const {gridNav, cells} = createGridNav({
        cells: gridA,
        skipDisabled: signal(false),
        activeCoords: signal({row: 1, col: 1}),
      });
      cells[0][1].disabled.set(true);
      gridNav.up();
      expect(gridNav.inputs.activeCoords()).toEqual({row: 0, col: 1});
    });

    it('(skip disabled: true) should skip disabled cells', () => {
      const {gridNav, cells} = createGridNav({
        cells: gridA,
        skipDisabled: signal(true),
        activeCoords: signal({row: 2, col: 1}),
      });
      cells[1][1].disabled.set(true);
      gridNav.up();
      expect(gridNav.inputs.activeCoords()).toEqual({row: 0, col: 1});
    });

    it('(wrap: false) (skip disabled: true) should not navigate through disabled cells', () => {
      const {gridNav, cells} = createGridNav({
        cells: gridA,
        wrap: signal(false),
        skipDisabled: signal(true),
        activeCoords: signal({row: 1, col: 1}),
      });
      cells[0][1].disabled.set(true);
      gridNav.up();
      expect(gridNav.inputs.activeCoords()).toEqual({row: 1, col: 1});
    });

    it('(disabled: true) should not navigate', () => {
      const {gridNav} = createGridNav({
        cells: gridA,
        disabled: signal(true),
        activeCoords: signal({row: 1, col: 1}),
      });
      const result = gridNav.up();
      expect(result).toBeFalse();
      expect(gridNav.inputs.activeCoords()).toEqual({row: 1, col: 1});
    });

    describe('(wrap: true)', () => {
      describe('(wrap behavior: loop)', () => {
        it('should loop to the last cell of the current column', () => {
          const {gridNav} = createGridNav({
            cells: gridA,
            wrap: signal(true),
            wrapBehavior: signal('loop'),
            activeCoords: signal({row: 0, col: 1}),
          });
          gridNav.up();
          expect(gridNav.inputs.activeCoords()).toEqual({row: 2, col: 1});
        });

        it('should wrap until it finds a cell that is focusable', () => {
          const {gridNav, cells} = createGridNav({
            cells: gridA,
            wrap: signal(true),
            skipDisabled: signal(true),
            wrapBehavior: signal('loop'),
            activeCoords: signal({row: 0, col: 1}),
          });
          cells[2][1].disabled.set(true);
          gridNav.up();
          expect(gridNav.inputs.activeCoords()).toEqual({row: 1, col: 1});
        });

        it('should not navigate if all cells that would be navigated to are unfocusable', () => {
          const {gridNav, cells} = createGridNav({
            cells: gridA,
            wrap: signal(true),
            skipDisabled: signal(true),
            wrapBehavior: signal('loop'),
            activeCoords: signal({row: 0, col: 1}),
          });
          cells[1][1].disabled.set(true);
          cells[2][1].disabled.set(true);
          const result = gridNav.up();
          expect(result).toBeFalse();
          expect(gridNav.inputs.activeCoords()).toEqual({row: 0, col: 1});
        });
      });

      describe('(wrap behavior: continuous)', () => {
        it('should wrap to the last cell of the previous column', () => {
          const {gridNav} = createGridNav({
            cells: gridA,
            wrap: signal(true),
            wrapBehavior: signal('continuous'),
            activeCoords: signal({row: 0, col: 1}),
          });
          gridNav.up();
          expect(gridNav.inputs.activeCoords()).toEqual({row: 2, col: 0});
        });

        it('should wrap to the last cell of the last column', () => {
          const {gridNav} = createGridNav({
            cells: gridA,
            wrap: signal(true),
            wrapBehavior: signal('continuous'),
            activeCoords: signal({row: 0, col: 0}),
          });
          gridNav.up();
          expect(gridNav.inputs.activeCoords()).toEqual({row: 2, col: 2});
        });

        it('should wrap until it finds a cell that is focusable', () => {
          const {gridNav, cells} = createGridNav({
            cells: gridA,
            wrap: signal(true),
            skipDisabled: signal(true),
            wrapBehavior: signal('continuous'),
            activeCoords: signal({row: 0, col: 1}),
          });

          cells[0][0].disabled.set(true);
          cells[1][0].disabled.set(true);
          cells[2][0].disabled.set(true);

          cells[1][1].disabled.set(true);
          cells[2][1].disabled.set(true);

          cells[0][2].disabled.set(true);
          cells[2][2].disabled.set(true);

          gridNav.up();
          expect(gridNav.inputs.activeCoords()).toEqual({row: 1, col: 2});
        });

        it('should wrap until it finds a cell that is focusable', () => {
          const {gridNav, cells} = createGridNav({
            cells: gridA,
            wrap: signal(true),
            skipDisabled: signal(true),
            wrapBehavior: signal('continuous'),
            activeCoords: signal({row: 0, col: 1}),
          });

          cells[0][0].disabled.set(true);
          cells[1][0].disabled.set(true);
          cells[2][0].disabled.set(true);

          cells[1][1].disabled.set(true);
          cells[2][1].disabled.set(true);

          cells[0][2].disabled.set(true);
          cells[0][1].disabled.set(true);
          cells[2][2].disabled.set(true);

          gridNav.up();
          expect(gridNav.inputs.activeCoords()).toEqual({row: 1, col: 2});
        });

        it('should not navigate if all cells that would be navigated to are unfocusable', () => {
          const {gridNav, cells} = createGridNav({
            cells: gridA,
            wrap: signal(true),
            skipDisabled: signal(true),
            wrapBehavior: signal('continuous'),
            activeCoords: signal({row: 1, col: 1}),
          });
          cells[0][0].disabled.set(true);
          cells[1][0].disabled.set(true);
          cells[2][0].disabled.set(true);
          cells[0][1].disabled.set(true);
          cells[2][1].disabled.set(true);
          cells[0][2].disabled.set(true);
          cells[1][2].disabled.set(true);
          cells[2][2].disabled.set(true);

          const result = gridNav.up();
          expect(result).toBeFalse();
          expect(gridNav.inputs.activeCoords()).toEqual({row: 1, col: 1});
        });
      });
    });

    describe('with rowspan set', () => {
      it('should navigate correctly', () => {
        const {gridNav} = createGridNav({
          cells: gridB,
          activeCoords: signal({row: 3, col: 2}),
        });

        gridNav.up();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 2, col: 2});
        gridNav.up();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 0, col: 2});
        gridNav.up();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 3, col: 1});
        gridNav.up();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 1, col: 1});
        gridNav.up();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 0, col: 1});
        gridNav.up();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 2, col: 0});
        gridNav.up();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 1, col: 0});
        gridNav.up();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 0, col: 0});
        gridNav.up();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 3, col: 2});
      });

      it('should navigate correctly when in a subcoordinate of a cell', () => {
        const {gridNav} = createGridNav({
          cells: gridB,
          activeCoords: signal({row: 3, col: 0}),
        });
        gridNav.up();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 1, col: 0});
      });

      it('(skip disabled: true) should skip disabled cells', () => {
        const {gridNav, cells} = createGridNav({
          cells: gridB,
          skipDisabled: signal(true),
          activeCoords: signal({row: 2, col: 2}),
        });
        cells[0][2].disabled.set(true);
        cells[2][0].disabled.set(true);
        gridNav.up();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 3, col: 1});
        gridNav.up();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 1, col: 1});
        gridNav.up();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 0, col: 1});
        gridNav.up();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 1, col: 0});
      });

      it('(wrap: false) should navigate correctly when in a subcoordinate of a cell', () => {
        const {gridNav} = createGridNav({
          cells: gridB,
          wrap: signal(false),
          activeCoords: signal({row: 1, col: 2}),
        });
        gridNav.up();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 0, col: 2});
      });
    });

    describe('with colspan set', () => {
      it('should navigate correctly', () => {
        const {gridNav} = createGridNav({
          cells: gridC,
          activeCoords: signal({row: 2, col: 3}),
        });

        gridNav.up();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 1, col: 3});
        gridNav.up();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 0, col: 3});
        gridNav.up();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 2, col: 2});
        gridNav.up();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 1, col: 2});
        gridNav.up();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 0, col: 2});
        gridNav.up();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 2, col: 1});
        gridNav.up();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 1, col: 1});
        gridNav.up();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 0, col: 1});
        gridNav.up();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 2, col: 0});
        gridNav.up();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 1, col: 0});
        gridNav.up();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 0, col: 0});
        gridNav.up();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 2, col: 3});
      });

      it('(skip disabled: true) should skip disabled cells', () => {
        const {gridNav, cells} = createGridNav({
          cells: gridC,
          skipDisabled: signal(true),
          activeCoords: signal({row: 1, col: 2}),
        });
        cells[0][0].disabled.set(true);
        cells[0][1].disabled.set(true);
        cells[2][1].disabled.set(true);

        const result = gridNav.up();
        expect(result).toBeTrue();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 1, col: 1});
        gridNav.up();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 2, col: 0});
        gridNav.up();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 1, col: 0});
        gridNav.up();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 2, col: 3});
      });
    });

    describe('with rowspan and colspan set', () => {
      it('should navigate correctly', () => {
        const {gridNav} = createGridNav({
          cells: gridD,
          activeCoords: signal({row: 3, col: 3}),
        });

        gridNav.up();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 1, col: 3});
        gridNav.up();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 0, col: 3});
        gridNav.up();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 3, col: 2});
        gridNav.up();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 1, col: 2});
        gridNav.up();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 0, col: 2});
        gridNav.up();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 3, col: 1});
        gridNav.up();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 1, col: 1});
        gridNav.up();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 0, col: 1});
        gridNav.up();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 3, col: 0});
        gridNav.up();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 2, col: 0});
        gridNav.up();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 0, col: 0});
        gridNav.up();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 3, col: 3});
      });

      it('(skip disabled: true) should skip disabled cells', () => {
        const {gridNav, cells} = createGridNav({
          cells: gridD,
          skipDisabled: signal(true),
          activeCoords: signal({row: 3, col: 3}),
        });

        cells[1][0].disabled.set(true);
        cells[1][1].disabled.set(true);

        gridNav.up();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 0, col: 3});
        gridNav.up();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 3, col: 2});
        gridNav.up();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 0, col: 2});
        gridNav.up();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 3, col: 1});
        gridNav.up();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 0, col: 1});
      });
    });
  });

  describe('down()', () => {
    it('should navigate down', () => {
      const {gridNav} = createGridNav({
        cells: gridA,
        activeCoords: signal({row: 1, col: 1}),
      });
      const result = gridNav.down();
      expect(result).toBeTrue();
      expect(gridNav.inputs.activeCoords()).toEqual({row: 2, col: 1});
    });

    it('(wrap: false) should not wrap', () => {
      const {gridNav} = createGridNav({
        cells: gridA,
        wrap: signal(false),
        activeCoords: signal({row: 2, col: 1}),
      });
      gridNav.down();
      expect(gridNav.inputs.activeCoords()).toEqual({row: 2, col: 1});
    });

    it('(skip disabled: false) should be able to navigate through disabled cells', () => {
      const {gridNav, cells} = createGridNav({
        cells: gridA,
        skipDisabled: signal(false),
        activeCoords: signal({row: 1, col: 1}),
      });
      cells[2][1].disabled.set(true);
      gridNav.down();
      expect(gridNav.inputs.activeCoords()).toEqual({row: 2, col: 1});
    });

    it('(skip disabled: true) should skip disabled cells', () => {
      const {gridNav, cells} = createGridNav({
        cells: gridA,
        skipDisabled: signal(true),
        activeCoords: signal({row: 0, col: 1}),
      });
      cells[1][1].disabled.set(true);
      gridNav.down();
      expect(gridNav.inputs.activeCoords()).toEqual({row: 2, col: 1});
    });

    it('(wrap: false) (skip disabled: true) should not navigate through disabled cells', () => {
      const {gridNav, cells} = createGridNav({
        cells: gridA,
        wrap: signal(false),
        skipDisabled: signal(true),
        activeCoords: signal({row: 1, col: 1}),
      });
      cells[2][1].disabled.set(true);
      gridNav.down();
      expect(gridNav.inputs.activeCoords()).toEqual({row: 1, col: 1});
    });

    it('(disabled: true) should not navigate', () => {
      const {gridNav} = createGridNav({
        cells: gridA,
        disabled: signal(true),
        activeCoords: signal({row: 1, col: 1}),
      });
      const result = gridNav.down();
      expect(result).toBeFalse();
      expect(gridNav.inputs.activeCoords()).toEqual({row: 1, col: 1});
    });

    describe('(wrap: true)', () => {
      describe('(wrap behavior: loop)', () => {
        it('should loop to the first cell of the current column', () => {
          const {gridNav} = createGridNav({
            cells: gridA,
            wrap: signal(true),
            wrapBehavior: signal('loop'),
            activeCoords: signal({row: 2, col: 1}),
          });
          gridNav.down();
          expect(gridNav.inputs.activeCoords()).toEqual({row: 0, col: 1});
        });

        it('should wrap until it finds a cell that is focusable', () => {
          const {gridNav, cells} = createGridNav({
            cells: gridA,
            wrap: signal(true),
            skipDisabled: signal(true),
            wrapBehavior: signal('loop'),
            activeCoords: signal({row: 2, col: 1}),
          });
          cells[0][1].disabled.set(true);
          gridNav.down();
          expect(gridNav.inputs.activeCoords()).toEqual({row: 1, col: 1});
        });

        it('should not navigate if all cells that would be navigated to are unfocusable', () => {
          const {gridNav, cells} = createGridNav({
            cells: gridA,
            wrap: signal(true),
            skipDisabled: signal(true),
            wrapBehavior: signal('loop'),
            activeCoords: signal({row: 2, col: 1}),
          });
          cells[0][1].disabled.set(true);
          cells[1][1].disabled.set(true);
          const result = gridNav.down();
          expect(result).toBeFalse();
          expect(gridNav.inputs.activeCoords()).toEqual({row: 2, col: 1});
        });
      });

      describe('(wrap behavior: continuous)', () => {
        it('should wrap to the first cell of the next column', () => {
          const {gridNav} = createGridNav({
            cells: gridA,
            wrap: signal(true),
            wrapBehavior: signal('continuous'),
            activeCoords: signal({row: 2, col: 1}),
          });
          gridNav.down();
          expect(gridNav.inputs.activeCoords()).toEqual({row: 0, col: 2});
        });

        it('should wrap until it finds a cell that is focusable', () => {
          const {gridNav, cells} = createGridNav({
            cells: gridA,
            wrap: signal(true),
            skipDisabled: signal(true),
            wrapBehavior: signal('continuous'),
            activeCoords: signal({row: 2, col: 1}),
          });

          cells[0][2].disabled.set(true);
          cells[1][2].disabled.set(true);

          gridNav.down();
          // Should land on (2,2)
          expect(gridNav.inputs.activeCoords()).toEqual({row: 2, col: 2});
        });

        it('should not navigate if all cells that would be navigated to are unfocusable', () => {
          const {gridNav, cells} = createGridNav({
            cells: gridA,
            wrap: signal(true),
            skipDisabled: signal(true),
            wrapBehavior: signal('continuous'),
            activeCoords: signal({row: 1, col: 1}),
          });
          cells[0][0].disabled.set(true);
          cells[1][0].disabled.set(true);
          cells[2][0].disabled.set(true);
          cells[0][1].disabled.set(true);
          cells[2][1].disabled.set(true);
          cells[0][2].disabled.set(true);
          cells[1][2].disabled.set(true);
          cells[2][2].disabled.set(true);

          const result = gridNav.down();
          expect(result).toBeFalse();
          expect(gridNav.inputs.activeCoords()).toEqual({row: 1, col: 1});
        });

        it('should wrap to the first cell of the first column', () => {
          const {gridNav} = createGridNav({
            cells: gridA,
            wrap: signal(true),
            wrapBehavior: signal('continuous'),
            activeCoords: signal({row: 2, col: 2}),
          });
          gridNav.down();
          expect(gridNav.inputs.activeCoords()).toEqual({row: 0, col: 0});
        });
      });
    });

    describe('with rowspan set', () => {
      it('should navigate correctly', () => {
        const {gridNav} = createGridNav({
          cells: gridB,
          activeCoords: signal({row: 0, col: 0}),
        });

        gridNav.down();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 1, col: 0});
        gridNav.down();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 2, col: 0});
        gridNav.down();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 0, col: 1});
      });

      it('should navigate correctly when in a subcoordinate of a cell', () => {
        const {gridNav} = createGridNav({
          cells: gridB,
          activeCoords: signal({row: 1, col: 2}),
        });
        gridNav.down();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 2, col: 2});
      });

      it('(skip disabled: true) should skip disabled cells', () => {
        const {gridNav, cells} = createGridNav({
          cells: gridB,
          skipDisabled: signal(true),
          activeCoords: signal({row: 0, col: 0}),
        });
        cells[1][0].disabled.set(true);
        gridNav.down();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 2, col: 0});
        gridNav.down();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 0, col: 1});
      });

      it('(wrap: false) should navigate correctly when in a subcoordinate of a cell', () => {
        const {gridNav} = createGridNav({
          cells: gridB,
          wrap: signal(false),
          activeCoords: signal({row: 0, col: 2}),
        });
        gridNav.down();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 2, col: 2});
      });
    });

    describe('with colspan set', () => {
      // For `down()`, colspan doesn't affect vertical navigation as much as rowspan.
      // Basic navigation should still work.
      it('should navigate correctly', () => {
        const {gridNav} = createGridNav({cells: gridC, activeCoords: signal({row: 0, col: 0})});
        gridNav.down();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 1, col: 0});
      });
    });
  });

  describe('left()', () => {
    it('should navigate left', () => {
      const {gridNav} = createGridNav({
        cells: gridA,
        activeCoords: signal({row: 1, col: 1}),
      });
      const result = gridNav.left();
      expect(result).toBeTrue();
      expect(gridNav.inputs.activeCoords()).toEqual({row: 1, col: 0});
    });

    it('(wrap: false) should not wrap', () => {
      const {gridNav} = createGridNav({
        cells: gridA,
        wrap: signal(false),
        activeCoords: signal({row: 1, col: 0}),
      });
      gridNav.left();
      expect(gridNav.inputs.activeCoords()).toEqual({row: 1, col: 0});
    });

    it('(skip disabled: false) should be able to navigate through disabled cells', () => {
      const {gridNav, cells} = createGridNav({
        cells: gridA,
        skipDisabled: signal(false),
        activeCoords: signal({row: 1, col: 1}),
      });
      cells[1][0].disabled.set(true);
      gridNav.left();
      expect(gridNav.inputs.activeCoords()).toEqual({row: 1, col: 0});
    });

    it('(skip disabled: true) should skip disabled cells', () => {
      const {gridNav, cells} = createGridNav({
        cells: gridA,
        skipDisabled: signal(true),
        activeCoords: signal({row: 1, col: 2}),
      });
      cells[1][1].disabled.set(true);
      gridNav.left();
      expect(gridNav.inputs.activeCoords()).toEqual({row: 1, col: 0});
    });

    it('(wrap: false) (skip disabled: true) should not navigate through disabled cells', () => {
      const {gridNav, cells} = createGridNav({
        cells: gridA,
        wrap: signal(false),
        skipDisabled: signal(true),
        activeCoords: signal({row: 1, col: 1}),
      });
      cells[1][0].disabled.set(true);
      gridNav.left();
      expect(gridNav.inputs.activeCoords()).toEqual({row: 1, col: 1});
    });

    it('(disabled: true) should not navigate', () => {
      const {gridNav} = createGridNav({
        cells: gridA,
        disabled: signal(true),
        activeCoords: signal({row: 1, col: 1}),
      });
      const result = gridNav.left();
      expect(result).toBeFalse();
      expect(gridNav.inputs.activeCoords()).toEqual({row: 1, col: 1});
    });

    describe('(wrap: true)', () => {
      describe('(wrap behavior: loop)', () => {
        it('should loop to the last cell of the current row', () => {
          const {gridNav} = createGridNav({
            cells: gridA,
            wrap: signal(true),
            wrapBehavior: signal('loop'),
            activeCoords: signal({row: 1, col: 0}),
          });
          gridNav.left();
          expect(gridNav.inputs.activeCoords()).toEqual({row: 1, col: 2});
        });

        it('should wrap until it finds a cell that is focusable', () => {
          const {gridNav, cells} = createGridNav({
            cells: gridA,
            wrap: signal(true),
            skipDisabled: signal(true),
            wrapBehavior: signal('loop'),
            activeCoords: signal({row: 1, col: 0}),
          });
          cells[1][2].disabled.set(true);
          gridNav.left();
          expect(gridNav.inputs.activeCoords()).toEqual({row: 1, col: 1});
        });

        it('should not navigate if all cells that would be navigated to are unfocusable', () => {
          const {gridNav, cells} = createGridNav({
            cells: gridA,
            wrap: signal(true),
            skipDisabled: signal(true),
            wrapBehavior: signal('loop'),
            activeCoords: signal({row: 1, col: 0}),
          });
          cells[1][2].disabled.set(true);
          cells[1][1].disabled.set(true);
          const result = gridNav.left();
          expect(result).toBeFalse();
          expect(gridNav.inputs.activeCoords()).toEqual({row: 1, col: 0});
        });
      });

      describe('(wrap behavior: continuous)', () => {
        it('should wrap to the last cell of the previous row', () => {
          const {gridNav} = createGridNav({
            cells: gridA,
            wrap: signal(true),
            wrapBehavior: signal('continuous'),
            activeCoords: signal({row: 1, col: 0}),
          });
          gridNav.left();
          expect(gridNav.inputs.activeCoords()).toEqual({row: 0, col: 2});
        });

        it('should wrap until it finds a cell that is focusable', () => {
          const {gridNav, cells} = createGridNav({
            cells: gridA,
            wrap: signal(true),
            skipDisabled: signal(true),
            wrapBehavior: signal('continuous'),
            activeCoords: signal({row: 1, col: 0}),
          });

          cells[0][2].disabled.set(true);
          cells[0][1].disabled.set(true);

          gridNav.left();
          // Should land on (0,0)
          expect(gridNav.inputs.activeCoords()).toEqual({row: 0, col: 0});
        });

        it('should not navigate if all cells that would be navigated to are unfocusable', () => {
          const {gridNav, cells} = createGridNav({
            cells: gridA,
            wrap: signal(true),
            skipDisabled: signal(true),
            wrapBehavior: signal('continuous'),
            activeCoords: signal({row: 1, col: 1}),
          });
          cells[0][0].disabled.set(true);
          cells[1][0].disabled.set(true);
          cells[2][0].disabled.set(true);
          cells[0][1].disabled.set(true);
          cells[2][1].disabled.set(true);
          cells[0][2].disabled.set(true);
          cells[1][2].disabled.set(true);
          cells[2][2].disabled.set(true);
          const result = gridNav.left();
          expect(result).toBeFalse();
          expect(gridNav.inputs.activeCoords()).toEqual({row: 1, col: 1});
        });

        it('should wrap to the last cell of the last row', () => {
          const {gridNav} = createGridNav({
            cells: gridA,
            wrap: signal(true),
            wrapBehavior: signal('continuous'),
            activeCoords: signal({row: 0, col: 0}),
          });
          gridNav.left();
          expect(gridNav.inputs.activeCoords()).toEqual({row: 2, col: 2});
        });
      });
    });

    describe('with rowspan set', () => {
      // For `left()`, rowspan doesn't affect horizontal navigation as much as colspan.
      // Basic navigation should still work.
      it('should navigate correctly', () => {
        const {gridNav} = createGridNav({cells: gridB, activeCoords: signal({row: 0, col: 1})});
        gridNav.left();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 0, col: 0});
      });
    });

    describe('with colspan set', () => {
      it('should navigate correctly', () => {
        const {gridNav} = createGridNav({
          cells: gridC,
          activeCoords: signal({row: 0, col: 3}),
        });

        gridNav.left();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 0, col: 2});
        gridNav.left();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 0, col: 0});
        gridNav.left();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 2, col: 2});
      });

      it('should navigate correctly when in a subcoordinate of a cell', () => {
        const {gridNav} = createGridNav({
          cells: gridC,
          activeCoords: signal({row: 0, col: 1}),
        });
        gridNav.left();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 2, col: 2});
      });

      it('(skip disabled: true) should skip disabled cells', () => {
        const {gridNav, cells} = createGridNav({
          cells: gridC,
          skipDisabled: signal(true),
          activeCoords: signal({row: 0, col: 3}),
        });

        cells[0][1].disabled.set(true);
        gridNav.left();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 0, col: 0});
      });

      it('(wrap: false) should navigate correctly when in a subcoordinate of a cell', () => {
        const {gridNav} = createGridNav({
          cells: gridC,
          wrap: signal(false),
          activeCoords: signal({row: 0, col: 1}),
        });
        gridNav.left();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 0, col: 0});
      });
    });

    describe('with rowspan and colspan set', () => {
      it('should navigate correctly', () => {
        const {gridNav} = createGridNav({
          cells: gridD,
          activeCoords: signal({row: 0, col: 3}),
        });
        gridNav.left();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 0, col: 1});
        gridNav.left();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 0, col: 0});
      });
    });
  });

  describe('right()', () => {
    it('should navigate right', () => {
      const {gridNav} = createGridNav({
        cells: gridA,
        activeCoords: signal({row: 1, col: 1}),
      });
      const result = gridNav.right();
      expect(result).toBeTrue();
      expect(gridNav.inputs.activeCoords()).toEqual({row: 1, col: 2});
    });

    it('(wrap: false) should not wrap', () => {
      const {gridNav} = createGridNav({
        cells: gridA,
        wrap: signal(false),
        activeCoords: signal({row: 1, col: 2}),
      });
      gridNav.right();
      expect(gridNav.inputs.activeCoords()).toEqual({row: 1, col: 2});
    });

    it('(skip disabled: false) should be able to navigate through disabled cells', () => {
      const {gridNav, cells} = createGridNav({
        cells: gridA,
        skipDisabled: signal(false),
        activeCoords: signal({row: 1, col: 1}),
      });
      cells[1][2].disabled.set(true);
      gridNav.right();
      expect(gridNav.inputs.activeCoords()).toEqual({row: 1, col: 2});
    });

    it('(skip disabled: true) should skip disabled cells', () => {
      const {gridNav, cells} = createGridNav({
        cells: gridA,
        skipDisabled: signal(true),
        activeCoords: signal({row: 1, col: 0}),
      });
      cells[1][1].disabled.set(true);
      gridNav.right();
      expect(gridNav.inputs.activeCoords()).toEqual({row: 1, col: 2});
    });

    it('(wrap: false) (skip disabled: true) should not navigate through disabled cells', () => {
      const {gridNav, cells} = createGridNav({
        cells: gridA,
        wrap: signal(false),
        skipDisabled: signal(true),
        activeCoords: signal({row: 1, col: 1}),
      });
      cells[1][2].disabled.set(true);
      gridNav.right();
      expect(gridNav.inputs.activeCoords()).toEqual({row: 1, col: 1});
    });

    it('(disabled: true) should not navigate', () => {
      const {gridNav} = createGridNav({
        cells: gridA,
        disabled: signal(true),
        activeCoords: signal({row: 1, col: 1}),
      });
      const result = gridNav.right();
      expect(result).toBeFalse();
      expect(gridNav.inputs.activeCoords()).toEqual({row: 1, col: 1});
    });

    describe('(wrap: true)', () => {
      describe('(wrap behavior: loop)', () => {
        it('should loop to the first cell of the current row', () => {
          const {gridNav} = createGridNav({
            cells: gridA,
            wrap: signal(true),
            wrapBehavior: signal('loop'),
            activeCoords: signal({row: 1, col: 2}),
          });
          gridNav.right();
          expect(gridNav.inputs.activeCoords()).toEqual({row: 1, col: 0});
        });

        it('should wrap until it finds a cell that is focusable', () => {
          const {gridNav, cells} = createGridNav({
            cells: gridA,
            wrap: signal(true),
            skipDisabled: signal(true),
            wrapBehavior: signal('loop'),
            activeCoords: signal({row: 1, col: 2}),
          });
          cells[1][0].disabled.set(true);
          gridNav.right();
          expect(gridNav.inputs.activeCoords()).toEqual({row: 1, col: 1});
        });

        it('should not navigate if all cells that would be navigated to are unfocusable', () => {
          const {gridNav, cells} = createGridNav({
            cells: gridA,
            wrap: signal(true),
            skipDisabled: signal(true),
            wrapBehavior: signal('loop'),
            activeCoords: signal({row: 1, col: 2}),
          });
          cells[1][0].disabled.set(true);
          cells[1][1].disabled.set(true);
          const result = gridNav.right();
          expect(result).toBeFalse();
          expect(gridNav.inputs.activeCoords()).toEqual({row: 1, col: 2});
        });
      });

      describe('(wrap behavior: continuous)', () => {
        it('should wrap to the first cell of the next row', () => {
          const {gridNav} = createGridNav({
            cells: gridA,
            wrap: signal(true),
            wrapBehavior: signal('continuous'),
            activeCoords: signal({row: 1, col: 2}),
          });
          gridNav.right();
          expect(gridNav.inputs.activeCoords()).toEqual({row: 2, col: 0});
        });

        it('should wrap until it finds a cell that is focusable', () => {
          const {gridNav, cells} = createGridNav({
            cells: gridA,
            wrap: signal(true),
            skipDisabled: signal(true),
            wrapBehavior: signal('continuous'),
            activeCoords: signal({row: 1, col: 2}),
          });

          cells[2][0].disabled.set(true);
          cells[2][1].disabled.set(true);

          gridNav.right();
          // Should land on (2,2)
          expect(gridNav.inputs.activeCoords()).toEqual({row: 2, col: 2});
        });

        it('should not navigate if all cells that would be navigated to are unfocusable', () => {
          const {gridNav, cells} = createGridNav({
            cells: gridA,
            wrap: signal(true),
            skipDisabled: signal(true),
            wrapBehavior: signal('continuous'),
            activeCoords: signal({row: 1, col: 1}),
          });
          cells[0][0].disabled.set(true);
          cells[1][0].disabled.set(true);
          cells[2][0].disabled.set(true);
          cells[0][1].disabled.set(true);
          cells[2][1].disabled.set(true);
          cells[0][2].disabled.set(true);
          cells[1][2].disabled.set(true);
          cells[2][2].disabled.set(true);
          const result = gridNav.right();
          expect(result).toBeFalse();
          expect(gridNav.inputs.activeCoords()).toEqual({row: 1, col: 1});
        });

        it('should wrap to the first cell of the first row', () => {
          const {gridNav} = createGridNav({
            cells: gridA,
            wrap: signal(true),
            wrapBehavior: signal('continuous'),
            activeCoords: signal({row: 2, col: 2}),
          });
          gridNav.right();
          expect(gridNav.inputs.activeCoords()).toEqual({row: 0, col: 0});
        });
      });
    });

    describe('with rowspan set', () => {
      // For `right()`, rowspan doesn't affect horizontal navigation as much as colspan.
      // Basic navigation should still work.
      it('should navigate correctly', () => {
        const {gridNav} = createGridNav({cells: gridB, activeCoords: signal({row: 0, col: 0})});
        gridNav.right();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 0, col: 1});
      });
    });

    describe('with colspan set', () => {
      it('should navigate correctly', () => {
        const {gridNav} = createGridNav({
          cells: gridC,
          activeCoords: signal({row: 0, col: 0}),
        });

        gridNav.right();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 0, col: 2});
        gridNav.right();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 0, col: 3});
        gridNav.right();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 1, col: 0});
      });

      it('should navigate correctly when in a subcoordinate of a cell', () => {
        const {gridNav} = createGridNav({
          cells: gridC,
          activeCoords: signal({row: 0, col: 1}),
        });
        gridNav.right();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 0, col: 2});
      });

      it('(skip disabled: true) should skip disabled cells', () => {
        const {gridNav, cells} = createGridNav({
          cells: gridC,
          skipDisabled: signal(true),
          activeCoords: signal({row: 0, col: 0}),
        });
        cells[0][1].disabled.set(true);
        gridNav.right();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 0, col: 3});
      });

      it('(wrap: false) should navigate correctly when in a subcoordinate of a cell', () => {
        const {gridNav} = createGridNav({
          cells: gridC,
          wrap: signal(false),
          activeCoords: signal({row: 0, col: 1}),
        });
        gridNav.right();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 0, col: 2});
      });
    });

    describe('with rowspan and colspan set', () => {
      it('should navigate correctly', () => {
        const {gridNav} = createGridNav({
          cells: gridD,
          activeCoords: signal({row: 0, col: 0}),
        });
        gridNav.right();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 0, col: 1});
        gridNav.right();
        expect(gridNav.inputs.activeCoords()).toEqual({row: 0, col: 3});
      });
    });
  });
});
