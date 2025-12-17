/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {signal, SignalLike, WritableSignalLike} from '../signal-like/signal-like';
import {GridData} from './grid-data';
import {createGridA, createGridB, createGridD, TestBaseGridCell} from './grid-data.spec';
import {GridFocus, GridFocusInputs} from './grid-focus';
import {GridSelection, GridSelectionInputs} from './grid-selection';

export interface TestGridSelectionCell extends TestBaseGridCell {
  element: WritableSignalLike<HTMLElement>;
  disabled: WritableSignalLike<boolean>;
  selected: WritableSignalLike<boolean>;
  selectable: WritableSignalLike<boolean>;
}

function createTestCell(): Omit<TestGridSelectionCell, keyof TestBaseGridCell> {
  return {
    element: signal(document.createElement('div')),
    disabled: signal(false),
    selected: signal(false),
    selectable: signal(true),
  };
}

function createTestGrid(createGridFn: () => TestBaseGridCell[][]): TestGridSelectionCell[][] {
  return createGridFn().map(row =>
    row.map(cell => {
      return {...createTestCell(), ...cell};
    }),
  );
}

function setupGridSelection(
  cells: SignalLike<TestGridSelectionCell[][]>,
  inputs: Partial<GridSelectionInputs & GridFocusInputs> = {},
): {
  gridSelection: GridSelection<TestGridSelectionCell>;
  gridFocus: GridFocus<TestGridSelectionCell>;
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

  const gridSelection = new GridSelection({
    grid: gridData,
    gridFocus: gridFocus,
    ...gridFocusInputs,
    ...inputs,
  });

  return {gridSelection, gridFocus};
}

