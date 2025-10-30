/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {_IdGenerator} from '@angular/cdk/a11y';
import {
  afterRenderEffect,
  booleanAttribute,
  computed,
  contentChild,
  contentChildren,
  Directive,
  ElementRef,
  inject,
  input,
  model,
  Signal,
} from '@angular/core';
import {Directionality} from '@angular/cdk/bidi';
import {GridPattern, GridRowPattern, GridCellPattern, GridCellWidgetPattern} from '../private';

/** A directive that provides grid-based navigation and selection behavior. */
@Directive({
  selector: '[ngGrid]',
  exportAs: 'ngGrid',
  host: {
    'class': 'grid',
    'role': 'grid',
    '[tabindex]': 'tabindex()',
    '[attr.aria-disabled]': '_pattern.disabled()',
    '[attr.aria-activedescendant]': 'activeDescendant()',
    '(keydown)': '_pattern.onKeydown($event)',
    '(pointerdown)': '_pattern.onPointerdown($event)',
    '(pointermove)': '_pattern.onPointermove($event)',
    '(pointerup)': '_pattern.onPointerup($event)',
    '(focusin)': '_pattern.onFocusIn()',
    '(focusout)': '_pattern.onFocusOut($event)',
  },
})
export class Grid {
  /** A reference to the host element. */
  private readonly _elementRef = inject(ElementRef);

  /** The rows that make up the grid. */
  private readonly _rows = contentChildren(GridRow);

  /** The UI patterns for the rows in the grid. */
  private readonly _rowPatterns: Signal<GridRowPattern[]> = computed(() =>
    this._rows().map(r => r._pattern),
  );

  /** Text direction. */
  readonly textDirection = inject(Directionality).valueSignal;

  /** The host native element. */
  readonly element = computed(() => this._elementRef.nativeElement);

  /** Whether selection is enabled for the grid. */
  readonly enableSelection = input(false, {transform: booleanAttribute});

  /** Whether the grid is disabled. */
  readonly disabled = input(false, {transform: booleanAttribute});

  /** Whether to allow disabled items to receive focus. */
  readonly softDisabled = input(false, {transform: booleanAttribute});

  /** The focus strategy used by the grid. */
  readonly focusMode = input<'roving' | 'activedescendant'>('roving');

  /** The wrapping behavior for keyboard navigation along the row axis. */
  readonly rowWrap = input<'continuous' | 'loop' | 'nowrap'>('loop');

  /** The wrapping behavior for keyboard navigation along the column axis. */
  readonly colWrap = input<'continuous' | 'loop' | 'nowrap'>('loop');

  /** The currently active cell. */
  readonly activeCell = computed(() => this._pattern.activeCell());

  /** The ID of the currently active descendant cell. */
  readonly activeDescendant = computed(() => this._pattern.activeDescendant());

  /** Whether the user is currently dragging to select a range of cells. */
  readonly dragging = computed(() => this._pattern.dragging());

  /** Whether the focus is in the grid. */
  readonly isFocused = computed(() => this._pattern.isFocused());

  /** Whether to pause grid navigation. */
  readonly pauseNavigation = computed(() => this._pattern.pauseNavigation());

  /** The tab index for the grid. */
  readonly tabindex = computed(() => this._pattern.tabIndex());

  /** The UI pattern for the grid. */
  readonly _pattern = new GridPattern({
    ...this,
    rows: this._rowPatterns,
    getCell: e => this._getCell(e),
  });

  constructor() {
    afterRenderEffect(() => this._pattern.resetStateEffect());
    afterRenderEffect(() => this._pattern.focusEffect());
  }

  /** Navigates to the cell above the currently active cell. */
  up(): boolean {
    return this._pattern.gridBehavior.up();
  }

  /** Navigates to the cell below the currently active cell. */
  down(): boolean {
    return this._pattern.gridBehavior.down();
  }

  /** Navigates to the cell to the left of the currently active cell. */
  left(): boolean {
    return this._pattern.gridBehavior.left();
  }

  /** Navigates to the cell to the right of the currently active cell. */
  right(): boolean {
    return this._pattern.gridBehavior.right();
  }

  /** Navigates to the first focusable cell in the current row. */
  firstInRow(): boolean {
    return this._pattern.gridBehavior.firstInRow();
  }

  /** Navigates to the last focusable cell in the current row. */
  lastInRow(): boolean {
    return this._pattern.gridBehavior.lastInRow();
  }

  /** Navigates to the first focusable cell in the grid. */
  first(): boolean {
    return this._pattern.gridBehavior.first();
  }

  /** Navigates to the last focusable cell in the grid. */
  last(): boolean {
    return this._pattern.gridBehavior.last();
  }

  /** Extends the selection to the cell above the selection anchor. */
  rangeSelectUp(): void {
    if (this._pattern.inputs.enableSelection()) {
      this._pattern.gridBehavior.rangeSelectUp();
    }
  }

  /** Extends the selection to the cell below the selection anchor. */
  rangeSelectDown(): void {
    if (this._pattern.inputs.enableSelection()) {
      this._pattern.gridBehavior.rangeSelectDown();
    }
  }

  /** Extends the selection to the cell to the left of the selection anchor. */
  rangeSelectLeft(): void {
    if (this._pattern.inputs.enableSelection()) {
      this._pattern.gridBehavior.rangeSelectLeft();
    }
  }

  /** Extends the selection to the cell to the right of the selection anchor. */
  rangeSelectRight(): void {
    if (this._pattern.inputs.enableSelection()) {
      this._pattern.gridBehavior.rangeSelectRight();
    }
  }

