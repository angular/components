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
  contentChildren,
  Directive,
  ElementRef,
  inject,
  input,
  output,
  model,
  Signal,
} from '@angular/core';
import {Directionality} from '@angular/cdk/bidi';
import {GridPattern, GridRowPattern, GridCellPattern, GridCellWidgetPattern} from '../private';

/**
 * The container for a grid. It provides keyboard navigation and focus management for the grid's
 * rows and cells. It manages the overall behavior of the grid, including focus
 * wrapping, selection, and disabled states.
 *
 * ```html
 * <table ngGrid [multi]="true" [enableSelection]="true">
 *   @for (row of gridData; track row) {
 *     <tr ngGridRow>
 *       @for (cell of row; track cell) {
 *         <td ngGridCell [disabled]="cell.disabled">
 *           {{cell.value}}
 *         </td>
 *       }
 *     </tr>
 *   }
 * </table>
 * ```
 *
 * @developerPreview 21.0
 */
@Directive({
  selector: '[ngGrid]',
  exportAs: 'ngGrid',
  host: {
    'class': 'grid',
    'role': 'grid',
    '[tabindex]': '_pattern.tabIndex()',
    '[attr.aria-disabled]': '_pattern.disabled()',
    '[attr.aria-activedescendant]': '_pattern.activeDescendant()',
    '(keydown)': '_pattern.onKeydown($event)',
    '(pointerdown)': '_pattern.onPointerdown($event)',
    '(pointermove)': '_pattern.onPointermove($event)',
    '(pointerup)': '_pattern.onPointerup($event)',
    '(focusin)': '_pattern.onFocusIn($event)',
    '(focusout)': '_pattern.onFocusOut($event)',
  },
})
export class Grid {
  /** A reference to the host element. */
  private readonly _elementRef = inject(ElementRef);

  /** A reference to the host element. */
  readonly element = this._elementRef.nativeElement as HTMLElement;

  /** The rows that make up the grid. */
  private readonly _rows = contentChildren(GridRow, {descendants: true});

  /** The UI patterns for the rows in the grid. */
  private readonly _rowPatterns: Signal<GridRowPattern[]> = computed(() =>
    this._rows().map(r => r._pattern),
  );

  /** Text direction. */
  readonly textDirection = inject(Directionality).valueSignal;

  /** Whether selection is enabled for the grid. */
  readonly enableSelection = input(false, {transform: booleanAttribute});

  /** Whether the grid is disabled. */
  readonly disabled = input(false, {transform: booleanAttribute});

  /**
   * Whether to allow disabled items to receive focus. When `true`, disabled items are
   * focusable but not interactive. When `false`, disabled items are skipped during navigation.
   */
  readonly softDisabled = input(true, {transform: booleanAttribute});

  /**
   * The focus strategy used by the grid.
   * - `roving`: Focus is moved to the active cell using `tabindex`.
   * - `activedescendant`: Focus remains on the grid container, and `aria-activedescendant` is used to indicate the active cell.
   */
  readonly focusMode = input<'roving' | 'activedescendant'>('roving');

  /**
   * The wrapping behavior for keyboard navigation along the row axis.
   * - `continuous`: Navigation wraps from the last row to the first, and vice-versa.
   * - `loop`: Navigation wraps within the current row.
   * - `nowrap`: Navigation stops at the first/last item in the row.
   */
  readonly rowWrap = input<'continuous' | 'loop' | 'nowrap'>('loop');

  /**
   * The wrapping behavior for keyboard navigation along the column axis.
   * - `continuous`: Navigation wraps from the last column to the first, and vice-versa.
   * - `loop`: Navigation wraps within the current column.
   * - `nowrap`: Navigation stops at the first/last item in the column.
   */
  readonly colWrap = input<'continuous' | 'loop' | 'nowrap'>('loop');

  /** Whether multiple cells in the grid can be selected. */
  readonly multi = input(false, {transform: booleanAttribute});

  /**
   * The selection strategy used by the grid.
   * - `follow`: The focused cell is automatically selected.
   * - `explicit`: Cells are selected explicitly by the user (e.g., via click or spacebar).
   */
  readonly selectionMode = input<'follow' | 'explicit'>('follow');

  /** Whether enable range selections (with modifier keys or dragging). */
  readonly enableRangeSelection = input(false, {transform: booleanAttribute});

