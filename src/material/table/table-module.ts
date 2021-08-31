/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CdkTableModule} from '@angular/cdk/table';
import {NgModule} from '@angular/core';
import {MatCommonModule} from '@angular/material/core';

import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatFooterCell,
  MatFooterCellDef,
  MatHeaderCell,
  MatHeaderCellDef,
} from './cell';
import {
  MatFooterRow,
  MatFooterRowDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatNoDataRow,
  MatRow,
  MatRowDef
} from './row';
import {MatRecycleRows, MatTable} from './table';
import {MatTextColumn} from './text-column';

const EXPORTED_DECLARATIONS = [
  // Table
  MatTable,
  MatRecycleRows,

  // Template defs
  MatHeaderCellDef,
  MatHeaderRowDef,
  MatColumnDef,
  MatCellDef,
  MatRowDef,
  MatFooterCellDef,
  MatFooterRowDef,

  // Cell directives
  MatHeaderCell,
  MatCell,
  MatFooterCell,

  // Row directives
  MatHeaderRow,
  MatRow,
  MatFooterRow,
  MatNoDataRow,

  MatTextColumn,
];

@NgModule({
  imports: [
    CdkTableModule,
    MatCommonModule,
  ],
  exports: [MatCommonModule, EXPORTED_DECLARATIONS],
  declarations: EXPORTED_DECLARATIONS,
})
export class MatTableModule {
}