  /** Selects all selectable cells in the grid. */
  selectAll(): void {
    this._pattern.gridBehavior.selectAll();
  }

  /** Selects all cells in the current row. */
  selectRow(): void {
    this._pattern.gridBehavior.selectRow();
  }

  /** Selects all cells in the current column. */
  selectCol(): void {
    this._pattern.gridBehavior.selectCol();
  }

  /** Gets the cell pattern for a given element. */
  private _getCell(element: Element): GridCellPattern | undefined {
    const cellElement = element.closest('[ngGridCell]');
    if (cellElement === undefined) return;

    const widgetElement = element.closest('[ngGridCellWidget]');
    for (const row of this._rowPatterns()) {
      for (const cell of row.inputs.cells()) {
        if (
          cell.element() === cellElement ||
          (widgetElement !== undefined && cell.element() === widgetElement)
        ) {
          return cell;
        }
      }
    }
    return;
  }
}

/** A directive that represents a row in a grid. */
@Directive({
  selector: '[ngGridRow]',
  exportAs: 'ngGridRow',
  host: {
    'class': 'grid-row',
    '[attr.role]': 'role()',
  },
})
export class GridRow {
  /** A reference to the host element. */
  private readonly _elementRef = inject(ElementRef);

  /** The cells that make up this row. */
  private readonly _cells = contentChildren(GridCell);

  /** The UI patterns for the cells in this row. */
  private readonly _cellPatterns: Signal<GridCellPattern[]> = computed(() =>
    this._cells().map(c => c._pattern),
  );

  /** The parent grid. */
  private readonly _grid = inject(Grid);

  /** The parent grid UI pattern. */
  readonly grid = computed(() => this._grid._pattern);

  /** The host native element. */
  readonly element = computed(() => this._elementRef.nativeElement);

  /** The ARIA role for the row. */
  readonly role = input<'row' | 'rowheader'>('row');

  /** The index of this row within the grid. */
  readonly rowIndex = input<number>();

  /** The UI pattern for the grid row. */
  readonly _pattern = new GridRowPattern({
    ...this,
    cells: this._cellPatterns,
  });
}

/** A directive that represents a cell in a grid. */
@Directive({
  selector: '[ngGridCell]',
  exportAs: 'ngGridCell',
  host: {
    'class': 'grid-cell',
    '[attr.role]': 'role()',
    '[attr.id]': '_pattern.id()',
    '[attr.rowspan]': '_pattern.rowSpan()',
    '[attr.colspan]': '_pattern.colSpan()',
    '[attr.data-active]': '_pattern.active()',
    '[attr.aria-disabled]': '_pattern.disabled()',
    '[attr.aria-rowspan]': '_pattern.rowSpan()',
    '[attr.aria-colspan]': '_pattern.colSpan()',
    '[attr.aria-rowindex]': '_pattern.ariaRowIndex()',
    '[attr.aria-colindex]': '_pattern.ariaColIndex()',
    '[attr.aria-selected]': '_pattern.ariaSelected()',
    '[tabindex]': '_pattern.tabIndex()',
  },
})
export class GridCell {
  /** A reference to the host element. */
  private readonly _elementRef = inject(ElementRef);

  /** The widget contained within this cell, if any. */
  private readonly _widgets = contentChild(GridCellWidget);

  /** The UI pattern for the widget in this cell. */
  private readonly _widgetPattern: Signal<GridCellWidgetPattern | undefined> = computed(
    () => this._widgets()?._pattern,
  );

  /** The parent row. */
  private readonly _row = inject(GridRow);

  /** A unique identifier for the cell. */
  private readonly _id = inject(_IdGenerator).getId('ng-grid-cell-', true);

  /** The host native element. */
  readonly element = computed(() => this._elementRef.nativeElement);

  /** The ARIA role for the cell. */
  readonly role = input<'gridcell' | 'columnheader'>('gridcell');

  /** The number of rows the cell should span. */
  readonly rowSpan = input<number>(1);

  /** The number of columns the cell should span. */
  readonly colSpan = input<number>(1);

  /** The index of this cell's row within the grid. */
  readonly rowIndex = input<number>();

  /** The index of this cell's column within the grid. */
  readonly colIndex = input<number>();

  /** Whether the cell is disabled. */
  readonly disabled = input(false, {transform: booleanAttribute});

  /** Whether the cell is selected. */
  readonly selected = model<boolean>(false);

  /** Whether the cell is selectable. */
  readonly selectable = input<boolean>(true);

  /** The UI pattern for the grid cell. */
  readonly _pattern = new GridCellPattern({
    ...this,
    id: () => this._id,
    grid: this._row.grid,
    row: () => this._row._pattern,
    widget: this._widgetPattern,
  });
}

/** A directive that represents a widget inside a grid cell. */
@Directive({
  selector: '[ngGridCellWidget]',
  exportAs: 'ngGridCellWidget',
  host: {
    'class': 'grid-cell-widget',
    '[attr.data-active]': '_pattern.active()',
    '[tabindex]': '_pattern.tabIndex()',
  },
})
export class GridCellWidget {
  /** A reference to the host element. */
  private readonly _elementRef = inject(ElementRef);

  /** The parent cell. */
  private readonly _cell = inject(GridCell);

  /** The host native element. */
  readonly element = computed(() => this._elementRef.nativeElement);

  /** Whether the widget is activated and the grid navigation should be paused. */
  readonly activate = model<boolean>(false);

  /** The UI pattern for the grid cell widget. */
  readonly _pattern = new GridCellWidgetPattern({
    ...this,
    cell: () => this._cell._pattern,
  });

  /** Focuses the widget. */
  focus(): void {
    this.element().focus();
  }
}