  /** The UI pattern for the grid. */
  readonly _pattern = new GridPattern({
    ...this,
    rows: this._rowPatterns,
    getCell: e => this._getCell(e),
    element: () => this.element,
  });

  constructor() {
    afterRenderEffect(() => this._pattern.setDefaultStateEffect());
    afterRenderEffect(() => this._pattern.resetStateEffect());
    afterRenderEffect(() => this._pattern.resetFocusEffect());
    afterRenderEffect(() => this._pattern.restoreFocusEffect());
    afterRenderEffect(() => this._pattern.focusEffect());
  }

  /** Gets the cell pattern for a given element. */
  private _getCell(element: Element | null | undefined): GridCellPattern | undefined {
    let target = element;

    while (target) {
      for (const row of this._rowPatterns()) {
        for (const cell of row.inputs.cells()) {
          if (cell.element() === target) {
            return cell;
          }
        }
      }

      target = target.parentElement?.closest('[ngGridCell]');
    }

    return undefined;
  }
}

/**
 * Represents a row within a grid. It is a container for `ngGridCell` directives.
 *
 * ```html
 * <tr ngGridRow>
 *   <!-- ... cells ... -->
 * </tr>
 * ```
 *
 * @developerPreview 21.0
 */
@Directive({
  selector: '[ngGridRow]',
  exportAs: 'ngGridRow',
  host: {
    'class': 'grid-row',
    'role': 'row',
    '[attr.aria-rowindex]': '_pattern.rowIndex()',
  },
})
export class GridRow {
  /** A reference to the host element. */
  private readonly _elementRef = inject(ElementRef);

  /** A reference to the host element. */
  readonly element = this._elementRef.nativeElement as HTMLElement;

  /** The cells that make up this row. */
  private readonly _cells = contentChildren(GridCell, {descendants: true});

  /** The UI patterns for the cells in this row. */
  private readonly _cellPatterns: Signal<GridCellPattern[]> = computed(() =>
    this._cells().map(c => c._pattern),
  );

  /** The parent grid. */
  private readonly _grid = inject(Grid);

  /** The parent grid UI pattern. */
  readonly grid = computed(() => this._grid._pattern);

  /** The index of this row within the grid. */
  readonly rowIndex = input<number>();

  /** The UI pattern for the grid row. */
  readonly _pattern = new GridRowPattern({
    ...this,
    cells: this._cellPatterns,
  });
}

/**
 * Represents a cell within a grid row. It is the primary focusable element
 * within the grid. It can be disabled and can have its selection state managed
 * through the `selected` input.
 *
 * ```html
 * <td ngGridCell [disabled]="isDisabled" [(selected)]="isSelected">
 *   Cell Content
 * </td>
 * ```
 *
 * @developerPreview 21.0
 */
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
    '[attr.data-anchor]': '_pattern.anchor()',
    '[attr.aria-disabled]': '_pattern.disabled()',
    '[attr.aria-rowspan]': '_pattern.rowSpan()',
    '[attr.aria-colspan]': '_pattern.colSpan()',
    '[attr.aria-rowindex]': '_pattern.ariaRowIndex()',
    '[attr.aria-colindex]': '_pattern.ariaColIndex()',
    '[attr.aria-selected]': '_pattern.ariaSelected()',
    '[tabindex]': '_tabIndex()',
  },
})
export class GridCell {
  /** A reference to the host element. */
  private readonly _elementRef = inject(ElementRef);

  /** A reference to the host element. */
  readonly element = this._elementRef.nativeElement as HTMLElement;

  /** The widgets contained within this cell, if any. */
  private readonly _widgets = contentChildren(GridCellWidget, {descendants: true});

  /** The UI pattern for the widget in this cell. */
  private readonly _widgetPatterns: Signal<GridCellWidgetPattern[]> = computed(() =>
    this._widgets().map(w => w._pattern),
  );

  /** The parent row. */
  private readonly _row = inject(GridRow);

  /** Text direction. */
  readonly textDirection = inject(Directionality).valueSignal;

  /** A unique identifier for the cell. */
  readonly id = input(inject(_IdGenerator).getId('ng-grid-cell-', true));

  /** The ARIA role for the cell. */
  readonly role = input<'gridcell' | 'columnheader' | 'rowheader'>('gridcell');

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

  /** Orientation of the widgets in the cell. */
  readonly orientation = input<'vertical' | 'horizontal'>('horizontal');

  /** Whether widgets navigation wraps. */
  readonly wrap = input(true, {transform: booleanAttribute});

