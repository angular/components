/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  computed,
  contentChildren,
  Directive,
  ElementRef,
  inject,
  input,
  Signal,
} from '@angular/core';
import {GridPattern, GridRowPattern} from '../private';
import {Grid} from './grid';
import {GRID_CELL, GRID_ROW} from './grid-tokens';

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
 *
 * @see [Grid](guide/aria/grid)
 */
@Directive({
  selector: '[ngGridRow]',
  exportAs: 'ngGridRow',
  host: {
    'role': 'row',
    '[aria-rowindex]': '_pattern.rowIndex()',
  },
  providers: [{provide: GRID_ROW, useExisting: GridRow}],
})
export class GridRow {
  /** A reference to the host element. */
  private readonly _elementRef = inject(ElementRef);

  /** A reference to the host element. */
  readonly element = this._elementRef.nativeElement as HTMLElement;

  /** The cells that make up this row. */
  private readonly _cells = contentChildren(GRID_CELL, {descendants: true});

  /** The UI patterns for the cells in this row. */
  private readonly _cellPatterns: Signal<any[]> = computed(() =>
    this._cells().map(c => c._pattern),
  );

  /** The parent grid. */
  private readonly _grid = inject(Grid);

  /** The parent grid UI pattern. */
  readonly _gridPattern = computed<GridPattern>(() => this._grid._pattern);

  /** The index of this row within the grid. */
  readonly rowIndex = input<number>();

  /** The UI pattern for the grid row. */
  readonly _pattern = new GridRowPattern({
    ...this,
    cells: this._cellPatterns,
    grid: this._gridPattern,
  });
}
