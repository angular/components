/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive} from '@angular/core';
import {
  _TABLE_LAYOUT_STRATEGY,
} from '@angular/cdk/table/table-layout-strategy';
import {ScrollableTableBodyLayoutStrategy} from '@angular/cdk-experimental/table';

/** A directive that enables scrollable body content for flex tables. */
@Directive({
  selector: 'mat-table[scrollableBody]',
  providers: [
    {provide: _TABLE_LAYOUT_STRATEGY, useClass: ScrollableTableBodyLayoutStrategy},
  ]
})
export class MatScrollableTableBody {
}