  /** The tabindex override. */
  readonly tabindex = input<number | undefined>();

  /**
   * The tabindex value set to the element.
   * If a focus target exists then return -1. Unless an override.
   */
  protected readonly _tabIndex: Signal<number> = computed(
    () => this.tabindex() ?? this._pattern.tabIndex(),
  );

  /** The UI pattern for the grid cell. */
  readonly _pattern = new GridCellPattern({
    ...this,
    grid: this._row.grid,
    row: () => this._row._pattern,
    widgets: this._widgetPatterns,
    getWidget: e => this._getWidget(e),
    element: () => this.element,
  });

  constructor() {}

  /** Gets the cell widget pattern for a given element. */
  private _getWidget(element: Element | null | undefined): GridCellWidgetPattern | undefined {
    let target = element;

    while (target) {
      const pattern = this._widgetPatterns().find(w => w.element() === target);
      if (pattern) {
        return pattern;
      }

      target = target.parentElement?.closest('[ngGridCellWidget]');
    }

    return undefined;
  }
}

/**
 * Represents an interactive element inside a `GridCell`. It allows for pausing grid navigation to
 * interact with the widget.
 *
 * When the user interacts with the widget (e.g., by typing in an input or opening a menu), grid
 * navigation is temporarily suspended to allow the widget to handle keyboard
 * events.
 *
 * ```html
 * <td ngGridCell>
 *   <button ngGridCellWidget>Click Me</button>
 * </td>
 * ```
 *
 * @developerPreview 21.0
 */
@Directive({
  selector: '[ngGridCellWidget]',
  exportAs: 'ngGridCellWidget',
  host: {
    'class': 'grid-cell-widget',
    '[attr.data-active]': '_pattern.active()',
    '[attr.data-active-control]': 'isActivated() ? "widget" : "cell"',
    '[tabindex]': '_tabIndex()',
  },
})
export class GridCellWidget {
  /** A reference to the host element. */
  private readonly _elementRef = inject(ElementRef);

  /** A reference to the host element. */
  readonly element = this._elementRef.nativeElement as HTMLElement;

  /** The parent cell. */
  private readonly _cell = inject(GridCell);

  /** A unique identifier for the widget. */
  readonly id = input(inject(_IdGenerator).getId('ng-grid-cell-widget-', true));

  /** The type of widget, which determines how it is activated. */
  readonly widgetType = input<'simple' | 'complex' | 'editable'>('simple');

  /** Whether the widget is disabled. */
  readonly disabled = input(false, {transform: booleanAttribute});

  /** The target that will receive focus instead of the widget. */
  readonly focusTarget = input<ElementRef | HTMLElement | undefined>();

  /** Emits when the widget is activated. */
  readonly onActivate = output<KeyboardEvent | FocusEvent | undefined>();

  /** Emits when the widget is deactivated. */
  readonly onDeactivate = output<KeyboardEvent | FocusEvent | undefined>();

  /** The tabindex override. */
  readonly tabindex = input<number | undefined>();

  /**
   * The tabindex value set to the element.
   * If a focus target exists then return -1. Unless an override.
   */
  protected readonly _tabIndex: Signal<number> = computed(
    () => this.tabindex() ?? (this.focusTarget() ? -1 : this._pattern.tabIndex()),
  );

  /** The UI pattern for the grid cell widget. */
  readonly _pattern = new GridCellWidgetPattern({
    ...this,
    element: () => this.element,
    cell: () => this._cell._pattern,
    focusTarget: computed(() => {
      if (this.focusTarget() instanceof ElementRef) {
        return (this.focusTarget() as ElementRef).nativeElement;
      }
      return this.focusTarget();
    }),
  });

  /** Whether the widget is activated. */
  get isActivated(): Signal<boolean> {
    return this._pattern.isActivated.asReadonly();
  }

  constructor() {
    afterRenderEffect(() => {
      const activateEvent = this._pattern.lastActivateEvent();
      if (activateEvent) {
        this.onActivate.emit(activateEvent);
      }
    });

    afterRenderEffect(() => {
      const deactivateEvent = this._pattern.lastDeactivateEvent();
      if (deactivateEvent) {
        this.onDeactivate.emit(deactivateEvent);
      }
    });
  }

  /** Activates the widget. */
  activate(): void {
    this._pattern.activate();
  }

  /** Deactivates the widget. */
  deactivate(): void {
    this._pattern.deactivate();
  }
}
