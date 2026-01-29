/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {_IdGenerator} from '@angular/cdk/a11y';
import {
  booleanAttribute,
  computed,
  contentChildren,
  Directive,
  ElementRef,
  inject,
  input,
  model,
  Signal,
} from '@angular/core';
import {Directionality} from '@angular/cdk/bidi';
import {GridCellPattern} from '../private';
import {GridCellWidget} from './grid-cell-widget';
import {GRID_CELL, GRID_ROW} from './grid-tokens';

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
 *
 * @see [Grid](guide/aria/grid)
 */
@Directive({
  selector: '[ngGridCell]',
  exportAs: 'ngGridCell',
  host: {
    '[attr.role]': 'role()',
    '[attr.id]': '_pattern.id()',
    '[attr.rowspan]': '_pattern.rowSpan()',
    '[attr.colspan]': '_pattern.colSpan()',
    '[attr.data-active]': 'active()',
    '[attr.data-anchor]': '_pattern.anchor()',
    '[aria-disabled]': '_pattern.disabled()',
    '[aria-rowspan]': '_pattern.rowSpan()',
    '[aria-colspan]': '_pattern.colSpan()',
    '[aria-rowindex]': '_pattern.ariaRowIndex()',
    '[aria-colindex]': '_pattern.ariaColIndex()',
    '[aria-selected]': '_pattern.ariaSelected()',
    '[tabindex]': '_tabIndex()',
  },
  providers: [{provide: GRID_CELL, useExisting: GridCell}],
})
export class GridCell {
  /** A reference to the host element. */
  private readonly _elementRef = inject(ElementRef);

  /** A reference to the host element. */
  readonly element = this._elementRef.nativeElement as HTMLElement;

  /** Whether the cell is currently active (focused). */
  readonly active = computed(() => this._pattern.active());

  /** The widgets contained within this cell, if any. */
  private readonly _widgets = contentChildren(GridCellWidget, {descendants: true});

  /** The UI pattern for the widget in this cell. */
  private readonly _widgetPatterns: Signal<any[]> = computed(() =>
    this._widgets().map(w => w._pattern),
  );

  /** The parent row. */
  private readonly _row = inject(GRID_ROW);

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
    grid: this._row._gridPattern,
    row: () => this._row._pattern,
    widgets: this._widgetPatterns,
    getWidget: e => this._getWidget(e),
    element: () => this.element,
  });

  constructor() {}

  /** Gets the cell widget pattern for a given element. */
  private _getWidget(element: Element | null | undefined): any | undefined {
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