describe('GridSelection', () => {
  describe('select', () => {
    it('should select a single cell', () => {
      const cells = createTestGrid(createGridA);
      const {gridSelection} = setupGridSelection(signal(cells));

      gridSelection.select({row: 1, col: 1});

      expect(cells[1][1].selected()).toBe(true);
    });

    it('should select a range of cells', () => {
      const cells = createTestGrid(createGridD);
      const {gridSelection} = setupGridSelection(signal(cells));

      gridSelection.select({row: 0, col: 0}, {row: 1, col: 1});

      expect(cells[0][0].selected()).toBe(true); // Spans {0,0}, {1,0}
      expect(cells[0][1].selected()).toBe(true); // Spans {0,1}, {0,2}
      expect(cells[1][0].selected()).toBe(true); // Spans {1,1}, {1,2}, {2,1}, {2,2}
    });

    it('should not select disabled or unselectable cells', () => {
      const cells = createTestGrid(createGridA);
      const {gridSelection} = setupGridSelection(signal(cells));

      cells[0][1].disabled.set(true);
      cells[1][0].selectable.set(false);

      gridSelection.select({row: 0, col: 0}, {row: 1, col: 1});

      expect(cells[0][0].selected()).toBe(true);
      expect(cells[0][1].selected()).toBe(false);
      expect(cells[1][0].selected()).toBe(false);
      expect(cells[1][1].selected()).toBe(true);
    });
  });

  describe('deselect', () => {
    it('should deselect a single cell', () => {
      const cells = createTestGrid(createGridA);
      const {gridSelection} = setupGridSelection(signal(cells));
      cells[1][1].selected.set(true);

      gridSelection.deselect({row: 1, col: 1});

      expect(cells[1][1].selected()).toBe(false);
    });

    it('should deselect a range of cells', () => {
      const cells = createTestGrid(createGridD);
      const {gridSelection} = setupGridSelection(signal(cells));
      cells[0][0].selected.set(true);
      cells[0][1].selected.set(true);
      cells[1][0].selected.set(true);

      gridSelection.deselect({row: 0, col: 0}, {row: 1, col: 1});

      expect(cells[0][0].selected()).toBe(false);
      expect(cells[0][1].selected()).toBe(false);
      expect(cells[1][0].selected()).toBe(false);
    });
  });

  describe('toggle', () => {
    it('should toggle the selection of a single cell', () => {
      const cells = createTestGrid(createGridA);
      const {gridSelection} = setupGridSelection(signal(cells));

      gridSelection.toggle({row: 1, col: 1});
      expect(cells[1][1].selected()).toBe(true);

      gridSelection.toggle({row: 1, col: 1});
      expect(cells[1][1].selected()).toBe(false);
    });

    it('should toggle a range of cells', () => {
      const cells = createTestGrid(createGridA);
      const {gridSelection} = setupGridSelection(signal(cells));
      cells[0][0].selected.set(true);
      cells[1][1].selected.set(true);

      gridSelection.toggle({row: 0, col: 0}, {row: 0, col: 1});

      expect(cells[0][0].selected()).toBe(false);
      expect(cells[0][1].selected()).toBe(true);
      expect(cells[1][1].selected()).toBe(true); // Unchanged
    });
  });

  describe('selectAll', () => {
    it('should select all selectable and enabled cells', () => {
      const cells = createTestGrid(createGridB);
      const {gridSelection} = setupGridSelection(signal(cells));

      cells[0][1].disabled.set(true);
      cells[1][1].selectable.set(false);

      gridSelection.selectAll();

      const flatCells = cells.flat();
      expect(flatCells.filter(c => c.selected()).length).toBe(flatCells.length - 2);
      expect(cells[0][1].selected()).toBe(false);
      expect(cells[1][1].selected()).toBe(false);
    });
  });

  describe('deselectAll', () => {
    it('should deselect all cells', () => {
      const cells = createTestGrid(createGridA);
      const {gridSelection} = setupGridSelection(signal(cells));

      // Select some cells
      cells[0][0].selected.set(true);
      cells[1][1].selected.set(true);
      cells[2][2].selected.set(true);

      gridSelection.deselectAll();

      const flatCells = cells.flat();
      expect(flatCells.every(c => !c.selected())).toBe(true);
    });
  });

  describe('_validCells', () => {
    it('should yield all selectable and enabled cells in a range', () => {
      const cells = createTestGrid(createGridD);
      const {gridSelection} = setupGridSelection(signal(cells));

      cells[0][1].disabled.set(true); // cell-0-1
      cells[1][0].selectable.set(false); // cell-1-1

      const validCells = Array.from(gridSelection._validCells({row: 0, col: 0}, {row: 3, col: 3}));

      const validCellIds = validCells.map(c => c.id());
      const allCellIds = cells.flat().map(c => c.id());

      expect(validCellIds).not.toContain('cell-0-1');
      expect(validCellIds).not.toContain('cell-1-1');
      expect(validCellIds.length).toBe(allCellIds.length - 2);
    });
  });

  describe('undo', () => {
    it('should undo a select operation', () => {
      const cells = createTestGrid(createGridA);
      const {gridSelection} = setupGridSelection(signal(cells));

      gridSelection.select({row: 1, col: 1});
      expect(cells[1][1].selected()).toBe(true);

      gridSelection.undo();
      expect(cells[1][1].selected()).toBe(false);
    });

    it('should undo a deselect operation', () => {
      const cells = createTestGrid(createGridA);
      const {gridSelection} = setupGridSelection(signal(cells));
      cells[1][1].selected.set(true);

      gridSelection.deselect({row: 1, col: 1});
      expect(cells[1][1].selected()).toBe(false);

      gridSelection.undo();
      expect(cells[1][1].selected()).toBe(true);
    });

    it('should undo a toggle operation', () => {
      const cells = createTestGrid(createGridA);
      const {gridSelection} = setupGridSelection(signal(cells));
      cells[0][0].selected.set(true);

      gridSelection.toggle({row: 0, col: 0}, {row: 0, col: 1});
      expect(cells[0][0].selected()).toBe(false);
      expect(cells[0][1].selected()).toBe(true);

      gridSelection.undo();
      expect(cells[0][0].selected()).toBe(true);
      expect(cells[0][1].selected()).toBe(false);
    });

    it('should undo a selectAll operation', () => {
      const cells = createTestGrid(createGridA);
      const {gridSelection} = setupGridSelection(signal(cells));

      gridSelection.selectAll();
      expect(cells.flat().every(c => c.selected())).toBe(true);

      gridSelection.undo();
      expect(cells.flat().every(c => !c.selected())).toBe(true);
    });

    it('should undo a deselectAll operation', () => {
      const cells = createTestGrid(createGridA);
      const {gridSelection} = setupGridSelection(signal(cells));
      cells.flat().forEach(c => c.selected.set(true));

      gridSelection.deselectAll();
      expect(cells.flat().every(c => !c.selected())).toBe(true);

      gridSelection.undo();
      expect(cells.flat().every(c => c.selected())).toBe(true);
    });

    it('should do nothing if there is nothing to undo', () => {
      const cells = createTestGrid(createGridA);
      const {gridSelection} = setupGridSelection(signal(cells));
      cells[1][1].selected.set(true);

      gridSelection.undo();
      expect(cells[1][1].selected()).toBe(true);
    });

    it('should only undo the last operation', () => {
      const cells = createTestGrid(createGridA);
      const {gridSelection} = setupGridSelection(signal(cells));

      gridSelection.select({row: 0, col: 0});
      gridSelection.select({row: 1, col: 1});
      expect(cells[1][1].selected()).toBe(true);

      gridSelection.undo();
      expect(cells[0][0].selected()).toBe(true);
      expect(cells[1][1].selected()).toBe(false);
    });

    it('should do nothing after undoing once', () => {
      const cells = createTestGrid(createGridA);
      const {gridSelection} = setupGridSelection(signal(cells));
      gridSelection.select({row: 1, col: 1});
      gridSelection.undo();
      gridSelection.undo();
      expect(cells[1][1].selected()).toBe(false);
    });
  });
});
