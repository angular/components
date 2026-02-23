import {Component, DebugElement, signal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {Grid} from './grid';
import {GridRow} from './grid-row';
import {GridCell} from './grid-cell';
import {GridCellWidget} from './grid-cell-widget';

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

  const keydown = (key: string, modifierKeys: ModifierKeys = {}) => {
    const event = new KeyboardEvent('keydown', {key, bubbles: true, ...modifierKeys});
    gridElement.dispatchEvent(event);
    fixture.detectChanges();
  };

  const pointerDown = (target: HTMLElement, eventInit: PointerEventInit = {}) => {
    target.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true, ...eventInit}));
    fixture.detectChanges();
  };

  const pointerMove = (target: HTMLElement | Window, eventInit: PointerEventInit = {}) => {
    target.dispatchEvent(new PointerEvent('pointermove', {bubbles: true, ...eventInit}));
    fixture.detectChanges();
  };

  const pointerUp = (target: HTMLElement | Window, eventInit: PointerEventInit = {}) => {
    target.dispatchEvent(new PointerEvent('pointerup', {bubbles: true, ...eventInit}));
    fixture.detectChanges();
  };

  const up = (modifierKeys?: ModifierKeys) => keydown('ArrowUp', modifierKeys);
  const down = (modifierKeys?: ModifierKeys) => keydown('ArrowDown', modifierKeys);
  const left = (modifierKeys?: ModifierKeys) => keydown('ArrowLeft', modifierKeys);
  const right = (modifierKeys?: ModifierKeys) => keydown('ArrowRight', modifierKeys);
  const home = (modifierKeys?: ModifierKeys) => keydown('Home', modifierKeys);
  const end = (modifierKeys?: ModifierKeys) => keydown('End', modifierKeys);
  const enter = (modifierKeys?: ModifierKeys) => keydown('Enter', modifierKeys);
  const space = (modifierKeys?: ModifierKeys) => keydown(' ', modifierKeys);

  const tabIntoGrid = () => {
    const focusableElement = gridElement.querySelector('[tabindex="0"]') as HTMLElement;
    focusableElement?.focus();
    fixture.detectChanges();
  };

  function getActiveCellId(): string | null {
    if (fixture.componentInstance.focusMode() === 'roving') {
      const activeEl = gridElement.querySelector('[tabindex="0"]');
      return activeEl ? activeEl.id : null;
    }
    return gridElement.getAttribute('aria-activedescendant');
  }

  function setupGrid(opts?: {
    disabled?: boolean;
    multi?: boolean;
    rowWrap?: 'continuous' | 'loop' | 'nowrap';
    colWrap?: 'continuous' | 'loop' | 'nowrap';
    focusMode?: 'roving' | 'activedescendant';
    softDisabled?: boolean;
    enableSelection?: boolean;
    selectionMode?: 'follow' | 'explicit';
    enableRangeSelection?: boolean;
    gridData?: RowConfig[];
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
    if (opts?.enableRangeSelection !== undefined)
      testComponent.enableRangeSelection.set(opts.enableRangeSelection);

    if (opts?.gridData !== undefined) {
      testComponent.gridData.set(opts.gridData);
    } else {
      testComponent.gridData.set(createGridData());
    }

    fixture.detectChanges();
    gridDebugElement = fixture.debugElement.query(By.directive(Grid));
    gridElement = gridDebugElement.nativeElement;
    gridInstance = gridDebugElement.injector.get(Grid);
  }

  describe('Grid', () => {
    describe('ARIA attributes and roles', () => {
      it('should set role="grid" on the host element', () => {
        setupGrid();
        expect(gridElement.getAttribute('role')).toBe('grid');
      });

      it('should set aria-disabled="true" when the disabled input is true', () => {
        setupGrid({disabled: true});
        expect(gridElement.getAttribute('aria-disabled')).toBe('true');
      });

      it('should set aria-disabled="false" when the disabled input is false', () => {
        setupGrid({disabled: false});
        expect(gridElement.getAttribute('aria-disabled')).toBe('false');
      });

      it('should set aria-multiselectable="true" when the multi input is true', () => {
        setupGrid({enableSelection: true, multi: true});
        expect(gridElement.getAttribute('aria-multiselectable')).toBe('true');
      });

      it('should set aria-multiselectable="false" when the multi input is false', () => {
        setupGrid({enableSelection: true, multi: false});
        expect(gridElement.getAttribute('aria-multiselectable')).toBe('false');
      });

      it('should set aria-activedescendant to the active cell id', () => {
        setupGrid({focusMode: 'activedescendant'});
        // Simulate gaining focus so active Descendant gets populated
        gridElement.dispatchEvent(new Event('focusin'));
        fixture.detectChanges();
        expect(gridElement.getAttribute('aria-activedescendant')).toBe('c0-0');
      });
    });

    describe('focus management', () => {
      it('should set tabindex based on the pattern tabIndex', () => {
        setupGrid({focusMode: 'roving'});
        expect(gridElement.getAttribute('tabindex')).toBe('-1'); // roving defaults to -1 on host

        setupGrid({focusMode: 'activedescendant'});
        expect(gridElement.getAttribute('tabindex')).toBe('0'); // activedescendant defaults to 0 on host
      });

      it('should activate the cell when the grid receives focusin', () => {
        setupGrid();

        // Let effect run to set default state which sets initial active cell
        gridInstance._pattern.setDefaultStateEffect();

        const cell1 = fixture.debugElement.query(By.directive(GridCell)).nativeElement;

        // Dispatch focusin to the cell
        cell1.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
        fixture.detectChanges();

        expect(gridInstance._pattern.activeCell()?.element()).toBe(cell1);
        expect(gridInstance._pattern.isFocused()).toBeTrue();
      });

      it('should deactivate the grid when focusout moves outside the grid', () => {
        setupGrid();
        const cell1 = fixture.debugElement.query(By.directive(GridCell)).nativeElement;

        // Focus first

        gridInstance._pattern.setDefaultStateEffect();
        cell1.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
        fixture.detectChanges();
        expect(gridInstance._pattern.isFocused()).toBeTrue();

        // Focusout (blur)
        // Add relatedTarget so we simulate moving focus out completely, otherwise the target doesn't update correctly
        const focusOutEvent = new FocusEvent('focusout', {
          bubbles: true,
          relatedTarget: document.body,
        });
        cell1.dispatchEvent(focusOutEvent);
        fixture.detectChanges();

        expect(gridInstance._pattern.isFocused()).toBeFalse();
      });
    });

    describe('keyboard interactions', () => {
      describe('navigation keys', () => {
        beforeEach(() => {
          setupGrid();
          // Let effect run to set default state which sets initial active cell
          gridInstance._pattern.setDefaultStateEffect();
          fixture.detectChanges();

          // Start interactions from the middle cell (c1-1)
          const centerCell = gridElement.querySelector('#c1-1') as HTMLElement;
          centerCell.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
          fixture.detectChanges();
        });

        it('should move focus up to the previous row on ArrowUp', () => {
          up();

          expect(getActiveCellId()).toBe('c0-1');
        });

        it('should move focus down to the next row on ArrowDown', () => {
          down();

          expect(getActiveCellId()).toBe('c2-1');
        });

        it('should move focus left to the previous column on ArrowLeft', () => {
          left();

          expect(getActiveCellId()).toBe('c1-0');
        });

        it('should move focus right to the next column on ArrowRight', () => {
          right();

          expect(getActiveCellId()).toBe('c1-2');
        });

        it('should move focus to the first cell in the row on Home', () => {
          home();

          expect(getActiveCellId()).toBe('c1-0');
        });

        it('should move focus to the last cell in the row on End', () => {
          end();

          expect(getActiveCellId()).toBe('c1-2');
        });

        describe('colWrap configuration', () => {
          it('should wrap to next row when moving right from last column of a row', () => {
            setupGrid({colWrap: 'continuous'});
            gridInstance._pattern.setDefaultStateEffect();
            fixture.detectChanges();

            const cell = gridElement.querySelector('#c1-2') as HTMLElement;
            cell.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
            fixture.detectChanges();

            right();
            expect(getActiveCellId()).toBe('c2-0');
          });

          it('should wrap to previous row when moving left from first column of a row', () => {
            setupGrid({colWrap: 'continuous'});
            gridInstance._pattern.setDefaultStateEffect();
            fixture.detectChanges();

            const cell = gridElement.querySelector('#c1-0') as HTMLElement;
            cell.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
            fixture.detectChanges();

            left();
            expect(getActiveCellId()).toBe('c0-2');
          });

          it('should not wrap to next row when passing row boundaries if colWrap is nowrap', () => {
            setupGrid({colWrap: 'nowrap'});
            gridInstance._pattern.setDefaultStateEffect();
            fixture.detectChanges();

            const cell = gridElement.querySelector('#c1-2') as HTMLElement;
            cell.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
            fixture.detectChanges();

            right();
            expect(getActiveCellId()).toBe('c1-2');
          });

          it('should wrap around the same row when passing row boundaries if colWrap is loop', () => {
            setupGrid({colWrap: 'loop'});
            gridInstance._pattern.setDefaultStateEffect();
            fixture.detectChanges();

            const cell = gridElement.querySelector('#c1-2') as HTMLElement;
            cell.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
            fixture.detectChanges();

            right();
            expect(getActiveCellId()).toBe('c1-0');
          });
        });

        describe('rowWrap configuration', () => {
          it('should wrap to next column when moving down from last row of a column', () => {
            setupGrid({rowWrap: 'continuous'});
            gridInstance._pattern.setDefaultStateEffect();
            fixture.detectChanges();

            const cell = gridElement.querySelector('#c2-1') as HTMLElement;
            cell.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
            fixture.detectChanges();

            down();
            expect(getActiveCellId()).toBe('c0-2');
          });

          it('should wrap to previous column when moving up from first row of a column', () => {
            setupGrid({rowWrap: 'continuous'});
            gridInstance._pattern.setDefaultStateEffect();
            fixture.detectChanges();

            const cell = gridElement.querySelector('#c0-1') as HTMLElement;
            cell.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
            fixture.detectChanges();

            up();
            expect(getActiveCellId()).toBe('c2-0');
          });

          it('should not wrap to next column when passing column boundaries if rowWrap is nowrap', () => {
            setupGrid({rowWrap: 'nowrap'});
            gridInstance._pattern.setDefaultStateEffect();
            fixture.detectChanges();

            const cell = gridElement.querySelector('#c2-1') as HTMLElement;
            cell.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
            fixture.detectChanges();

            down();
            expect(getActiveCellId()).toBe('c2-1');
          });

          it('should wrap around the same column when passing column boundaries if rowWrap is loop', () => {
            setupGrid({rowWrap: 'loop'});
            gridInstance._pattern.setDefaultStateEffect();
            fixture.detectChanges();

            const cell = gridElement.querySelector('#c2-1') as HTMLElement;
            cell.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
            fixture.detectChanges();

            down();
            expect(getActiveCellId()).toBe('c0-1');
          });
        });
      });

      describe('selection keys', () => {
        describe('selectionMode="explicit"', () => {
          beforeEach(() => {
            setupGrid({
              enableSelection: true,
              selectionMode: 'explicit',
              multi: true,
              enableRangeSelection: true,
            });
            gridInstance._pattern.setDefaultStateEffect();
            fixture.detectChanges();

            // Start interactions from the middle cell
            const centerCell = gridElement.querySelector('#c1-1') as HTMLElement;
            centerCell.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
            fixture.detectChanges();
          });

          it('should toggle selection of the active cell on Space', () => {
            const centerCell = gridElement.querySelector('#c1-1') as HTMLElement;

            expect(centerCell.getAttribute('aria-selected')).toBe('false');

            space();

            expect(centerCell.getAttribute('aria-selected')).toBe('true');

            space();

            expect(centerCell.getAttribute('aria-selected')).toBe('false');
          });

          it('should trigger default action of the active cell on Enter', () => {
            const centerCell = gridElement.querySelector('#c1-1') as HTMLElement;

            expect(centerCell.getAttribute('aria-selected')).toBe('false');

            enter();

            expect(centerCell.getAttribute('aria-selected')).toBe('true');

            enter();

            expect(centerCell.getAttribute('aria-selected')).toBe('false');
          });

          it('should select all selectable cells on Ctrl+A', () => {
            keydown('a', {ctrlKey: true});

            const cells = gridElement.querySelectorAll<HTMLElement>('[ngGridCell]');
            for (let i = 0; i < cells.length; i++) {
              expect(cells[i].getAttribute('aria-selected')).toBe('true');
            }

            keydown('a', {ctrlKey: true});

            for (let i = 0; i < cells.length; i++) {
              expect(cells[i].getAttribute('aria-selected')).toBe('false');
            }
          });
        });

        describe('selectionMode="follow"', () => {
          beforeEach(() => {
            setupGrid({
              enableSelection: true,
              selectionMode: 'follow',
              multi: false,
            });
            gridInstance._pattern.setDefaultStateEffect();
            fixture.detectChanges();

            // Start interactions from the middle cell
            const centerCell = gridElement.querySelector('#c1-1') as HTMLElement;
            centerCell.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
            fixture.detectChanges();
          });

          it('should select an item when navigated to with Arrow keys and deselect others', () => {
            const centerCell = gridElement.querySelector('#c1-1') as HTMLElement;
            const topCell = gridElement.querySelector('#c0-1') as HTMLElement;

            // Focus does not select by itself
            expect(centerCell.getAttribute('aria-selected')).toBe('false');
            expect(topCell.getAttribute('aria-selected')).toBe('false');

            up();

            // Arrow keys select the target
            expect(centerCell.getAttribute('aria-selected')).toBe('false');
            expect(topCell.getAttribute('aria-selected')).toBe('true');

            down();

            expect(topCell.getAttribute('aria-selected')).toBe('false');
            expect(centerCell.getAttribute('aria-selected')).toBe('true');
          });
        });
      });
    });

    describe('pointer interactions', () => {
      beforeEach(() => {
        setupGrid({
          enableSelection: true,
          selectionMode: 'explicit',
          multi: true,
          enableRangeSelection: true,
        });
        gridInstance._pattern.setDefaultStateEffect();
        fixture.detectChanges();
      });

      it('should focus and select the clicked cell on pointerdown', () => {
        const cell = gridElement.querySelector('#c1-1') as HTMLElement;
        expect(cell.getAttribute('aria-selected')).toBe('false');

        pointerDown(cell);

        expect(cell.getAttribute('aria-selected')).toBe('true');
        expect(getActiveCellId()).toBe('c1-1');
      });

      it('should expand selection on pointermove while dragging without changing active cell', () => {
        const startCell = gridElement.querySelector('#c0-0') as HTMLElement;
        const dragCell = gridElement.querySelector('#c1-1') as HTMLElement;

        pointerDown(startCell);
        pointerMove(dragCell);

        expect(getActiveCellId()).toBe('c0-0');
        // Dragging expands selection
        expect(startCell.getAttribute('aria-selected')).toBe('true');
        expect(dragCell.getAttribute('aria-selected')).toBe('true');
      });

      it('should stop dragging on pointerup', () => {
        const startCell = gridElement.querySelector('#c0-0') as HTMLElement;
        const endCell = gridElement.querySelector('#c1-1') as HTMLElement;

        pointerDown(startCell);
        pointerUp(gridElement);
        pointerMove(endCell);

        // Active cell should still be c0-0 because dragging stopped before moving to c1-1
        expect(getActiveCellId()).toBe('c0-0');
        expect(endCell.getAttribute('aria-selected')).toBe('false');
      });

      it('should not change active cell on pointermove outside of the grid cells', () => {
        const startCell = gridElement.querySelector('#c0-0') as HTMLElement;

        pointerDown(startCell);
        pointerMove(gridElement);

        expect(getActiveCellId()).toBe('c0-0');
      });
    });

    describe('configuration', () => {
      it('should prevent multiple selections if selectionMode is single (multi false)', () => {
        setupGrid({
          enableSelection: true,
          selectionMode: 'explicit',
          multi: false,
        });

        const cell1 = gridElement.querySelector('#c0-0') as HTMLElement;
        const cell2 = gridElement.querySelector('#c1-1') as HTMLElement;

        pointerDown(cell1);
        expect(cell1.getAttribute('aria-selected')).toBe('true');

        pointerDown(cell2);
        expect(cell1.getAttribute('aria-selected')).toBe('false');
        expect(cell2.getAttribute('aria-selected')).toBe('true');
      });

      it('should allow interaction but indicate disabled state if softDisabled is true', () => {
        const gridData = createGridData();
        gridData[1].cells[1].disabled = true;
        setupGrid({
          enableSelection: true,
          selectionMode: 'explicit',
          softDisabled: true,
          gridData,
        });
        gridInstance._pattern.setDefaultStateEffect();
        fixture.detectChanges();

        const disabledCell = gridElement.querySelector('#c1-1') as HTMLElement;
        expect(disabledCell.getAttribute('aria-disabled')).toBe('true');

        // Can still interact visually, e.g. focus
        disabledCell.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
        fixture.detectChanges();

        expect(getActiveCellId()).toBe('c1-1');

        // But space should not select it? Wait, interaction is allowed, but actions might be blocked.
        space();
        expect(disabledCell.getAttribute('aria-selected')).toBe('false');
      });

      it('should skip disabled cells if softDisabled is false', () => {
        const gridData = createGridData();
        gridData[1].cells[1].disabled = true;
        setupGrid({
          softDisabled: false,
          gridData,
        });
        gridInstance._pattern.setDefaultStateEffect();
        fixture.detectChanges();

        const startCell = gridElement.querySelector('#c1-0') as HTMLElement;
        startCell.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
        fixture.detectChanges();

        // Navigating right from c1-0 should skip c1-1 and go to c1-2
        right();
        expect(getActiveCellId()).toBe('c1-2');
      });
    });
  });

  describe('GridRow', () => {
    describe('ARIA attributes and roles', () => {
      it('should set role="row" on the host element', () => {
        setupGrid();
        const row = gridElement.querySelector('tr') as HTMLElement;
        expect(row.getAttribute('role')).toBe('row');
      });

      it('should set aria-rowindex based on the rowIndex input', () => {
        const gridData = createGridData();
        gridData[0].rowIndex = 5;
        setupGrid({gridData});
        const row = gridElement.querySelector('tr') as HTMLElement;
        expect(row.getAttribute('aria-rowindex')).toBe('5');
      });
    });
  });

  describe('GridCell', () => {
    describe('ARIA attributes and roles', () => {
      it('should set the role based on the role input', () => {
        const gridData = createGridData();
        gridData[1].cells[1].role = 'columnheader';
        setupGrid({gridData});
        const cell = gridElement.querySelector('#c1-1') as HTMLElement;
        expect(cell.getAttribute('role')).toBe('columnheader');
      });

      it('should set aria-rowindex to the provided row index', () => {
        const gridData = createGridData();
        gridData[1].cells[1].rowIndex = 4;
        setupGrid({gridData});
        const cell = gridElement.querySelector('#c1-1') as HTMLElement;
        expect(cell.getAttribute('aria-rowindex')).toBe('4');
      });

      it('should set aria-colindex to the provided column index', () => {
        const gridData = createGridData();
        gridData[1].cells[1].colIndex = 3;
        setupGrid({gridData});
        const cell = gridElement.querySelector('#c1-1') as HTMLElement;
        expect(cell.getAttribute('aria-colindex')).toBe('3');
      });

      it('should set aria-selected="true" when the cell is selected', () => {
        setupGrid({enableSelection: true, selectionMode: 'explicit'});
        gridInstance._pattern.setDefaultStateEffect();
        fixture.detectChanges();

        const cell = gridElement.querySelector('#c1-1') as HTMLElement;
        expect(cell.getAttribute('aria-selected')).toBe('false');

        pointerDown(cell);

        expect(cell.getAttribute('aria-selected')).toBe('true');
      });

      it('should set aria-selected="false" when the cell is unselected', () => {
        setupGrid({enableSelection: true, selectionMode: 'explicit'});
        gridInstance._pattern.setDefaultStateEffect();
        fixture.detectChanges();

        const cell = gridElement.querySelector('#c1-1') as HTMLElement;
        pointerDown(cell);
        expect(cell.getAttribute('aria-selected')).toBe('true');

        pointerDown(cell);
        expect(cell.getAttribute('aria-selected')).toBe('false');
      });

      it('should set aria-rowspan to the provided rowspan configuration', () => {
        const gridData = createGridData();
        gridData[1].cells[1].rowSpan = 2;
        setupGrid({gridData});
        const cell = gridElement.querySelector('#c1-1') as HTMLElement;
        expect(cell.getAttribute('rowspan')).toBe('2');
        expect(cell.getAttribute('aria-rowspan')).toBe('2');
      });

      it('should set aria-colspan to the provided colspan configuration', () => {
        const gridData = createGridData();
        gridData[1].cells[1].colSpan = 3;
        setupGrid({gridData});
        const cell = gridElement.querySelector('#c1-1') as HTMLElement;
        expect(cell.getAttribute('colspan')).toBe('3');
        expect(cell.getAttribute('aria-colspan')).toBe('3');
      });

      it('should set id from the id input if provided', () => {
        const gridData = createGridData();
        gridData[1].cells[1].id = 'custom-id';
        setupGrid({gridData});
        const cell = gridElement.querySelector('#custom-id') as HTMLElement;
        expect(cell.getAttribute('id')).toBe('custom-id');
      });
    });

    describe('focus management', () => {
      it('should set tabindex="0" on the active cell', () => {
        setupGrid({focusMode: 'roving'});
        gridInstance._pattern.setDefaultStateEffect();
        fixture.detectChanges();

        const cell = gridElement.querySelector('#c0-0') as HTMLElement;
        expect(cell.getAttribute('tabindex')).toBe('0');
      });

      it('should set tabindex="-1" on inactive cells', () => {
        setupGrid({focusMode: 'roving'});
        gridInstance._pattern.setDefaultStateEffect();
        fixture.detectChanges();

        const cell = gridElement.querySelector('#c1-1') as HTMLElement;
        expect(cell.getAttribute('tabindex')).toBe('-1');
      });

      it('should set data-active="true" when the cell becomes active', () => {
        setupGrid();
        gridInstance._pattern.setDefaultStateEffect();
        fixture.detectChanges();

        const cell = gridElement.querySelector('#c0-0') as HTMLElement;
        expect(cell.getAttribute('data-active')).toBe('true');
      });
    });

    describe('configuration', () => {
      it('should prevent selection when disabled input is true', () => {
        const gridData = createGridData();
        gridData[1].cells[1].disabled = true;
        setupGrid({enableSelection: true, selectionMode: 'explicit', gridData});
        gridInstance._pattern.setDefaultStateEffect();
        fixture.detectChanges();

        const cell = gridElement.querySelector('#c1-1') as HTMLElement;
        pointerDown(cell);

        expect(cell.getAttribute('aria-selected')).toBe('false');
      });

      it('should prevent interaction when disabled input is true', () => {
        const gridData = createGridData();
        gridData[1].cells[1].disabled = true;
        setupGrid({
          enableSelection: true,
          selectionMode: 'explicit',
          softDisabled: false,
          gridData,
        });
        gridInstance._pattern.setDefaultStateEffect();
        fixture.detectChanges();

        const startCell = gridElement.querySelector('#c1-0') as HTMLElement;
        startCell.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
        fixture.detectChanges();

        // Navigating right from c1-0 should skip c1-1 and go to c1-2 because it's completely disabled
        right();
        expect(getActiveCellId()).toBe('c1-2');
      });

      it('should prevent selection when selectable input is false', () => {
        const gridData = createGridData();
        gridData[1].cells[1].selectable = false;
        setupGrid({enableSelection: true, selectionMode: 'explicit', gridData});
        gridInstance._pattern.setDefaultStateEffect();
        fixture.detectChanges();

        const cell = gridElement.querySelector('#c1-1') as HTMLElement;
        pointerDown(cell);

        expect(cell.hasAttribute('aria-selected')).toBeFalse();
      });

      it('should update the selected property when bound value changes', () => {
        // Needs a two-way binding test, but we can just test selection updates since it is model()
        setupGrid({enableSelection: true, selectionMode: 'explicit'});
        gridInstance._pattern.setDefaultStateEffect();
        fixture.detectChanges();

        const cellDirective = fixture.debugElement.query(By.css('#c1-1')).injector.get(GridCell);
        expect(cellDirective.selected()).toBeFalse();

        const cell = gridElement.querySelector('#c1-1') as HTMLElement;
        pointerDown(cell);

        expect(cellDirective.selected()).toBeTrue();
      });
    });
  });

  describe('GridCellWidget', () => {
    describe('ARIA and Host attributes', () => {
      it('should set data-active="true" when the widget is active', () => {
        const gridData = createGridData();
        gridData[1].cells[1].widgets = [{id: 'w1', type: 'simple'}];
        setupGrid({gridData});
        gridInstance._pattern.setDefaultStateEffect();
        fixture.detectChanges();

        const cell = gridElement.querySelector('#c1-1') as HTMLElement;
        const widget = gridElement.querySelector('#w1') as HTMLElement;

        expect(widget.getAttribute('data-active')).toBe('false');
        pointerDown(cell);
        expect(widget.getAttribute('data-active')).toBe('true');
      });

      it('should set data-active-control="widget" when the widget is activated', () => {
        const gridData = createGridData();
        gridData[1].cells[1].widgets = [{id: 'w1', type: 'editable'}];
        setupGrid({gridData});
        gridInstance._pattern.setDefaultStateEffect();
        fixture.detectChanges();

        const cell = gridElement.querySelector('#c1-1') as HTMLElement;
        const widget = gridElement.querySelector('#w1') as HTMLElement;

        pointerDown(cell);
        expect(widget.getAttribute('data-active-control')).toBe('cell');

        keydown('Enter');
        expect(widget.getAttribute('data-active-control')).toBe('widget');
      });

      it('should set tabindex="0" on the active widget', () => {
        const gridData = createGridData();
        gridData[1].cells[1].widgets = [{id: 'w1', type: 'simple'}];
        setupGrid({gridData});
        gridInstance._pattern.setDefaultStateEffect();
        fixture.detectChanges();

        const cell = gridElement.querySelector('#c1-1') as HTMLElement;
        const widget = gridElement.querySelector('#w1') as HTMLElement;

        pointerDown(cell);
        expect(widget.getAttribute('tabindex')).toBe('0');
      });

      it('should set tabindex="-1" on inactive widgets', () => {
        const gridData = createGridData();
        gridData[1].cells[1].widgets = [{id: 'w1', type: 'simple'}];
        gridData[1].cells[2].widgets = [{id: 'w2', type: 'simple'}];
        setupGrid({gridData});
        gridInstance._pattern.setDefaultStateEffect();
        fixture.detectChanges();

        const widget1 = gridElement.querySelector('#w1') as HTMLElement;
        const widget2 = gridElement.querySelector('#w2') as HTMLElement;

        const cell = gridElement.querySelector('#c1-1') as HTMLElement;
        pointerDown(cell);

        expect(widget1.getAttribute('tabindex')).toBe('0');
        expect(widget2.getAttribute('tabindex')).toBe('-1');
      });
    });

    describe('widget activation', () => {
      it('should immediately delegate focus when widgetType is simple', () => {
        const gridData = createGridData();
        gridData[0].cells[0].widgets = [{id: 'w1', type: 'simple'}];
        setupGrid({gridData});
        gridInstance._pattern.setDefaultStateEffect();
        fixture.detectChanges();

        const widget = gridElement.querySelector('#w1') as HTMLElement;

        tabIntoGrid();

        expect(document.activeElement).toBe(widget);
      });

      it('should wait for enter key to delegate focus when widgetType is complex', () => {
        const gridData = createGridData();
        gridData[0].cells[0].widgets = [{id: 'w1', type: 'complex'}];
        setupGrid({gridData});
        gridInstance._pattern.setDefaultStateEffect();
        fixture.detectChanges();

        const widgetDirective = fixture.debugElement
          .query(By.css('#w1'))
          .injector.get(GridCellWidget);

        tabIntoGrid();

        expect(widgetDirective.isActivated()).toBeFalse();

        keydown('Enter');
        expect(widgetDirective.isActivated()).toBeTrue();
      });

      it('should enter edit mode when widgetType is editable and enter is pressed', () => {
        const gridData = createGridData();
        gridData[0].cells[0].widgets = [{id: 'w1', type: 'editable'}];
        setupGrid({gridData});
        gridInstance._pattern.setDefaultStateEffect();
        fixture.detectChanges();

        const widgetDirective = fixture.debugElement
          .query(By.css('#w1'))
          .injector.get(GridCellWidget);

        tabIntoGrid();

        keydown('Enter');
        expect(widgetDirective.isActivated()).toBeTrue();
      });

      it('should give widget tabindex -1 when focusTarget is present', () => {
        const gridData = createGridData();
        gridData[0].cells[0].widgets = [{id: 'w1', type: 'complex', hasTarget: true}];
        setupGrid({gridData});
        gridInstance._pattern.setDefaultStateEffect();
        fixture.detectChanges();

        const widgetElement = gridElement.querySelector('#w1') as HTMLElement;
        expect(widgetElement.getAttribute('tabindex')).toBe('-1');
      });

      it('should emit the activated output when the widget becomes active', () => {
        const gridData = createGridData();
        gridData[0].cells[0].widgets = [{id: 'w1', type: 'complex'}];
        setupGrid({gridData});
        gridInstance._pattern.setDefaultStateEffect();
        fixture.detectChanges();

        tabIntoGrid();

        expect(fixture.componentInstance.onActivated).not.toHaveBeenCalled();

        keydown('Enter');
        expect(fixture.componentInstance.onActivated).toHaveBeenCalled();
      });

      it('should emit the deactivated output when the widget loses active state', () => {
        const gridData = createGridData();
        gridData[0].cells[0].widgets = [{id: 'w1', type: 'complex'}];
        setupGrid({gridData});
        gridInstance._pattern.setDefaultStateEffect();
        fixture.detectChanges();

        tabIntoGrid();

        keydown('Enter');
        expect(fixture.componentInstance.onDeactivated).not.toHaveBeenCalled();

        keydown('Escape');
        expect(fixture.componentInstance.onDeactivated).toHaveBeenCalled();
      });

      it('should become active when activate() is called programmatically', () => {
        const gridData = createGridData();
        gridData[0].cells[0].widgets = [{id: 'w1', type: 'complex'}];
        setupGrid({gridData});
        gridInstance._pattern.setDefaultStateEffect();
        fixture.detectChanges();

        const widgetDirective = fixture.debugElement
          .query(By.css('#w1'))
          .injector.get(GridCellWidget);

        widgetDirective.activate();
        fixture.detectChanges();

        expect(widgetDirective.isActivated()).toBeTrue();
      });

      it('should lose active state when deactivate() is called programmatically', () => {
        const gridData = createGridData();
        gridData[0].cells[0].widgets = [{id: 'w1', type: 'complex'}];
        setupGrid({gridData});
        gridInstance._pattern.setDefaultStateEffect();
        fixture.detectChanges();

        const widgetDirective = fixture.debugElement
          .query(By.css('#w1'))
          .injector.get(GridCellWidget);

        widgetDirective.activate();
        fixture.detectChanges();

        expect(widgetDirective.isActivated()).toBeTrue();

        widgetDirective.deactivate();
        fixture.detectChanges();

        expect(widgetDirective.isActivated()).toBeFalse();
      });
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
      [enableRangeSelection]="enableRangeSelection()">
      @for (row of gridData(); track $index; let rIndex = $index) {
        <tr ngGridRow [rowIndex]="row.rowIndex">
          @for (cell of row.cells; track $index; let cIndex = $index) {
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
  readonly enableRangeSelection = signal(false);
  readonly gridData = signal<RowConfig[]>(createGridData());

  onActivated = jasmine.createSpy('activated');
  onDeactivated = jasmine.createSpy('deactivated');
}
