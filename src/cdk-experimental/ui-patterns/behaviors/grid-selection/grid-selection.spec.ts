/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, signal, WritableSignal} from '@angular/core';
import {GridFocus} from '../grid-focus/grid-focus';
import {GridSelection, GridSelectionCell, GridSelectionInputs} from './grid-selection';

type TestGridSelection = GridSelection<TestCell, string>;

interface TestCell extends GridSelectionCell<string> {
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
    value: signal(''),
    rowindex: signal(0),
    colindex: signal(0),
    disabled: signal(false),
    element: signal(element),
    rowspan: signal(config?.rowspan ?? 1),
    colspan: signal(config?.colspan ?? 1),
  };
}

type TestGridSelectionInputs = Partial<GridSelectionInputs<TestCell, string>> &
  Pick<GridSelectionInputs<TestCell, string>, 'cells'>;

function createGridSelection(config: TestGridSelectionInputs): {
  gridFocus: GridFocus<TestCell>;
  gridSelection: TestGridSelection;
  cells: TestCell[][];
} {
  const value = signal([]);
  const multi = signal(true);
  const disabled = signal(false);
  const skipDisabled = signal(false);
  const focusMode = signal('roving' as const);
  const activeCoords = signal({row: 0, col: 0});
  const selectionMode = signal('explicit' as const);

  const gridFocus = new GridFocus<TestCell>({
    disabled,
    focusMode,
    activeCoords,
    skipDisabled,
    ...config,
  });

  const gridSelection = new GridSelection<TestCell, string>({
    value,
    multi,
    disabled,
    focusMode,
    activeCoords,
    skipDisabled,
    selectionMode,
    focusManager: gridFocus,
    ...config,
  });

  for (const row of config.cells()) {
    for (const cell of row) {
      const coordinates = computed(() => gridFocus.getCoordinates(cell) ?? {row: -1, col: -1});
      cell.rowindex = computed(() => coordinates().row);
      cell.colindex = computed(() => coordinates().col);
      cell.value = computed(() => `(${cell.rowindex()},${cell.colindex()})`);
    }
  }

  return {gridSelection, gridFocus, cells: config.cells()};
}

