/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  afterRenderEffect,
  booleanAttribute,
  computed,
  contentChildren,
  Directive,
  ElementRef,
  inject,
  input,
  NgZone,
  Signal,
} from '@angular/core';
import {Directionality} from '@angular/cdk/bidi';
import {GridPattern, GridCellPattern} from '../private';
import {GRID_ROW} from './grid-tokens';

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
 *
 * @see [Grid](guide/aria/grid)
 */
@Directive({
  selector: '[ngGrid]',
  exportAs: 'ngGrid',
  host: {
    'role': 'grid',
    '[tabindex]': '_pattern.tabIndex()',
    '[aria-disabled]': '_pattern.disabled()',
    '[aria-activedescendant]': '_pattern.activeDescendant()',
    '(keydown)': '_pattern.onKeydown($event)',
    '(pointerdown)': '_pattern.onPointerdown($event)',
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
  private readonly _rows = contentChildren(GRID_ROW, {descendants: true});

  /** The UI patterns for the rows in the grid. */
  private readonly _rowPatterns: Signal<any[]> = computed(() => this._rows().map(r => r._pattern));

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
    const ngZone = inject(NgZone);

    // Since `pointermove` fires on each pixel, we need to
    // be careful not to hit the zone unless it's necessary.
    ngZone.runOutsideAngular(() => {
      this.element.addEventListener(
        'pointermove',
        event => {
          if (this._pattern.acceptsPointerMove()) {
            ngZone.run(() => this._pattern.onPointermove(event));
          }
        },
        {passive: true},
      );
    });

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
