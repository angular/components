import {Component, DebugElement, signal, ChangeDetectionStrategy} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {Grid} from './grid';
import {GridRow} from './grid-row';
import {GridCell} from './grid-cell';
import {GridCellWidget} from './grid-cell-widget';
import {waitForMicrotasks} from '../private/testing/test-helpers';

interface ModifierKeys {
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
}

interface WidgetConfig {
  id?: string;
  type?: 'simple' | 'complex' | 'editable';
  disabled?: boolean;
  tabindex?: number;
  hasTarget?: boolean;
}

interface CellConfig {
  id: string;
  disabled?: boolean;
  role?: 'gridcell' | 'columnheader' | 'rowheader';
  rowIndex?: number;
  colIndex?: number;
  rowSpan?: number;
  colSpan?: number;
  selectable?: boolean;
  widgets?: WidgetConfig[];
}

interface RowConfig {
  rowIndex?: number;
  cells: CellConfig[];
}

function createGridData(): RowConfig[] {
  return Array.from({length: 3}, (_, rIndex) => ({
    cells: Array.from({length: 3}, (_, cIndex) => ({
      id: `c${rIndex}-${cIndex}`,
    })),
  }));
}

describe('Grid directives', () => {
  let fixture: ComponentFixture<GridTestComponent>;
  let gridDebugElement: DebugElement;
  let gridElement: HTMLElement;
  let gridInstance: Grid;

  const keydown = async (key: string, modifierKeys: ModifierKeys = {}) => {
    const event = new KeyboardEvent('keydown', {key, bubbles: true, ...modifierKeys});
    gridElement.dispatchEvent(event);
    await fixture.whenStable();
  };

  const pointerDown = async (target: HTMLElement, eventInit: PointerEventInit = {}) => {
    target.dispatchEvent(new PointerEvent('click', {bubbles: true, ...eventInit}));
    await fixture.whenStable();
  };

  const up = async (modifierKeys?: ModifierKeys) => await keydown('ArrowUp', modifierKeys);
  const down = async (modifierKeys?: ModifierKeys) => await keydown('ArrowDown', modifierKeys);
  const left = async (modifierKeys?: ModifierKeys) => await keydown('ArrowLeft', modifierKeys);
  const right = async (modifierKeys?: ModifierKeys) => await keydown('ArrowRight', modifierKeys);
  const home = async (modifierKeys?: ModifierKeys) => await keydown('Home', modifierKeys);
  const end = async (modifierKeys?: ModifierKeys) => await keydown('End', modifierKeys);
  const enter = async (modifierKeys?: ModifierKeys) => await keydown('Enter', modifierKeys);
  const space = async (modifierKeys?: ModifierKeys) => await keydown(' ', modifierKeys);

  const tabIntoGrid = async () => {
    const focusableElement = gridElement.querySelector('[tabindex="0"]') as HTMLElement;
    focusableElement?.focus();
    await fixture.whenStable();
  };

  function getActiveCellId(): string | null {
    if (fixture.componentInstance.focusMode() === 'roving') {
      const activeEl = gridElement.querySelector('[tabindex="0"]');
      return activeEl ? activeEl.id : null;
    }
    return gridElement.getAttribute('aria-activedescendant');
  }

  async function setupGrid(opts?: {
    disabled?: boolean;
    multi?: boolean;
    rowWrap?: 'continuous' | 'loop' | 'nowrap';
    colWrap?: 'continuous' | 'loop' | 'nowrap';
    focusMode?: 'roving' | 'activedescendant';
    softDisabled?: boolean;
    enableSelection?: boolean;
    selectionMode?: 'follow' | 'explicit';
    gridData?: RowConfig[];
    tabIndex?: number;
  }) {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    fixture = TestBed.createComponent(GridTestComponent);
    const testComponent = fixture.componentInstance;

    if (opts?.disabled !== undefined) testComponent.disabled.set(opts.disabled);
    if (opts?.multi !== undefined) testComponent.multi.set(opts.multi);
    if (opts?.rowWrap !== undefined) testComponent.rowWrap.set(opts.rowWrap);
    if (opts?.colWrap !== undefined) testComponent.colWrap.set(opts.colWrap);
    if (opts?.focusMode !== undefined) testComponent.focusMode.set(opts.focusMode);
    if (opts?.softDisabled !== undefined) testComponent.softDisabled.set(opts.softDisabled);
    if (opts?.enableSelection !== undefined)
      testComponent.enableSelection.set(opts.enableSelection);
    if (opts?.selectionMode !== undefined) testComponent.selectionMode.set(opts.selectionMode);
    if (opts?.tabIndex !== undefined) testComponent.tabIndex.set(opts.tabIndex);

    if (opts?.gridData !== undefined) {
      testComponent.gridData.set(opts.gridData);
    } else {
      testComponent.gridData.set(createGridData());
    }

    await fixture.whenStable();
    gridDebugElement = fixture.debugElement.query(By.directive(Grid));
    gridElement = gridDebugElement.nativeElement;
    gridInstance = gridDebugElement.injector.get(Grid);
  }

  describe('Grid', () => {
    describe('ARIA attributes and roles', () => {
      it('should set role="grid" on the host element', async () => {
        await setupGrid();
        expect(gridElement.getAttribute('role')).toBe('grid');
      });

      it('should set aria-disabled="true" when the disabled input is true', async () => {
        await setupGrid({disabled: true});
        expect(gridElement.getAttribute('aria-disabled')).toBe('true');
      });

      it('should set aria-disabled="false" when the disabled input is false', async () => {
        await setupGrid({disabled: false});
        expect(gridElement.getAttribute('aria-disabled')).toBe('false');
      });

      it('should set aria-multiselectable="true" when the multi input is true', async () => {
        await setupGrid({enableSelection: true, multi: true});
        expect(gridElement.getAttribute('aria-multiselectable')).toBe('true');
      });

      it('should set aria-multiselectable="false" when the multi input is false', async () => {
        await setupGrid({enableSelection: true, multi: false});
        expect(gridElement.getAttribute('aria-multiselectable')).toBe('false');
      });

      it('should set aria-activedescendant to the active cell id', async () => {
        await setupGrid({focusMode: 'activedescendant'});
        // Simulate gaining focus so active Descendant gets populated
        gridElement.dispatchEvent(new Event('focusin'));
        await fixture.whenStable();
        expect(gridElement.getAttribute('aria-activedescendant')).toBe('c0-0');
      });
    });

    describe('focus management', () => {
      it('should set tabindex based on the pattern tabIndex', async () => {
        await setupGrid({focusMode: 'roving'});
        gridInstance._pattern.setDefaultStateEffect();
        await fixture.whenStable();
        await fixture.whenStable();
        expect(gridElement.getAttribute('tabindex')).toBe('-1'); // roving defaults to -1 on host

        await setupGrid({focusMode: 'activedescendant'});
        gridInstance._pattern.setDefaultStateEffect();
        await fixture.whenStable();
        await fixture.whenStable();
        expect(gridElement.getAttribute('tabindex')).toBe('0'); // activedescendant defaults to 0 on host
      });

      it('should be able to override tabindex', async () => {
        await setupGrid({focusMode: 'activedescendant', tabIndex: -1});
        expect(gridElement.getAttribute('tabindex')).toBe('-1');
      });

      it('should activate the cell when the grid receives focusin', async () => {
        await setupGrid();

        // Let effect run to set default state which sets initial active cell
        gridInstance._pattern.setDefaultStateEffect();

        const cell1 = fixture.debugElement.query(By.directive(GridCell)).nativeElement;

        // Dispatch focusin to the cell
        cell1.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
        await fixture.whenStable();

        expect(gridInstance._pattern.activeCell()?.element()).toBe(cell1);
        expect(gridInstance._pattern.isFocused()).toBeTrue();
      });

      it('should deactivate the grid when focusout moves outside the grid', async () => {
        await setupGrid();
        const cell1 = fixture.debugElement.query(By.directive(GridCell)).nativeElement;

        // Focus first

        gridInstance._pattern.setDefaultStateEffect();
        cell1.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
        await fixture.whenStable();
        expect(gridInstance._pattern.isFocused()).toBeTrue();

        // Focusout (blur)
        // Add relatedTarget so we simulate moving focus out completely, otherwise the target doesn't update correctly
        const focusOutEvent = new FocusEvent('focusout', {
          bubbles: true,
          relatedTarget: document.body,
        });
        cell1.dispatchEvent(focusOutEvent);
        await fixture.whenStable();

        expect(gridInstance._pattern.isFocused()).toBeFalse();
      });
    });

    describe('keyboard interactions', () => {
      describe('navigation keys', () => {
        beforeEach(async () => {
          await setupGrid();
          // Let effect run to set default state which sets initial active cell
          gridInstance._pattern.setDefaultStateEffect();
          await fixture.whenStable();

          // Start interactions from the middle cell (c1-1)
          const centerCell = gridElement.querySelector('#c1-1') as HTMLElement;
          centerCell.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
          await fixture.whenStable();
        });

        it('should move focus up to the previous row on ArrowUp', async () => {
          await up();

          expect(getActiveCellId()).toBe('c0-1');
        });

        it('should move focus down to the next row on ArrowDown', async () => {
          await down();

          expect(getActiveCellId()).toBe('c2-1');
        });

        it('should move focus left to the previous column on ArrowLeft', async () => {
          await left();

          expect(getActiveCellId()).toBe('c1-0');
        });

        it('should move focus right to the next column on ArrowRight', async () => {
          await right();

          expect(getActiveCellId()).toBe('c1-2');
        });

        it('should move focus to the first cell in the row on Home', async () => {
          await home();

          expect(getActiveCellId()).toBe('c1-0');
        });

        it('should move focus to the last cell in the row on End', async () => {
          await end();

          expect(getActiveCellId()).toBe('c1-2');
        });

        describe('colWrap configuration', () => {
          it('should wrap to next row when moving right from last column of a row', async () => {
            await setupGrid({colWrap: 'continuous'});
            gridInstance._pattern.setDefaultStateEffect();
            await fixture.whenStable();

            const cell = gridElement.querySelector('#c1-2') as HTMLElement;
            cell.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
            await fixture.whenStable();

            await right();
            expect(getActiveCellId()).toBe('c2-0');
          });

          it('should wrap to previous row when moving left from first column of a row', async () => {
            await setupGrid({colWrap: 'continuous'});
            gridInstance._pattern.setDefaultStateEffect();
            await fixture.whenStable();

            const cell = gridElement.querySelector('#c1-0') as HTMLElement;
            cell.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
            await fixture.whenStable();

            await left();
            expect(getActiveCellId()).toBe('c0-2');
          });

          it('should not wrap to next row when passing row boundaries if colWrap is nowrap', async () => {
            await setupGrid({colWrap: 'nowrap'});
            gridInstance._pattern.setDefaultStateEffect();
            await fixture.whenStable();

            const cell = gridElement.querySelector('#c1-2') as HTMLElement;
            cell.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
            await fixture.whenStable();

            await right();
            expect(getActiveCellId()).toBe('c1-2');
          });

          it('should wrap around the same row when passing row boundaries if colWrap is loop', async () => {
            await setupGrid({colWrap: 'loop'});
            gridInstance._pattern.setDefaultStateEffect();
            await fixture.whenStable();

            const cell = gridElement.querySelector('#c1-2') as HTMLElement;
            cell.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
            await fixture.whenStable();

            await right();
            expect(getActiveCellId()).toBe('c1-0');
          });
        });

        describe('rowWrap configuration', () => {
          it('should wrap to next column when moving down from last row of a column', async () => {
            await setupGrid({rowWrap: 'continuous'});
            gridInstance._pattern.setDefaultStateEffect();
            await fixture.whenStable();

            const cell = gridElement.querySelector('#c2-1') as HTMLElement;
            cell.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
            await fixture.whenStable();

            await down();
            expect(getActiveCellId()).toBe('c0-2');
          });

          it('should wrap to previous column when moving up from first row of a column', async () => {
            await setupGrid({rowWrap: 'continuous'});
            gridInstance._pattern.setDefaultStateEffect();
            await fixture.whenStable();

            const cell = gridElement.querySelector('#c0-1') as HTMLElement;
            cell.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
            await fixture.whenStable();

            await up();
            expect(getActiveCellId()).toBe('c2-0');
          });

          it('should not wrap to next column when passing column boundaries if rowWrap is nowrap', async () => {
            await setupGrid({rowWrap: 'nowrap'});
            gridInstance._pattern.setDefaultStateEffect();
            await fixture.whenStable();

            const cell = gridElement.querySelector('#c2-1') as HTMLElement;
            cell.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
            await fixture.whenStable();

            await down();
            expect(getActiveCellId()).toBe('c2-1');
          });

          it('should wrap around the same column when passing column boundaries if rowWrap is loop', async () => {
            await setupGrid({rowWrap: 'loop'});
            gridInstance._pattern.setDefaultStateEffect();
            await fixture.whenStable();

            const cell = gridElement.querySelector('#c2-1') as HTMLElement;
            cell.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
            await fixture.whenStable();

            await down();
            expect(getActiveCellId()).toBe('c0-1');
          });
        });
      });

      describe('selection keys', () => {
        describe('selectionMode="explicit"', () => {
          beforeEach(async () => {
            await setupGrid({
              enableSelection: true,
              selectionMode: 'explicit',
              multi: true,
            });
            gridInstance._pattern.setDefaultStateEffect();
            await fixture.whenStable();

            // Start interactions from the middle cell
            const centerCell = gridElement.querySelector('#c1-1') as HTMLElement;
            centerCell.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
            await fixture.whenStable();
          });

          it('should toggle selection of the active cell on Space', async () => {
            const centerCell = gridElement.querySelector('#c1-1') as HTMLElement;

            expect(centerCell.getAttribute('aria-selected')).toBe('false');

            await space();

            expect(centerCell.getAttribute('aria-selected')).toBe('true');

            await space();

            expect(centerCell.getAttribute('aria-selected')).toBe('false');
          });

          it('should trigger default action of the active cell on Enter', async () => {
            const centerCell = gridElement.querySelector('#c1-1') as HTMLElement;

            expect(centerCell.getAttribute('aria-selected')).toBe('false');

            await enter();

            expect(centerCell.getAttribute('aria-selected')).toBe('true');

            await enter();

            expect(centerCell.getAttribute('aria-selected')).toBe('false');
          });

          it('should select all selectable cells on Ctrl+A', async () => {
            await keydown('a', {ctrlKey: true});

            const cells = gridElement.querySelectorAll<HTMLElement>('[ngGridCell]');
            for (let i = 0; i < cells.length; i++) {
              expect(cells[i].getAttribute('aria-selected')).toBe('true');
            }

            await keydown('a', {ctrlKey: true});

            for (let i = 0; i < cells.length; i++) {
              expect(cells[i].getAttribute('aria-selected')).toBe('false');
            }
          });
        });

        describe('selectionMode="follow"', () => {
          beforeEach(async () => {
            await setupGrid({
              enableSelection: true,
              selectionMode: 'follow',
              multi: false,
            });
            gridInstance._pattern.setDefaultStateEffect();
            await fixture.whenStable();

            // Start interactions from the middle cell
            const centerCell = gridElement.querySelector('#c1-1') as HTMLElement;
            centerCell.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
            await fixture.whenStable();
          });

          it('should select an item when navigated to with Arrow keys and deselect others', async () => {
            const centerCell = gridElement.querySelector('#c1-1') as HTMLElement;
            const topCell = gridElement.querySelector('#c0-1') as HTMLElement;

            // Focus does not select by itself
            expect(centerCell.getAttribute('aria-selected')).toBe('false');
            expect(topCell.getAttribute('aria-selected')).toBe('false');

            await up();

            // Arrow keys select the target
            expect(centerCell.getAttribute('aria-selected')).toBe('false');
            expect(topCell.getAttribute('aria-selected')).toBe('true');

            await down();

            expect(topCell.getAttribute('aria-selected')).toBe('false');
            expect(centerCell.getAttribute('aria-selected')).toBe('true');
          });
        });
      });
    });

    describe('click interactions', () => {
      beforeEach(async () => {
        await setupGrid({
          enableSelection: true,
          selectionMode: 'explicit',
          multi: true,
        });
        gridInstance._pattern.setDefaultStateEffect();
        await fixture.whenStable();
      });

      it('should focus and select the clicked cell on click', async () => {
        const cell = gridElement.querySelector('#c1-1') as HTMLElement;
        expect(cell.getAttribute('aria-selected')).toBe('false');

        await pointerDown(cell);

        expect(cell.getAttribute('aria-selected')).toBe('true');
        expect(getActiveCellId()).toBe('c1-1');
      });
    });

    describe('configuration', () => {
      it('should prevent multiple selections if selectionMode is single (multi false)', async () => {
        await setupGrid({
          enableSelection: true,
          selectionMode: 'explicit',
          multi: false,
        });

        const cell1 = gridElement.querySelector('#c0-0') as HTMLElement;
        const cell2 = gridElement.querySelector('#c1-1') as HTMLElement;

        await pointerDown(cell1);
        expect(cell1.getAttribute('aria-selected')).toBe('true');

        await pointerDown(cell2);
        expect(cell1.getAttribute('aria-selected')).toBe('false');
        expect(cell2.getAttribute('aria-selected')).toBe('true');
      });

      it('should allow interaction but indicate disabled state if softDisabled is true', async () => {
        const gridData = createGridData();
        gridData[1].cells[1].disabled = true;
        await setupGrid({
          enableSelection: true,
          selectionMode: 'explicit',
          softDisabled: true,
          gridData,
        });
        gridInstance._pattern.setDefaultStateEffect();
        await fixture.whenStable();

        const disabledCell = gridElement.querySelector('#c1-1') as HTMLElement;
        expect(disabledCell.getAttribute('aria-disabled')).toBe('true');

        // Can still interact visually, e.g. focus
        disabledCell.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
        await fixture.whenStable();

        expect(getActiveCellId()).toBe('c1-1');

        // But space should not select it? Wait, interaction is allowed, but actions might be blocked.
        await space();
        expect(disabledCell.getAttribute('aria-selected')).toBe('false');
      });

      it('should skip disabled cells if softDisabled is false', async () => {
        const gridData = createGridData();
        gridData[1].cells[1].disabled = true;
        await setupGrid({
          softDisabled: false,
          gridData,
        });
        gridInstance._pattern.setDefaultStateEffect();
        await fixture.whenStable();

        const startCell = gridElement.querySelector('#c1-0') as HTMLElement;
        startCell.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
        await fixture.whenStable();

        // Navigating right from c1-0 should skip c1-1 and go to c1-2
        await right();
        expect(getActiveCellId()).toBe('c1-2');
      });
    });

    describe('dynamic updates', () => {
      it('should update row order correctly after rows are shuffled', async () => {
        await setupGrid();
        gridInstance._pattern.setDefaultStateEffect();
        await fixture.whenStable();

        const rowPatternsBefore = gridInstance._pattern.inputs.rows();
        expect(rowPatternsBefore.length).toBe(3);
        expect(rowPatternsBefore[0].inputs.cells()[0].element()?.id).toBe('c0-0');

        const gridData = fixture.componentInstance.gridData();
        const firstRow = gridData.shift()!;
        gridData.push(firstRow);
        fixture.componentInstance.gridData.set([...gridData]);
        await fixture.whenStable();
        await waitForMicrotasks();

        const rowPatternsAfter = gridInstance._pattern.inputs.rows();
        expect(rowPatternsAfter.length).toBe(3);
        expect(rowPatternsAfter[0].inputs.cells()[0].element()?.id).toBe('c1-0');
      });
    });
  });

  describe('GridRow', () => {
    describe('ARIA attributes and roles', () => {
      it('should set role="row" on the host element', async () => {
        await setupGrid();
        const row = gridElement.querySelector('tr') as HTMLElement;
        expect(row.getAttribute('role')).toBe('row');
      });

      it('should set aria-rowindex based on the rowIndex input', async () => {
        const gridData = createGridData();
        gridData[0].rowIndex = 5;
        await setupGrid({gridData});
        const row = gridElement.querySelector('tr') as HTMLElement;
        expect(row.getAttribute('aria-rowindex')).toBe('5');
      });
    });

    describe('dynamic updates', () => {
      it('should update cell order correctly after cells are shuffled', async () => {
        await setupGrid();
        gridInstance._pattern.setDefaultStateEffect();
        await fixture.whenStable();

        const firstRow = gridDebugElement.query(By.directive(GridRow)).injector.get(GridRow);
        const cellPatternsBefore = firstRow._pattern.inputs.cells();
        expect(cellPatternsBefore.length).toBe(3);
        expect(cellPatternsBefore[0].element()?.id).toBe('c0-0');

        const gridData = fixture.componentInstance.gridData();
        const firstRowCells = gridData[0].cells;
        const firstCell = firstRowCells.shift()!;
        firstRowCells.push(firstCell);
        fixture.componentInstance.gridData.set([...gridData]);
        await fixture.whenStable();
        await waitForMicrotasks();

        const cellPatternsAfter = firstRow._pattern.inputs.cells();
        expect(cellPatternsAfter.length).toBe(3);
        expect(cellPatternsAfter[0].element()?.id).toBe('c0-1');
      });
    });
  });

  describe('GridCell', () => {
    describe('ARIA attributes and roles', () => {
      it('should set the role based on the role input', async () => {
        const gridData = createGridData();
        gridData[1].cells[1].role = 'columnheader';
        await setupGrid({gridData});
        const cell = gridElement.querySelector('#c1-1') as HTMLElement;
        expect(cell.getAttribute('role')).toBe('columnheader');
      });

      it('should set aria-rowindex to the provided row index', async () => {
        const gridData = createGridData();
        gridData[1].cells[1].rowIndex = 4;
        await setupGrid({gridData});
        const cell = gridElement.querySelector('#c1-1') as HTMLElement;
        expect(cell.getAttribute('aria-rowindex')).toBe('4');
      });

      it('should set aria-colindex to the provided column index', async () => {
        const gridData = createGridData();
        gridData[1].cells[1].colIndex = 3;
        await setupGrid({gridData});
        const cell = gridElement.querySelector('#c1-1') as HTMLElement;
        expect(cell.getAttribute('aria-colindex')).toBe('3');
      });

      it('should set aria-selected="true" when the cell is selected', async () => {
        await setupGrid({enableSelection: true, selectionMode: 'explicit'});
        gridInstance._pattern.setDefaultStateEffect();
        await fixture.whenStable();

        const cell = gridElement.querySelector('#c1-1') as HTMLElement;
        expect(cell.getAttribute('aria-selected')).toBe('false');

        await pointerDown(cell);

        expect(cell.getAttribute('aria-selected')).toBe('true');
      });

      it('should set aria-selected="false" when the cell is unselected', async () => {
        await setupGrid({enableSelection: true, selectionMode: 'explicit'});
        gridInstance._pattern.setDefaultStateEffect();
        await fixture.whenStable();

        const cell = gridElement.querySelector('#c1-1') as HTMLElement;
        await pointerDown(cell);
        expect(cell.getAttribute('aria-selected')).toBe('true');

        await pointerDown(cell);
        expect(cell.getAttribute('aria-selected')).toBe('false');
      });

      it('should set aria-rowspan to the provided rowspan configuration', async () => {
        const gridData = createGridData();
        gridData[1].cells[1].rowSpan = 2;
        await setupGrid({gridData});
        const cell = gridElement.querySelector('#c1-1') as HTMLElement;
        expect(cell.getAttribute('rowspan')).toBe('2');
        expect(cell.getAttribute('aria-rowspan')).toBe('2');
      });

      it('should set aria-colspan to the provided colspan configuration', async () => {
        const gridData = createGridData();
        gridData[1].cells[1].colSpan = 3;
        await setupGrid({gridData});
        const cell = gridElement.querySelector('#c1-1') as HTMLElement;
        expect(cell.getAttribute('colspan')).toBe('3');
        expect(cell.getAttribute('aria-colspan')).toBe('3');
      });

      it('should set id from the id input if provided', async () => {
        const gridData = createGridData();
        gridData[1].cells[1].id = 'custom-id';
        await setupGrid({gridData});
        const cell = gridElement.querySelector('#custom-id') as HTMLElement;
        expect(cell.getAttribute('id')).toBe('custom-id');
      });
    });

    describe('focus management', () => {
      it('should set tabindex="0" on the active cell', async () => {
        await setupGrid({focusMode: 'roving'});
        gridInstance._pattern.setDefaultStateEffect();
        await fixture.whenStable();

        const cell = gridElement.querySelector('#c0-0') as HTMLElement;
        expect(cell.getAttribute('tabindex')).toBe('0');
      });

      it('should set tabindex="-1" on inactive cells', async () => {
        await setupGrid({focusMode: 'roving'});
        gridInstance._pattern.setDefaultStateEffect();
        await fixture.whenStable();

        const cell = gridElement.querySelector('#c1-1') as HTMLElement;
        expect(cell.getAttribute('tabindex')).toBe('-1');
      });

      it('should set data-active="true" when the cell becomes active', async () => {
        await setupGrid();
        gridInstance._pattern.setDefaultStateEffect();
        await fixture.whenStable();

        const cell = gridElement.querySelector('#c0-0') as HTMLElement;
        expect(cell.getAttribute('data-active')).toBe('true');
      });
    });

    describe('configuration', () => {
      it('should prevent selection when disabled input is true', async () => {
        const gridData = createGridData();
        gridData[1].cells[1].disabled = true;
        await setupGrid({enableSelection: true, selectionMode: 'explicit', gridData});
        gridInstance._pattern.setDefaultStateEffect();
        await fixture.whenStable();

        const cell = gridElement.querySelector('#c1-1') as HTMLElement;
        await pointerDown(cell);

        expect(cell.getAttribute('aria-selected')).toBe('false');
      });

      it('should prevent interaction when disabled input is true', async () => {
        const gridData = createGridData();
        gridData[1].cells[1].disabled = true;
        await setupGrid({
          enableSelection: true,
          selectionMode: 'explicit',
          softDisabled: false,
          gridData,
        });
        gridInstance._pattern.setDefaultStateEffect();
        await fixture.whenStable();

        const startCell = gridElement.querySelector('#c1-0') as HTMLElement;
        startCell.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
        await fixture.whenStable();

        // Navigating right from c1-0 should skip c1-1 and go to c1-2 because it's completely disabled
        await right();
        expect(getActiveCellId()).toBe('c1-2');
      });

      it('should prevent selection when selectable input is false', async () => {
        const gridData = createGridData();
        gridData[1].cells[1].selectable = false;
        await setupGrid({enableSelection: true, selectionMode: 'explicit', gridData});
        gridInstance._pattern.setDefaultStateEffect();
        await fixture.whenStable();

        const cell = gridElement.querySelector('#c1-1') as HTMLElement;
        await pointerDown(cell);

        expect(cell.hasAttribute('aria-selected')).toBeFalse();
      });

      it('should update the selected property when bound value changes', async () => {
        // Needs a two-way binding test, but we can just test selection updates since it is model()
        await setupGrid({enableSelection: true, selectionMode: 'explicit'});
        gridInstance._pattern.setDefaultStateEffect();
        await fixture.whenStable();

        const cellDirective = fixture.debugElement.query(By.css('#c1-1')).injector.get(GridCell);
        expect(cellDirective.selected()).toBeFalse();

        const cell = gridElement.querySelector('#c1-1') as HTMLElement;
        await pointerDown(cell);

        expect(cellDirective.selected()).toBeTrue();
      });
    });
  });

  describe('GridCellWidget', () => {
    describe('ARIA and Host attributes', () => {
      it('should set data-active="true" when the widget is active', async () => {
        const gridData = createGridData();
        gridData[1].cells[1].widgets = [{id: 'w1', type: 'simple'}];
        await setupGrid({gridData});
        gridInstance._pattern.setDefaultStateEffect();
        await fixture.whenStable();

        const cell = gridElement.querySelector('#c1-1') as HTMLElement;
        const widget = gridElement.querySelector('#w1') as HTMLElement;

        expect(widget.getAttribute('data-active')).toBe('false');
        await pointerDown(cell);
        expect(widget.getAttribute('data-active')).toBe('true');
      });

      it('should set data-active-control="widget" when the widget is activated', async () => {
        const gridData = createGridData();
        gridData[1].cells[1].widgets = [{id: 'w1', type: 'editable'}];
        await setupGrid({gridData});
        gridInstance._pattern.setDefaultStateEffect();
        await fixture.whenStable();

        const cell = gridElement.querySelector('#c1-1') as HTMLElement;
        const widget = gridElement.querySelector('#w1') as HTMLElement;

        await pointerDown(cell);
        expect(widget.getAttribute('data-active-control')).toBe('cell');

        await keydown('Enter');
        expect(widget.getAttribute('data-active-control')).toBe('widget');
      });

      it('should set tabindex="0" on the active widget', async () => {
        const gridData = createGridData();
        gridData[1].cells[1].widgets = [{id: 'w1', type: 'simple'}];
        await setupGrid({gridData});
        gridInstance._pattern.setDefaultStateEffect();
        await fixture.whenStable();

        const cell = gridElement.querySelector('#c1-1') as HTMLElement;
        const widget = gridElement.querySelector('#w1') as HTMLElement;

        await pointerDown(cell);
        expect(widget.getAttribute('tabindex')).toBe('0');
      });

      it('should set tabindex="-1" on inactive widgets', async () => {
        const gridData = createGridData();
        gridData[1].cells[1].widgets = [{id: 'w1', type: 'simple'}];
        gridData[1].cells[2].widgets = [{id: 'w2', type: 'simple'}];
        await setupGrid({gridData});
        gridInstance._pattern.setDefaultStateEffect();
        await fixture.whenStable();

        const widget1 = gridElement.querySelector('#w1') as HTMLElement;
        const widget2 = gridElement.querySelector('#w2') as HTMLElement;

        const cell = gridElement.querySelector('#c1-1') as HTMLElement;
        await pointerDown(cell);

        expect(widget1.getAttribute('tabindex')).toBe('0');
        expect(widget2.getAttribute('tabindex')).toBe('-1');
      });
    });

    describe('widget activation', () => {
      it('should immediately delegate focus when widgetType is simple', async () => {
        const gridData = createGridData();
        gridData[0].cells[0].widgets = [{id: 'w1', type: 'simple'}];
        await setupGrid({gridData});
        gridInstance._pattern.setDefaultStateEffect();
        await fixture.whenStable();

        const widget = gridElement.querySelector('#w1') as HTMLElement;

        await tabIntoGrid();

        expect(document.activeElement).toBe(widget);
      });

      it('should wait for enter key to delegate focus when widgetType is complex', async () => {
        const gridData = createGridData();
        gridData[0].cells[0].widgets = [{id: 'w1', type: 'complex'}];
        await setupGrid({gridData});
        gridInstance._pattern.setDefaultStateEffect();
        await fixture.whenStable();

        const widgetDirective = fixture.debugElement
          .query(By.css('#w1'))
          .injector.get(GridCellWidget);

        await tabIntoGrid();

        expect(widgetDirective.isActivated()).toBeFalse();

        await keydown('Enter');
        expect(widgetDirective.isActivated()).toBeTrue();
      });

      it('should enter edit mode when widgetType is editable and enter is pressed', async () => {
        const gridData = createGridData();
        gridData[0].cells[0].widgets = [{id: 'w1', type: 'editable'}];
        await setupGrid({gridData});
        gridInstance._pattern.setDefaultStateEffect();
        await fixture.whenStable();

        const widgetDirective = fixture.debugElement
          .query(By.css('#w1'))
          .injector.get(GridCellWidget);

        await tabIntoGrid();

        await keydown('Enter');
        expect(widgetDirective.isActivated()).toBeTrue();
      });

      it('should give widget tabindex -1 when focusTarget is present', async () => {
        const gridData = createGridData();
        gridData[0].cells[0].widgets = [{id: 'w1', type: 'complex', hasTarget: true}];
        await setupGrid({gridData});
        gridInstance._pattern.setDefaultStateEffect();
        await fixture.whenStable();

        const widgetElement = gridElement.querySelector('#w1') as HTMLElement;
        expect(widgetElement.getAttribute('tabindex')).toBe('-1');
      });

      it('should emit the activated output on Enter for simple widget', async () => {
        const gridData = createGridData();
        gridData[0].cells[0].widgets = [{id: 'w1', type: 'simple'}];
        await setupGrid({gridData});
        gridInstance._pattern.setDefaultStateEffect();
        await fixture.whenStable();

        await tabIntoGrid();

        expect(fixture.componentInstance.onActivated).not.toHaveBeenCalled();

        await keydown('Enter');
        expect(fixture.componentInstance.onActivated).toHaveBeenCalled();
      });

      it('should emit the activated output on Space for simple widget', async () => {
        const gridData = createGridData();
        gridData[0].cells[0].widgets = [{id: 'w1', type: 'simple'}];
        await setupGrid({gridData});
        gridInstance._pattern.setDefaultStateEffect();
        await fixture.whenStable();

        await tabIntoGrid();

        expect(fixture.componentInstance.onActivated).not.toHaveBeenCalled();

        await keydown(' ');
        expect(fixture.componentInstance.onActivated).toHaveBeenCalled();
      });

      it('should emit the activated output in activedescendant mode when event is dispatched directly to grid', async () => {
        const gridData = createGridData();
        gridData[0].cells[0].widgets = [{id: 'w1', type: 'simple'}];
        await setupGrid({gridData, focusMode: 'activedescendant'});
        gridInstance._pattern.setDefaultStateEffect();
        await fixture.whenStable();

        expect(fixture.componentInstance.onActivated).not.toHaveBeenCalled();

        // Verify standard activedescendant behavior by targeting the CONTAINER directly
        const event = new KeyboardEvent('keydown', {
          key: 'Enter',
          bubbles: true,
        });
        gridElement.dispatchEvent(event);
        await fixture.whenStable();

        expect(fixture.componentInstance.onActivated).toHaveBeenCalled();
      });

      it('should emit the activated output when the widget becomes active', async () => {
        const gridData = createGridData();
        gridData[0].cells[0].widgets = [{id: 'w1', type: 'complex'}];
        await setupGrid({gridData});
        gridInstance._pattern.setDefaultStateEffect();
        await fixture.whenStable();

        await tabIntoGrid();

        expect(fixture.componentInstance.onActivated).not.toHaveBeenCalled();

        await keydown('Enter');
        expect(fixture.componentInstance.onActivated).toHaveBeenCalled();
      });

      it('should emit the deactivated output when the widget loses active state', async () => {
        const gridData = createGridData();
        gridData[0].cells[0].widgets = [{id: 'w1', type: 'complex'}];
        await setupGrid({gridData});
        gridInstance._pattern.setDefaultStateEffect();
        await fixture.whenStable();

        await tabIntoGrid();

        await keydown('Enter');
        expect(fixture.componentInstance.onDeactivated).not.toHaveBeenCalled();

        await keydown('Escape');
        expect(fixture.componentInstance.onDeactivated).toHaveBeenCalled();
      });

      it('should become active when activate() is called programmatically', async () => {
        const gridData = createGridData();
        gridData[0].cells[0].widgets = [{id: 'w1', type: 'complex'}];
        await setupGrid({gridData});
        gridInstance._pattern.setDefaultStateEffect();
        await fixture.whenStable();

        const widgetDirective = fixture.debugElement
          .query(By.css('#w1'))
          .injector.get(GridCellWidget);

        widgetDirective.activate();
        await fixture.whenStable();

        expect(widgetDirective.isActivated()).toBeTrue();
        expect(fixture.componentInstance.onActivated).toHaveBeenCalled();
      });

      it('should lose active state when deactivate() is called programmatically', async () => {
        const gridData = createGridData();
        gridData[0].cells[0].widgets = [{id: 'w1', type: 'complex'}];
        await setupGrid({gridData});
        gridInstance._pattern.setDefaultStateEffect();
        await fixture.whenStable();

        const widgetDirective = fixture.debugElement
          .query(By.css('#w1'))
          .injector.get(GridCellWidget);

        widgetDirective.activate();
        await fixture.whenStable();

        expect(widgetDirective.isActivated()).toBeTrue();

        widgetDirective.deactivate();
        await fixture.whenStable();

        expect(widgetDirective.isActivated()).toBeFalse();
      });
    });

    describe('disabled element roving tabindex calculation', () => {
      it('should not choose disabled element as active cell when softDisabled is false upon cell deletion', async () => {
        const gridData: RowConfig[] = [
          {
            cells: [{id: 'c0-0'}, {id: 'c0-1', disabled: true}, {id: 'c0-2'}],
          },
        ];
        await setupGrid({
          gridData,
          softDisabled: false,
          focusMode: 'roving',
        });
        gridInstance._pattern.setDefaultStateEffect();
        await fixture.whenStable();

        expect(getActiveCellId()).toBe('c0-0');

        // Delete c0-0 so c0-1 (disabled) is now at index 0
        fixture.componentInstance.gridData.set([
          {
            cells: [{id: 'c0-1', disabled: true}, {id: 'c0-2'}],
          },
        ]);
        await fixture.whenStable();
        await fixture.whenStable();

        expect(getActiveCellId()).toBe('c0-2');
      });

      it('should not choose cell with disabled widget as active cell when softDisabled is false upon cell deletion', async () => {
        const gridData: RowConfig[] = [
          {
            cells: [
              {id: 'c0-0'},
              {id: 'c0-1', widgets: [{id: 'w0-1', disabled: true}]},
              {id: 'c0-2'},
            ],
          },
        ];
        await setupGrid({
          gridData,
          softDisabled: false,
          focusMode: 'roving',
        });
        gridInstance._pattern.setDefaultStateEffect();
        await fixture.whenStable();

        expect(getActiveCellId()).toBe('c0-0');

        // Delete c0-0 so c0-1 (with disabled widget) is now at index 0
        fixture.componentInstance.gridData.set([
          {
            cells: [{id: 'c0-1', widgets: [{id: 'w0-1', disabled: true}]}, {id: 'c0-2'}],
          },
        ]);
        await fixture.whenStable();
        await fixture.whenStable();

        expect(getActiveCellId()).toBe('c0-2');
      });

      it('should recalculate active cell when active cell dynamically becomes disabled and softDisabled is false', async () => {
        const gridData: RowConfig[] = [
          {
            cells: [{id: 'c0-0'}, {id: 'c0-1'}, {id: 'c0-2'}],
          },
        ];
        await setupGrid({
          gridData,
          softDisabled: false,
          focusMode: 'roving',
        });
        gridInstance._pattern.setDefaultStateEffect();
        await fixture.whenStable();

        expect(getActiveCellId()).toBe('c0-0');

        // Dynamically disable c0-0 in-place
        fixture.componentInstance.gridData.set([
          {
            cells: [{id: 'c0-0', disabled: true}, {id: 'c0-1'}, {id: 'c0-2'}],
          },
        ]);
        await fixture.whenStable();
        await fixture.whenStable();

        expect(getActiveCellId()).toBe('c0-1');
      });
    });
  });

  describe('structural validations', () => {
    let consoleSpy: jasmine.Spy;

    beforeEach(() => {
      consoleSpy = spyOn(console, 'warn');
    });

    afterEach(async () => {
      TestBed.resetTestingModule();
      await setupGrid();
    });

    it('should warn when ngGridRow contains no cells', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [GridRowWithoutCells],
      });
      const noCellsFixture = TestBed.createComponent(GridRowWithoutCells);
      noCellsFixture.detectChanges();

      expect(consoleSpy).toHaveBeenCalledWith('ngGridRow must contain at least one ngGridCell.');
    });
  });
});

