/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {Component, model, viewChild, input} from '@angular/core';
import {Grid, GridRow, GridCell, GridCellWidget} from '@angular/aria/grid';

/** @title Grid Chips. */
@Component({
  selector: 'grid-chips',
  exportAs: 'gridChips',
  templateUrl: 'grid-chips.html',
  styleUrls: ['grid-chips.css'],
  imports: [Grid, GridRow, GridCell, GridCellWidget],
})
export class GridChips {
  readonly firstCell = viewChild(GridCell);
  readonly values = model<string[]>([]);

  readonly tabindex = input<number | undefined>();

  removeItem(index: number) {
    this.values.update(items => [...items.slice(0, index), ...items.slice(index + 1)]);
  }

  focus(): void {
    this.firstCell()?.element().focus();
  }
}