describe('GridSelection', () => {
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

  describe('select()', () => {
    it('should select a cell', () => {
      const {gridSelection} = createGridSelection({
        cells: gridA,
        activeCoords: signal({row: 0, col: 0}),
      });
      gridSelection.select();
      expect(gridSelection.inputs.value()).toEqual(['(0,0)']);
    });

    it('should select multiple cells', () => {
      const {gridFocus, gridSelection} = createGridSelection({
        cells: gridA,
        activeCoords: signal({row: 0, col: 0}),
      });
      gridSelection.select();
      gridFocus.focusCoordinates({row: 1, col: 1});
      gridSelection.select();
      expect(gridSelection.inputs.value()).toEqual(['(0,0)', '(1,1)']);
    });

    it('should do nothing if a cell is already selected', () => {
      const {gridSelection} = createGridSelection({
        cells: gridA,
        activeCoords: signal({row: 0, col: 0}),
      });
      gridSelection.select();
      gridSelection.select();
      expect(gridSelection.inputs.value()).toEqual(['(0,0)']);
    });

    it('should not select a disabled cell', () => {
      const {gridSelection, cells} = createGridSelection({
        cells: gridA,
        multi: signal(true),
        activeCoords: signal({row: 0, col: 0}),
      });
      cells[0][0].disabled.set(true);
      gridSelection.select();
      expect(gridSelection.inputs.value()).toEqual([]);
    });

    it('should correctly select cells that span multiple rows', () => {
      const {gridSelection} = createGridSelection({
        cells: gridB,
        activeCoords: signal({row: 1, col: 2}),
      });
      gridSelection.select();
      expect(gridSelection.inputs.value()).toEqual(['(0,2)']);
    });

    it('should correctly select cells that span multiple columns', () => {
      const {gridSelection} = createGridSelection({
        cells: gridC,
        activeCoords: signal({row: 0, col: 1}),
      });
      gridSelection.select();
      expect(gridSelection.inputs.value()).toEqual(['(0,0)']);
    });

    it('should correctly select cells that span multiple rows and columns', () => {
      const {gridSelection} = createGridSelection({
        cells: gridD,
        activeCoords: signal({row: 2, col: 2}),
      });
      gridSelection.select();
      expect(gridSelection.inputs.value()).toEqual(['(1,1)']);
    });
  });

  describe('deselect()', () => {
    it('should deselect a selected cell', () => {
      const {gridSelection} = createGridSelection({
        cells: gridA,
        activeCoords: signal({row: 0, col: 0}),
        value: signal(['(0,0)']),
      });
      gridSelection.deselect();
      expect(gridSelection.inputs.value()).toEqual([]);
    });

    it('should deselect one cell when multiple are selected', () => {
      const {gridSelection} = createGridSelection({
        cells: gridA,
        activeCoords: signal({row: 0, col: 0}),
        value: signal(['(0,0)', '(1,1)']),
      });
      gridSelection.deselect();
      expect(gridSelection.inputs.value()).toEqual(['(1,1)']);
    });

    it('should do nothing if a cell is not selected', () => {
      const {gridSelection} = createGridSelection({
        cells: gridA,
        activeCoords: signal({row: 0, col: 0}),
        value: signal([]),
      });
      gridSelection.deselect();
      expect(gridSelection.inputs.value()).toEqual([]);
    });

    it('should not deselect a disabled cell', () => {
      const {gridSelection, cells} = createGridSelection({
        cells: gridA,
        multi: signal(true),
        value: signal(['(0,0)']),
        activeCoords: signal({row: 0, col: 0}),
      });
      cells[0][0].disabled.set(true);
      gridSelection.deselect();
      expect(gridSelection.inputs.value()).toEqual(['(0,0)']);
    });

    it('should correctly deselect cells that span multiple rows', () => {
      const {gridSelection} = createGridSelection({
        cells: gridB,
        activeCoords: signal({row: 1, col: 2}),
        value: signal(['(0,2)']),
      });
      gridSelection.deselect();
      expect(gridSelection.inputs.value()).toEqual([]);
    });

    it('should correctly deselect cells that span multiple columns', () => {
      const {gridSelection} = createGridSelection({
        cells: gridC,
        activeCoords: signal({row: 0, col: 1}),
        value: signal(['(0,0)']),
      });
      gridSelection.deselect();
      expect(gridSelection.inputs.value()).toEqual([]);
    });

    it('should correctly deselect cells that span multiple rows and columns', () => {
      const {gridSelection} = createGridSelection({
        cells: gridD,
        activeCoords: signal({row: 2, col: 2}),
        value: signal(['(1,1)']),
      });
      gridSelection.deselect();
      expect(gridSelection.inputs.value()).toEqual([]);
    });
  });

  describe('toggle()', () => {
    it('should select a non-selected cell', () => {
      const {gridSelection} = createGridSelection({
        cells: gridA,
        activeCoords: signal({row: 0, col: 0}),
        value: signal([]),
      });
      gridSelection.toggle();
      expect(gridSelection.inputs.value()).toEqual(['(0,0)']);
    });

    it('should deselect a selected cell', () => {
      const {gridSelection} = createGridSelection({
        cells: gridA,
        activeCoords: signal({row: 0, col: 0}),
        value: signal(['(0,0)']),
      });
      gridSelection.toggle();
      expect(gridSelection.inputs.value()).toEqual([]);
    });

    it('should toggle one cell when multiple are selected', () => {
      const {gridFocus, gridSelection} = createGridSelection({
        cells: gridA,
        activeCoords: signal({row: 0, col: 0}),
        value: signal(['(0,0)', '(1,1)']),
      });
      gridSelection.toggle();
      expect(gridSelection.inputs.value()).toEqual(['(1,1)']);
      gridFocus.focusCoordinates({row: 0, col: 0});
      gridSelection.toggle();
      expect(gridSelection.inputs.value()).toEqual(['(1,1)', '(0,0)']);
    });

    it('should not toggle a disabled cell', () => {
      const {gridSelection, cells} = createGridSelection({
        cells: gridA,
        multi: signal(true),
        activeCoords: signal({row: 0, col: 0}),
        value: signal([]),
      });
      cells[0][0].disabled.set(true);
      gridSelection.toggle();
      expect(gridSelection.inputs.value()).toEqual([]);
    });

    it('should correctly toggle cells that span multiple rows', () => {
      const {gridSelection} = createGridSelection({
        cells: gridB,
        activeCoords: signal({row: 1, col: 2}),
      });
      gridSelection.toggle();
      expect(gridSelection.inputs.value()).toEqual(['(0,2)']);
      gridSelection.toggle();
      expect(gridSelection.inputs.value()).toEqual([]);
    });

    it('should correctly toggle cells that span multiple columns', () => {
      const {gridSelection} = createGridSelection({
        cells: gridC,
        activeCoords: signal({row: 0, col: 1}),
      });
      gridSelection.toggle();
      expect(gridSelection.inputs.value()).toEqual(['(0,0)']);
      gridSelection.toggle();
      expect(gridSelection.inputs.value()).toEqual([]);
    });

    it('should correctly toggle cells that span multiple rows and columns', () => {
      const {gridSelection} = createGridSelection({
        cells: gridD,
        activeCoords: signal({row: 2, col: 2}),
      });
      gridSelection.toggle();
      expect(gridSelection.inputs.value()).toEqual(['(1,1)']);
      gridSelection.toggle();
      expect(gridSelection.inputs.value()).toEqual([]);
    });
  });

  describe('selectOne()', () => {
    it('should select a cell', () => {
      const {gridSelection} = createGridSelection({
        cells: gridA,
        activeCoords: signal({row: 0, col: 0}),
      });
      gridSelection.selectOne();
      expect(gridSelection.inputs.value()).toEqual(['(0,0)']);
    });

    it('should leave only a single selected cell', () => {
      const {gridSelection, gridFocus} = createGridSelection({
        cells: gridA,
        value: signal(['(0,0)', '(1,1)', '(2,2)']),
        activeCoords: signal({row: 0, col: 1}),
      });
      gridSelection.selectOne();
      expect(gridSelection.inputs.value()).toEqual(['(0,1)']);
      gridFocus.focusCoordinates({row: 0, col: 0});
      gridSelection.selectOne();
      expect(gridSelection.inputs.value()).toEqual(['(0,0)']);
    });

    it('should do nothing if a cell is already selected', () => {
      const {gridSelection} = createGridSelection({
        cells: gridA,
        value: signal(['(0,0)']),
        activeCoords: signal({row: 0, col: 0}),
      });
      gridSelection.selectOne();
      expect(gridSelection.inputs.value()).toEqual(['(0,0)']);
    });

    it('should not select a disabled cell', () => {
      const {gridSelection, cells} = createGridSelection({
        cells: gridA,
        multi: signal(true),
        activeCoords: signal({row: 0, col: 0}),
      });
      cells[0][0].disabled.set(true);
      gridSelection.selectOne();
      expect(gridSelection.inputs.value()).toEqual([]);
    });

    it('should correctly select cells that span multiple rows', () => {
      const {gridSelection} = createGridSelection({
        cells: gridB,
        activeCoords: signal({row: 1, col: 2}),
      });
      gridSelection.selectOne();
      expect(gridSelection.inputs.value()).toEqual(['(0,2)']);
    });

    it('should correctly select cells that span multiple columns', () => {
      const {gridSelection} = createGridSelection({
        cells: gridC,
        activeCoords: signal({row: 0, col: 1}),
      });
      gridSelection.selectOne();
      expect(gridSelection.inputs.value()).toEqual(['(0,0)']);
    });

    it('should correctly select cells that span multiple rows and columns', () => {
      const {gridSelection} = createGridSelection({
        cells: gridD,
        activeCoords: signal({row: 2, col: 2}),
      });
      gridSelection.selectOne();
      expect(gridSelection.inputs.value()).toEqual(['(1,1)']);
    });
  });

  describe('toggleOne()', () => {
    it('should select an unselected cell', () => {
      const {gridSelection} = createGridSelection({
        cells: gridA,
        activeCoords: signal({row: 0, col: 0}),
        value: signal([]),
      });
      gridSelection.toggleOne();
      expect(gridSelection.inputs.value()).toEqual(['(0,0)']);
    });

    it('should select an unselected cell and deselect other selected cells', () => {
      const {gridSelection} = createGridSelection({
        cells: gridA,
        activeCoords: signal({row: 0, col: 0}),
        value: signal(['(1,1)', '(2,2)']),
      });
      gridSelection.toggleOne();
      expect(gridSelection.inputs.value()).toEqual(['(0,0)']);
    });

    it('should deselect a selected cell', () => {
      const {gridSelection} = createGridSelection({
        cells: gridA,
        activeCoords: signal({row: 0, col: 0}),
        value: signal(['(0,0)']),
      });
      gridSelection.toggleOne();
      expect(gridSelection.inputs.value()).toEqual([]);
    });

    it('should not deselect disabled options when selecting an option', () => {
      const {gridSelection, cells} = createGridSelection({
        cells: gridA,
        activeCoords: signal({row: 0, col: 0}),
        value: signal(['(1,1)']),
      });
      cells[1][1].disabled.set(true);
      gridSelection.toggleOne();
      expect(gridSelection.inputs.value()).toEqual(['(1,1)', '(0,0)']);
    });

    it('should correctly toggle cells that span multiple rows', () => {
      const {gridSelection} = createGridSelection({
        cells: gridB,
        activeCoords: signal({row: 1, col: 2}),
        value: signal([]),
      });
      gridSelection.toggleOne();
      expect(gridSelection.inputs.value()).toEqual(['(0,2)']);
      gridSelection.toggleOne();
      expect(gridSelection.inputs.value()).toEqual([]);
    });

    it('should correctly toggle cells that span multiple columns', () => {
      const {gridSelection} = createGridSelection({
        cells: gridC,
        activeCoords: signal({row: 0, col: 1}),
      });
      gridSelection.toggleOne();
      expect(gridSelection.inputs.value()).toEqual(['(0,0)']);
      gridSelection.toggleOne();
      expect(gridSelection.inputs.value()).toEqual([]);
    });

    it('should correctly toggle cells that span multiple rows and columns', () => {
      const {gridSelection} = createGridSelection({
        cells: gridD,
        activeCoords: signal({row: 2, col: 2}),
      });
      gridSelection.toggleOne();
      expect(gridSelection.inputs.value()).toEqual(['(1,1)']);
      gridSelection.toggleOne();
      expect(gridSelection.inputs.value()).toEqual([]);
    });
  });

  describe('selectAll()', () => {
    it('should select all cells if multi is true', () => {
      const {gridSelection} = createGridSelection({cells: gridA});
      const allValues = [
        '(0,0)',
        '(0,1)',
        '(0,2)',
        '(1,0)',
        '(1,1)',
        '(1,2)',
        '(2,0)',
        '(2,1)',
        '(2,2)',
      ];
      gridSelection.selectAll();
      expect(gridSelection.inputs.value()).toEqual(allValues);
    });

    it('should do nothing if all cells are already selected', () => {
      const {gridSelection} = createGridSelection({cells: gridA});
      const allValues = [
        '(0,0)',
        '(0,1)',
        '(0,2)',
        '(1,0)',
        '(1,1)',
        '(1,2)',
        '(2,0)',
        '(2,1)',
        '(2,2)',
      ];
      gridSelection.inputs.value.set([...allValues]);
      gridSelection.selectAll();
      expect(gridSelection.inputs.value()).toEqual(allValues);
    });

    it('should select all remaining cells if some are already selected', () => {
      const {gridSelection} = createGridSelection({
        cells: gridA,
        value: signal(['(0,0)']),
      });
      const allValues = [
        '(0,0)',
        '(0,1)',
        '(0,2)',
        '(1,0)',
        '(1,1)',
        '(1,2)',
        '(2,0)',
        '(2,1)',
        '(2,2)',
      ];
      gridSelection.selectAll();
      expect(gridSelection.inputs.value()).toEqual(allValues);
    });

    it('should not select disabled cells', () => {
      const {gridSelection, cells} = createGridSelection({cells: gridA});
      cells[0][1].disabled.set(true);
      const allValues = ['(0,0)', '(0,2)', '(1,0)', '(1,1)', '(1,2)', '(2,0)', '(2,1)', '(2,2)'];
      gridSelection.selectAll();
      expect(gridSelection.inputs.value()).toEqual(allValues);
      expect(allValues).not.toContain('(0,1)');
    });

    it('should correctly select all cells in a grid with rowspan', () => {
      const {gridSelection} = createGridSelection({cells: gridB});
      const allValues = [
        '(0,0)',
        '(0,1)',
        '(0,2)',
        '(1,0)',
        '(1,1)',
        '(2,0)',
        '(2,2)',
        '(3,1)',
        '(3,2)',
      ];
      gridSelection.selectAll();
      expect(gridSelection.inputs.value()).toEqual(allValues);
    });

    it('should correctly select all cells in a grid with colspan', () => {
      const {gridSelection} = createGridSelection({cells: gridC});
      const allValues = [
        '(0,0)',
        '(0,2)',
        '(0,3)',
        '(1,0)',
        '(1,1)',
        '(1,3)',
        '(2,0)',
        '(2,1)',
        '(2,2)',
      ];
      gridSelection.selectAll();
      expect(gridSelection.inputs.value()).toEqual(allValues);
    });

    it('should correctly select all cells in a grid with rowspan and colspan', () => {
      const {gridSelection} = createGridSelection({cells: gridD});
      const allValues = [
        '(0,0)',
        '(0,1)',
        '(0,3)',
        '(1,1)',
        '(1,3)',
        '(2,0)',
        '(3,0)',
        '(3,1)',
        '(3,2)',
      ];
      gridSelection.selectAll();
      expect(gridSelection.inputs.value()).toEqual(allValues);
    });
  });

  describe('deselectAll()', () => {
    it('should deselect all selected cells', () => {
      const {gridSelection} = createGridSelection({
        cells: gridA,
        value: signal(['(0,0)', '(1,1)', '(2,2)']),
      });
      gridSelection.deselectAll();
      expect(gridSelection.inputs.value()).toEqual([]);
    });

    it('should do nothing if no cells are selected', () => {
      const {gridSelection} = createGridSelection({cells: gridA, value: signal([])});
      gridSelection.deselectAll();
      expect(gridSelection.inputs.value()).toEqual([]);
    });

    it('should not deselect cells that are selected if they are disabled', () => {
      const {gridSelection, cells} = createGridSelection({
        cells: gridA,
        value: signal(['(0,0)', '(0,1)']),
      });
      cells[0][0].disabled.set(true);
      gridSelection.deselectAll();
      expect(gridSelection.inputs.value()).toEqual(['(0,0)']);
    });

    it('should deselect values that are not in the grid', () => {
      const {gridSelection} = createGridSelection({
        cells: gridA,
        value: signal(['(4,4)', '(5,5)']),
      });
      gridSelection.deselectAll();
      expect(gridSelection.inputs.value()).toEqual([]);
    });
  });

  describe('toggleAll()', () => {
    it('should select all cells if none are selected (multi=true)', () => {
      const {gridSelection} = createGridSelection({cells: gridA, multi: signal(true)});
      const allValues = [
        '(0,0)',
        '(0,1)',
        '(0,2)',
        '(1,0)',
        '(1,1)',
        '(1,2)',
        '(2,0)',
        '(2,1)',
        '(2,2)',
      ];
      gridSelection.toggleAll();
      expect(gridSelection.inputs.value()).toEqual(allValues);
    });

    it('should deselect all cells if all are selected (multi=true)', () => {
      const {gridSelection} = createGridSelection({cells: gridA, multi: signal(true)});
      const allValues = [
        '(0,0)',
        '(0,1)',
        '(0,2)',
        '(1,0)',
        '(1,1)',
        '(1,2)',
        '(2,0)',
        '(2,1)',
        '(2,2)',
      ];
      gridSelection.inputs.value.set([...allValues]);
      gridSelection.toggleAll();
      expect(gridSelection.inputs.value()).toEqual([]);
    });

    it('should select all cells if some (but not all) are selected (multi=true)', () => {
      const {gridSelection} = createGridSelection({
        cells: gridA,
        multi: signal(true),
        value: signal(['(0,0)']),
      });
      const allValues = [
        '(0,0)',
        '(0,1)',
        '(0,2)',
        '(1,0)',
        '(1,1)',
        '(1,2)',
        '(2,0)',
        '(2,1)',
        '(2,2)',
      ];
      gridSelection.toggleAll();
      expect(gridSelection.inputs.value()).toEqual(allValues);
    });

    it('should respect skipDisabled when selecting all (multi=true)', () => {
      const {gridSelection, cells} = createGridSelection({
        cells: gridA,
        multi: signal(true),
        skipDisabled: signal(true),
      });
      cells[0][1].disabled.set(true);
      const allValues = ['(0,0)', '(0,2)', '(1,0)', '(1,1)', '(1,2)', '(2,0)', '(2,1)', '(2,2)'];
      gridSelection.toggleAll();
      expect(gridSelection.inputs.value()).toEqual(allValues);
      expect(allValues).not.toContain('(0,1)');
    });

    it('should correctly toggle all cells in a grid with rowspan', () => {
      const {gridSelection} = createGridSelection({cells: gridB, multi: signal(true)});
      const allValues = [
        '(0,0)',
        '(0,1)',
        '(0,2)',
        '(1,0)',
        '(1,1)',
        '(2,0)',
        '(2,2)',
        '(3,1)',
        '(3,2)',
      ];
      gridSelection.toggleAll();
      expect(gridSelection.inputs.value()).toEqual(allValues);
      gridSelection.toggleAll();
      expect(gridSelection.inputs.value()).toEqual([]);
    });

    it('should correctly toggle all cells in a grid with colspan', () => {
      const {gridSelection} = createGridSelection({cells: gridC, multi: signal(true)});
      const allValues = [
        '(0,0)',
        '(0,2)',
        '(0,3)',
        '(1,0)',
        '(1,1)',
        '(1,3)',
        '(2,0)',
        '(2,1)',
        '(2,2)',
      ];
      gridSelection.toggleAll();
      expect(gridSelection.inputs.value()).toEqual(allValues);
      gridSelection.toggleAll();
      expect(gridSelection.inputs.value()).toEqual([]);
    });

    it('should correctly toggle all cells in a grid with rowspan and colspan', () => {
      const {gridSelection} = createGridSelection({cells: gridD, multi: signal(true)});
      const allValues = [
        '(0,0)',
        '(0,1)',
        '(0,3)',
        '(1,1)',
        '(1,3)',
        '(2,0)',
        '(3,0)',
        '(3,1)',
        '(3,2)',
      ];
      gridSelection.toggleAll();
      expect(gridSelection.inputs.value()).toEqual(allValues);
      gridSelection.toggleAll();
      expect(gridSelection.inputs.value()).toEqual([]);
    });
  });
});
