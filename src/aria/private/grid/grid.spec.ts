/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {SignalLike, WritableSignalLike, signal} from '../behaviors/signal-like/signal-like';
import {GridCellPattern, GridCellInputs} from './cell';
import {GridPattern, GridInputs} from './grid';
import {GridRowPattern, GridRowInputs} from './row';
import {GridCellWidgetInputs, GridCellWidgetPattern} from './widget';
import {createKeyboardEvent} from '@angular/cdk/testing/private';
import {ModifierKeys} from '@angular/cdk/testing';

// Converts the SignalLike type to WritableSignal type for controlling test inputs.
type WritableSignalOverrides<O> = {
  [K in keyof O as O[K] extends SignalLike<any> ? K : never]: O[K] extends SignalLike<infer T>
    ? WritableSignalLike<T>
    : never;
};

type TestGridInputs = Omit<GridInputs & WritableSignalOverrides<GridInputs>, 'rows'>;
type TestGridRowInputs = GridRowInputs & WritableSignalOverrides<GridRowInputs>;
type TestGridCellInputs = GridCellInputs & WritableSignalOverrides<GridCellInputs>;
type TestGridCellWidgetInputs = GridCellWidgetInputs &
  WritableSignalOverrides<GridCellWidgetInputs>;

const a = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 65, 'A', mods);
const up = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 38, 'ArrowUp', mods);
const down = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 40, 'ArrowDown', mods);
const left = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 37, 'ArrowLeft', mods);
const right = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 39, 'ArrowRight', mods);
const home = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 36, 'Home', mods);
const end = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 35, 'End', mods);
const space = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 32, ' ', mods);
const enter = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 13, 'Enter', mods);
const escape = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 27, 'Escape', mods);

function createClickEvent(element: HTMLElement, mods?: ModifierKeys): PointerEvent {
  return {
    target: element,
    shiftKey: mods?.shift,
    ctrlKey: mods?.control,
    metaKey: mods?.meta,
    button: 0,
    preventDefault: () => {},
    stopPropagation: () => {},
  } as unknown as PointerEvent;
}

interface TestWidgetData {
  widgetType?: 'simple' | 'complex' | 'editable';
  disabled?: boolean;
}

interface TestCellData {
  id?: string;
  widget?: TestWidgetData;
  selectable?: boolean;
  disabled?: boolean;
  rowSpan?: number;
  colSpan?: number;
  selected?: boolean;
  rowIndex?: number;
  colIndex?: number;
}

interface TestRowData {
  cells: TestCellData[];
  rowIndex?: number;
}

function createGridRows(grid: GridPattern, data: TestRowData[]) {
  const builtWidgets: GridCellWidgetPattern[] = [];
  const gridRows = data.map((rowData, rowIndex) => {
    const rowInputs: TestGridRowInputs = {
      grid: signal(grid),
      cells: signal([]),
      rowIndex: signal(rowData.rowIndex),
    };
    const row = new GridRowPattern(rowInputs);

    const rowCells = rowData.cells.map((cellData, colIndex) => {
      const cellInputs: TestGridCellInputs = {
        id: signal(cellData.id ?? `cell-${rowIndex}-${colIndex}`),
        element: signal(document.createElement('div')),
        grid: signal(grid),
        row: signal(row),
        widget: signal<GridCellWidgetPattern | undefined>(undefined),
        rowIndex: signal(cellData.rowIndex),
        colIndex: signal(cellData.colIndex),
        selectable: signal(cellData.selectable ?? true),
        disabled: signal(cellData.disabled ?? false),
        rowSpan: signal(cellData.rowSpan ?? 1),
        colSpan: signal(cellData.colSpan ?? 1),
        selected: signal(cellData.selected ?? false),
        getWidget: (el: Element | null) => builtWidgets.find(w => w.element() === el),
      };
      const cell = new GridCellPattern(cellInputs);

      if (cellData.widget) {
        const widgetInputs: TestGridCellWidgetInputs = {
          cell: signal(cell),
          element: signal(document.createElement('div')),
          widgetType: signal(cellData.widget.widgetType ?? 'simple'),
          focusTarget: signal(undefined),
          disabled: signal(cellData.widget.disabled ?? false),
        };
        const widget = new GridCellWidgetPattern(widgetInputs);
        builtWidgets.push(widget);
        cellInputs.widget.set(widget);
      }

      return cell;
    });

    rowInputs.cells.set(rowCells);
    return row;
  });
  return {gridRows};
}