@Component({
  template: `
    <table ngGrid
      [disabled]="disabled()"
      [multi]="multi()"
      [rowWrap]="rowWrap()"
      [colWrap]="colWrap()"
      [focusMode]="focusMode()"
      [softDisabled]="softDisabled()"
      [enableSelection]="enableSelection()"
      [selectionMode]="selectionMode()"
      [tabindex]="tabIndex()">
      @for (row of gridData(); track row; let rIndex = $index) {
        <tr ngGridRow [rowIndex]="row.rowIndex">
          @for (cell of row.cells; track cell; let cIndex = $index) {
            <td ngGridCell
                [id]="cell.id"
                [disabled]="cell.disabled ?? false"
                [role]="cell.role ?? 'gridcell'"
                [rowIndex]="cell.rowIndex"
                [colIndex]="cell.colIndex"
                [rowSpan]="cell.rowSpan ?? 1"
                [colSpan]="cell.colSpan ?? 1"
                [selectable]="cell.selectable ?? true">
              Cell {{rIndex}}-{{cIndex}}
              @for (widget of cell.widgets || []; track $index; let wIndex = $index) {
                @if (widget.hasTarget) {
                  <button ngGridCellWidget
                      [id]="widget.id ?? ('w' + rIndex + '-' + cIndex + '-' + wIndex)"
                      [widgetType]="widget.type ?? 'simple'"
                      [disabled]="widget.disabled ?? false"
                      [tabindex]="widget.tabindex"
                      [focusTarget]="targetInput"
                      (activated)="onActivated($event)"
                      (deactivated)="onDeactivated($event)">
                    Widget
                  </button>
                  <input #targetInput id="target-{{widget.id}}" type="text" />
                } @else {
                  <button ngGridCellWidget
                      [id]="widget.id ?? ('w' + rIndex + '-' + cIndex + '-' + wIndex)"
                      [widgetType]="widget.type ?? 'simple'"
                      [disabled]="widget.disabled ?? false"
                      [tabindex]="widget.tabindex"
                      (activated)="onActivated($event)"
                      (deactivated)="onDeactivated($event)">
                    Widget
                  </button>
                }
              }
            </td>
          }
        </tr>
      }
    </table>
  `,
  imports: [Grid, GridRow, GridCell, GridCellWidget],
  changeDetection: ChangeDetectionStrategy.Eager,
})
class GridTestComponent {
  readonly disabled = signal(false);
  readonly multi = signal(false);
  readonly rowWrap = signal<'continuous' | 'loop' | 'nowrap'>('loop');
  readonly colWrap = signal<'continuous' | 'loop' | 'nowrap'>('loop');
  readonly focusMode = signal<'roving' | 'activedescendant'>('roving');
  readonly softDisabled = signal(true);
  readonly enableSelection = signal(false);
  readonly selectionMode = signal<'follow' | 'explicit'>('follow');
  readonly gridData = signal<RowConfig[]>(createGridData());
  readonly tabIndex = signal<number | undefined>(undefined);

  onActivated = jasmine.createSpy('activated');
  onDeactivated = jasmine.createSpy('deactivated');
}

@Component({
  template: `
    <table ngGrid>
      <tr ngGridRow></tr>
    </table>
  `,
  imports: [Grid, GridRow],
  changeDetection: ChangeDetectionStrategy.Eager,
})
class GridRowWithoutCells {}
