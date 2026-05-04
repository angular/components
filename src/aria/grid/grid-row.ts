/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  afterNextRender,
  computed,
  Directive,
  ElementRef,
  inject,
  input,
  OnDestroy,
  OnInit,
  Signal,
} from '@angular/core';
import {GridPattern, GridRowPattern, SortedCollection} from '../private';
import {GRID_ROW, GRID} from './grid-tokens';
import {GridCell} from './grid-cell';

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
    '[attr.aria-rowindex]': '_pattern.rowIndex()',
  },
  providers: [{provide: GRID_ROW, useExisting: GridRow}],
})
export class GridRow implements OnInit, OnDestroy {
  /** A reference to the host element. */
  private readonly _elementRef = inject(ElementRef);

  /** A reference to the host element. */
  readonly element = this._elementRef.nativeElement as HTMLElement;

  /** The collection of cells in this row. */
  readonly _collection = new SortedCollection<GridCell>();

  /** The UI patterns for the cells in this row. */
  private readonly _cellPatterns: Signal<any[]> = computed(() =>
    this._collection.orderedItems().map(c => c._pattern),
  );

  /** The parent grid. */
  private readonly _grid = inject(GRID);

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

  constructor() {
    afterNextRender(() => {
      this._collection.startObserving(this.element);
    });
  }

  ngOnInit() {
    this._grid._collection.register(this);
  }

  ngOnDestroy() {
    this._grid._collection.unregister(this);
    this._collection.stopObserving();
  }
}