function getDefaultGridInputs(): TestGridInputs {
  return {
    element: signal(document.createElement('div')),
    textDirection: signal('ltr'),
    enableSelection: signal(false),
    multi: signal(false),
    selectionMode: signal('follow'),
    getCell: () => undefined,
    focusMode: signal('roving'),
    disabled: signal(false),
    softDisabled: signal(false),
    rowWrap: signal('nowrap'),
    colWrap: signal('nowrap'),
  };
}

function createGrid(gridData: TestRowData[], gridInputs: TestGridInputs) {
  const rows = signal<GridRowPattern[]>([]);

  gridInputs.getCell = (el: Element | null) => {
    for (const row of rows()) {
      for (const cell of row.inputs.cells()) {
        if (cell.element() === el) return cell;
      }
    }
    return undefined;
  };

  const grid = new GridPattern({
    ...gridInputs,
    rows,
  });

  const {gridRows} = createGridRows(grid, gridData);
  rows.set(gridRows);

  return {grid, rows};
}

describe('Grid', () => {
  describe('GridCellWidgetPattern', () => {
    let gridInputs: TestGridInputs;

    beforeEach(() => {
      gridInputs = getDefaultGridInputs();
    });

    it('should have correct initial properties for a widget pattern', () => {
      const {grid} = createGrid([{cells: [{widget: {}}]}], gridInputs);
      const widget = grid.cells()[0][0].inputs.widget()!;
      expect(widget.isActivated()).toBe(false);
      expect(widget.disabled()).toBe(false);
    });

    it('should compute element and widgetHost correctly', () => {
      const element = document.createElement('div');
      const focusTarget = document.createElement('button');
      const {grid} = createGrid([{cells: [{widget: {widgetType: 'simple'}}]}], gridInputs);
      const widget = grid.cells()[0][0].inputs.widget()!;
      const widgetInputs = widget.inputs as TestGridCellWidgetInputs;
      widgetInputs.element.set(element);
      widgetInputs.focusTarget.set(focusTarget);

      expect(widget.element()).toBe(element);
      expect(widget.widgetHost()).toBe(focusTarget);

      widgetInputs.focusTarget.set(undefined);
      expect(widget.widgetHost()).toBe(element);
    });

    it('should be disabled if cell is disabled', () => {
      const {grid} = createGrid([{cells: [{widget: {disabled: false}}]}], gridInputs);
      const cell = grid.cells()[0][0];
      const widget = cell.inputs.widget()!;
      const cellInputs = cell.inputs as TestGridCellInputs;

      cellInputs.disabled.set(true);
      expect(widget.disabled()).toBe(true);
    });

    describe('Activation', () => {
      it('should activate and deactivate manually', () => {
        const {grid} = createGrid([{cells: [{widget: {widgetType: 'complex'}}]}], gridInputs);
        const widget = grid.cells()[0][0].inputs.widget()!;
        widget.activate();
        expect(widget.isActivated()).toBe(true);
        widget.deactivate();
        expect(widget.isActivated()).toBe(false);
      });

      it('should not activate if widgetType is simple', () => {
        const {grid} = createGrid([{cells: [{widget: {widgetType: 'simple'}}]}], gridInputs);
        const widget = grid.cells()[0][0].inputs.widget()!;
        widget.activate();
        expect(widget.isActivated()).toBe(false);
      });

      it('should activate on focusin if focus is inside widgetHost', () => {
        const host = document.createElement('div');
        const inner = document.createElement('button');
        host.appendChild(inner);
        const {grid} = createGrid([{cells: [{widget: {widgetType: 'complex'}}]}], gridInputs);
        const widget = grid.cells()[0][0].inputs.widget()!;
        (widget.inputs as TestGridCellWidgetInputs).focusTarget.set(host);

        widget.onFocusIn({target: inner} as unknown as FocusEvent);
        expect(widget.isActivated()).toBe(true);
      });

      it('should deactivate on focusout if focus leaves widgetHost', () => {
        const host = document.createElement('div');
        const {grid} = createGrid([{cells: [{widget: {widgetType: 'complex'}}]}], gridInputs);
        const widget = grid.cells()[0][0].inputs.widget()!;
        (widget.inputs as TestGridCellWidgetInputs).focusTarget.set(host);

        widget.activate();
        widget.onFocusOut({relatedTarget: document.createElement('div')} as unknown as FocusEvent);
        expect(widget.isActivated()).toBe(false);
      });
    });

    describe('Keyboard Events', () => {
      it('should activate on Enter for complex widget', () => {
        const {grid} = createGrid([{cells: [{widget: {widgetType: 'complex'}}]}], gridInputs);
        const widget = grid.cells()[0][0].inputs.widget()!;
        widget.onKeydown(enter());
        expect(widget.isActivated()).toBe(true);
      });

      it('should deactivate on Escape when activated', () => {
        const {grid} = createGrid([{cells: [{widget: {widgetType: 'complex'}}]}], gridInputs);
        const widget = grid.cells()[0][0].inputs.widget()!;
        widget.activate();
        widget.onKeydown(escape());
        expect(widget.isActivated()).toBe(false);
      });

      it('should deactivate on Enter for editable widget when activated', () => {
        const {grid} = createGrid([{cells: [{widget: {widgetType: 'editable'}}]}], gridInputs);
        const widget = grid.cells()[0][0].inputs.widget()!;
        widget.activate();
        widget.onKeydown(enter());
        expect(widget.isActivated()).toBe(false);
      });

      it('should activate on character key for editable widget', () => {
        const {grid} = createGrid([{cells: [{widget: {widgetType: 'editable'}}]}], gridInputs);
        const widget = grid.cells()[0][0].inputs.widget()!;
        widget.onKeydown(a());
        expect(widget.isActivated()).toBe(true);
      });

      it('should trigger click on Enter for simple widget', () => {
        const {grid} = createGrid([{cells: [{widgets: [{widgetType: 'simple'}]}]}], gridInputs);
        const widget = grid.cells()[0][0].inputs.widgets()[0];
        const element = widget.element();
        spyOn(element, 'click');

        widget.onKeydown(enter());
        expect(element.click).toHaveBeenCalled();
      });

      it('should not activate if disabled', () => {
        const {grid} = createGrid(
          [{cells: [{widget: {widgetType: 'complex', disabled: true}}]}],
          gridInputs,
        );
        const widget = grid.cells()[0][0].inputs.widget()!;
        widget.onKeydown(enter());
        expect(widget.isActivated()).toBe(false);
      });
    });
  });

  describe('GridCellPattern', () => {
    let gridInputs: TestGridInputs;

    beforeEach(() => {
      gridInputs = getDefaultGridInputs();
    });

    it('should have correct initial properties for a cell pattern', () => {
      const {grid} = createGrid([{cells: [{id: 'test-cell'}]}], gridInputs);
      const cell = grid.cells()[0][0];
      expect(cell.id()).toBe('test-cell');
      expect(cell.selectable()).toBe(true);
      expect(cell.disabled()).toBe(false);
      expect(cell.rowSpan()).toBe(1);
      expect(cell.colSpan()).toBe(1);
    });

    describe('ARIA attributes', () => {
      it('should compute aria-selected correctly', () => {
        const {grid} = createGrid([{cells: [{selected: true}]}], gridInputs);
        const cell = grid.cells()[0][0];
        const gridInputsW = grid.inputs as unknown as TestGridInputs;
        gridInputsW.enableSelection.set(true);

        expect(cell.ariaSelected()).toBe(true);
        (cell.selected as WritableSignalLike<boolean>).set(false);
        expect(cell.ariaSelected()).toBe(false);

        gridInputsW.enableSelection.set(false);
        expect(cell.ariaSelected()).toBeUndefined();
      });

      it('should compute aria-rowindex correctly', () => {
        const {grid} = createGrid([{cells: [{}]}], gridInputs);
        const cell = grid.cells()[0][0];
        expect(cell.ariaRowIndex()).toBe(1);

        (cell.inputs as TestGridCellInputs).rowIndex.set(10);
        expect(cell.ariaRowIndex()).toBe(10);
      });

      it('should compute aria-colindex correctly', () => {
        const {grid} = createGrid([{cells: [{}]}], gridInputs);
        const cell = grid.cells()[0][0];
        expect(cell.ariaColIndex()).toBe(1);

        (cell.inputs as TestGridCellInputs).colIndex.set(5);
        expect(cell.ariaColIndex()).toBe(5);
      });
    });

    describe('Tab Index', () => {
      it('should follow grid behavior by default', () => {
        const {grid} = createGrid([{cells: [{}]}], gridInputs);
        const cell = grid.cells()[0][0];
        grid.setDefaultStateEffect();
        expect(grid.gridBehavior.cellTabIndex(cell)).toBe(0);
        expect(cell.tabIndex()).toBe(0);
      });

      it('should be -1 if cell contains a widget', () => {
        const {grid} = createGrid([{cells: [{widget: {}}]}], gridInputs);
        const cell = grid.cells()[0][0];
        grid.setDefaultStateEffect();
        expect(cell.tabIndex()).toBe(-1);
      });
    });

    describe('Keyboard Events', () => {
      it('should delegate to widget', () => {
        const {grid} = createGrid([{cells: [{widget: {}}]}], gridInputs);
        const cell = grid.cells()[0][0];
        const widget = cell.inputs.widget()!;
        spyOn(widget, 'onKeydown');

        const event = enter();
        cell.onKeydown(event);
        expect(widget.onKeydown).toHaveBeenCalledWith(event);
      });
    });
  });

  describe('GridPattern', () => {
    let gridInputs: TestGridInputs;

    beforeEach(() => {
      gridInputs = getDefaultGridInputs();
    });

    describe('Keyboard Events', () => {
      let grid: GridPattern;

      beforeEach(() => {
        const data = [{cells: [{}, {}, {}]}, {cells: [{}, {}, {}]}, {cells: [{}, {}, {}]}];
        const result = createGrid(data, gridInputs);
        grid = result.grid;
        grid.setDefaultStateEffect();
      });

      it('should navigate focus to the cell above on ArrowUp', () => {
        const cells = grid.cells();
        grid.gridBehavior.focusBehavior.focusCell(cells[1][1]); // Center cell
        grid.onKeydown(up());
        expect(grid.gridBehavior.focusBehavior.activeCell()).toBe(cells[0][1]);
      });

      it('should navigate focus to the cell below on ArrowDown', () => {
        const cells = grid.cells();
        grid.gridBehavior.focusBehavior.focusCell(cells[1][1]);
        grid.onKeydown(down());
        expect(grid.gridBehavior.focusBehavior.activeCell()).toBe(cells[2][1]);
      });

      it('should navigate focus to the cell to the left on ArrowLeft', () => {
        const cells = grid.cells();
        grid.gridBehavior.focusBehavior.focusCell(cells[1][1]);
        grid.onKeydown(left());
        expect(grid.gridBehavior.focusBehavior.activeCell()).toBe(cells[1][0]);
      });

      it('should navigate focus to the cell to the right on ArrowRight', () => {
        const cells = grid.cells();
        grid.gridBehavior.focusBehavior.focusCell(cells[1][1]);
        grid.onKeydown(right());
        expect(grid.gridBehavior.focusBehavior.activeCell()).toBe(cells[1][2]);
      });

      it('should navigate to start of row on Home', () => {
        const cells = grid.cells();
        grid.gridBehavior.focusBehavior.focusCell(cells[1][1]);
        grid.onKeydown(home());
        expect(grid.gridBehavior.focusBehavior.activeCell()).toBe(cells[1][0]);
      });

      it('should navigate to end of row on End', () => {
        const cells = grid.cells();
        grid.gridBehavior.focusBehavior.focusCell(cells[1][1]);
        grid.onKeydown(end());
        expect(grid.gridBehavior.focusBehavior.activeCell()).toBe(cells[1][2]);
      });

      it('should navigate to first cell on Ctrl+Home', () => {
        const cells = grid.cells();
        grid.gridBehavior.focusBehavior.focusCell(cells[1][1]);
        grid.onKeydown(home({control: true}));
        expect(grid.gridBehavior.focusBehavior.activeCell()).toBe(cells[0][0]);
      });

      it('should navigate to last cell on Ctrl+End', () => {
        const cells = grid.cells();
        grid.gridBehavior.focusBehavior.focusCell(cells[1][1]);
        grid.onKeydown(end({control: true}));
        expect(grid.gridBehavior.focusBehavior.activeCell()).toBe(cells[2][2]);
      });

      describe('Selection Logic', () => {
        let grid: GridPattern;

        beforeEach(() => {
          (gridInputs.enableSelection as WritableSignalLike<boolean>).set(true);
          const data = [{cells: [{}, {}]}, {cells: [{}, {}]}];
          const result = createGrid(data, gridInputs);
          grid = result.grid;
          grid.setDefaultStateEffect();
        });

        it('should update selection to follow focus in follow mode', () => {
          (gridInputs.selectionMode as WritableSignalLike<'follow' | 'explicit'>).set('follow');
          const cells = grid.cells();
          grid.gridBehavior.focusBehavior.focusCell(cells[0][0]);
          grid.onKeydown(down());
          expect(cells[1][0].selected()).toBe(true);
        });

        it('should not update selection to follow focus in explicit mode', () => {
          (gridInputs.selectionMode as WritableSignalLike<'follow' | 'explicit'>).set('explicit');
          const cells = grid.cells();
          grid.gridBehavior.focusBehavior.focusCell(cells[0][0]);
          grid.onKeydown(down());
          expect(cells[1][0].selected()).toBe(false);
        });

        it('should toggle selection on Space in explicit mode', () => {
          (gridInputs.selectionMode as WritableSignalLike<'follow' | 'explicit'>).set('explicit');
          const cells = grid.cells();
          grid.gridBehavior.focusBehavior.focusCell(cells[0][0]);
          grid.onKeydown(space());
          expect(cells[0][0].selected()).toBe(true);
          grid.onKeydown(space());
          expect(cells[0][0].selected()).toBe(false);
        });

        it('should select all on Ctrl+A', () => {
          (gridInputs.multi as WritableSignalLike<boolean>).set(true);
          grid.onKeydown(a({control: true}));
          expect(
            grid
              .cells()
              .flat()
              .every(c => c.selected()),
          ).toBe(true);
        });

        it('should select row on Shift+Space', () => {
          (gridInputs.multi as WritableSignalLike<boolean>).set(true);
          const gridCells = grid.cells();
          grid.gridBehavior.focusBehavior.focusCell(gridCells[0][0]);
          grid.onKeydown(space({shift: true}));

          expect(gridCells[0][0].selected()).toBe(true);
          expect(gridCells[0][1].selected()).toBe(true);
          expect(gridCells[1][0].selected()).toBe(false);
          expect(gridCells[1][1].selected()).toBe(false);
        });

        it('should select column on Ctrl+Space', () => {
          (gridInputs.multi as WritableSignalLike<boolean>).set(true);
          const gridCells = grid.cells();
          grid.gridBehavior.focusBehavior.focusCell(gridCells[0][0]);
          grid.onKeydown(space({control: true}));

          expect(gridCells[0][0].selected()).toBe(true);
          expect(gridCells[1][0].selected()).toBe(true);
          expect(gridCells[0][1].selected()).toBe(false);
          expect(gridCells[1][1].selected()).toBe(false);
        });
      });
    });

    describe('Pointer Events', () => {
      let grid: GridPattern;

      beforeEach(() => {
        (gridInputs.enableSelection as WritableSignalLike<boolean>).set(true);
        const data = [{cells: [{}, {}]}, {cells: [{}, {}]}];
        const result = createGrid(data, gridInputs);
        grid = result.grid;
        grid.setDefaultStateEffect();
      });

      describe('Basic Pointer Actions', () => {
        it('should move focus to the clicked cell on pointerdown', () => {
          const cells = grid.cells();
          grid.onPointerdown(createClickEvent(cells[0][1].element()));
          expect(grid.gridBehavior.focusBehavior.activeCell()).toBe(cells[0][1]);
        });
      });

      describe('Pointer Selection', () => {
        it('should follow focus in follow mode on pointerdown', () => {
          (gridInputs.selectionMode as WritableSignalLike<'follow' | 'explicit'>).set('follow');
          const cell = grid.cells()[0][1];
          grid.onPointerdown(createClickEvent(cell.element()));
          expect(cell.selected()).toBe(true);
        });

        it('should toggle selection in explicit mode on pointerdown', () => {
          (gridInputs.selectionMode as WritableSignalLike<'follow' | 'explicit'>).set('explicit');
          const cell = grid.cells()[0][1];
          grid.onPointerdown(createClickEvent(cell.element()));
          expect(cell.selected()).toBe(true);

          grid.onPointerdown(createClickEvent(cell.element()));
          expect(cell.selected()).toBe(false);
        });

        it('should support multi-selection with Ctrl+pointerdown', () => {
          (gridInputs.multi as WritableSignalLike<boolean>).set(true);
          const cells = grid.cells();
          grid.onPointerdown(createClickEvent(cells[0][0].element()));
          grid.onPointerdown(createClickEvent(cells[0][1].element(), {control: true}));
          expect(cells[0][0].selected()).toBe(true);
          expect(cells[0][1].selected()).toBe(true);
        });
      });
    });

    describe('Focus Management', () => {
      let grid: GridPattern;
      let rowsSignal: WritableSignalLike<GridRowPattern[]>;

      beforeEach(() => {
        const data = [{cells: [{}, {}]}, {cells: [{}, {}]}];
        const result = createGrid(data, gridInputs);
        grid = result.grid;
        rowsSignal = result.rows;
      });

      it('should set default state on first focus', () => {
        grid.setDefaultStateEffect();
        expect(grid.activeCell()).toBe(grid.cells()[0][0]);
      });

      it('should set default state to selected cell if available', () => {
        const cell = grid.cells()[1][0];
        cell.inputs.selected.set(true);
        grid.setDefaultStateEffect();
        expect(grid.activeCell()).toBe(cell);
      });

      it('should reset stale state', () => {
        grid.setDefaultStateEffect();
        expect(grid.activeCell()).toBe(grid.cells()[0][0]);

        // Replace rows with new instances using build helper
        const {gridRows: newRows} = createGridRows(grid, [{cells: [{}, {}]}]);
        rowsSignal.set(newRows);

        grid.resetStateEffect();
        // It should try to focus on cells with same coordinates or first available
        expect(grid.activeCell()).toBe(grid.cells()[0][0]);
      });

      it('should adjust focus when row is deleted while grid is focused', () => {
        grid.setDefaultStateEffect();
        grid.onFocusIn({target: grid.cells()[0][0].element()} as unknown as FocusEvent);
        expect(grid.isFocused()).toBe(true);

        // Delete the first row by updating the rows signal with build helper
        const {gridRows: newRows} = createGridRows(grid, [{cells: [{}, {}]}]);
        rowsSignal.set(newRows);

        grid.resetStateEffect();

        expect(grid.activeCell()).toBe(grid.cells()[0][0]);
      });

      describe('activedescendant Focus Mode', () => {
        let grid: GridPattern;

        beforeEach(() => {
          gridInputs = getDefaultGridInputs();
          (gridInputs.focusMode as WritableSignalLike<'roving' | 'activedescendant'>).set(
            'activedescendant',
          );
          const data = [{cells: [{}, {}]}, {cells: [{}, {}]}];
          const result = createGrid(data, gridInputs);
          grid = result.grid;
          grid.setDefaultStateEffect();
        });

        it('should set aria-activedescendant to the focused cell id on focus', () => {
          grid.onFocusIn({target: grid.inputs.element()} as unknown as FocusEvent);
          expect(grid.activeDescendant()).toBe(grid.cells()[0][0].id());
        });

        it('should update aria-activedescendant to the new cell id on navigation', () => {
          grid.onFocusIn({target: grid.inputs.element()} as unknown as FocusEvent);
          grid.onKeydown(down());
          expect(grid.activeDescendant()).toBe(grid.cells()[1][0].id());
        });
      });
    });
  });

  describe('#setDefaultStateEffect', () => {
    it('should set default state if not interacted', () => {
      const gridInputs = getDefaultGridInputs();
      const data = [{cells: [{}, {}]}, {cells: [{}, {}]}];
      const {grid} = createGrid(data, gridInputs);
      const cells = grid.cells();
      cells[0][1].inputs.selected.set(true); // default state will pick this since it's selected
      grid.setDefaultStateEffect();
      expect(grid.gridBehavior.focusBehavior.activeCell()).toBe(cells[0][1]); // Should set to selected cell
    });

    it('should NOT set default state if keyboard interacted', () => {
      const gridInputs = getDefaultGridInputs();
      const data = [{cells: [{}, {}]}, {cells: [{}, {}]}];
      const {grid} = createGrid(data, gridInputs);
      grid.onKeydown(down()); // Interaction

      const cells = grid.cells();
      cells[0][1].inputs.selected.set(true);
      grid.setDefaultStateEffect();
      expect(grid.gridBehavior.focusBehavior.activeCell()).toBeUndefined(); // Should stay undefined, meaning default state was skipped
    });

    it('should NOT set default state if pointer interacted', () => {
      const gridInputs = getDefaultGridInputs();
      const data = [{cells: [{}, {}]}, {cells: [{}, {}]}];
      const {grid} = createGrid(data, gridInputs);
      const cells = grid.cells();
      grid.onPointerdown({target: cells[0][0].element()} as unknown as PointerEvent); // Interaction

      cells[0][1].inputs.selected.set(true);
      grid.setDefaultStateEffect();
      expect(grid.gridBehavior.focusBehavior.activeCell()).toBe(cells[0][0]); // Should stay on interacted cell
    });

    it('should NOT set default state if focus-in occurred', () => {
      const gridInputs = getDefaultGridInputs();
      const data = [{cells: [{}, {}]}, {cells: [{}, {}]}];
      const {grid} = createGrid(data, gridInputs);

      grid.onFocusIn({} as FocusEvent); // Interaction

      const cells = grid.cells();
      cells[0][1].inputs.selected.set(true);
      grid.setDefaultStateEffect();
      expect(grid.gridBehavior.focusBehavior.activeCell()).toBeUndefined(); // Should stay undefined due to early return
    });
  });
});
