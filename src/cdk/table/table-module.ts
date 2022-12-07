/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {
  HeaderRowOutlet,
  DataRowOutlet,
  CdkTable,
  CdkRecycleRows,
  FooterRowOutlet,
  NoDataRowOutlet,
} from './table';
import {
  CdkCellOutlet,
  CdkFooterRow,
  CdkFooterRowDef,
  CdkHeaderRow,
  CdkHeaderRowDef,
  CdkRow,
  CdkRowDef,
  CdkNoDataRow,
} from './row';
import {
  CdkColumnDef,
  CdkHeaderCellDef,
  CdkHeaderCell,
  CdkCell,
  CdkCellDef,
  CdkFooterCellDef,
  CdkFooterCell,
} from './cell';
import {CdkTextColumn} from './text-column';
import {ScrollingModule} from '@angular/cdk/scrolling';

const TABLE_DIRECTIVES = [
  CdkCellDef,
  CdkHeaderCellDef,
  CdkFooterCellDef,
  CdkColumnDef,
  CdkHeaderCell,
  CdkFooterCell,
  CdkCell,
  CdkHeaderRowDef,
  CdkFooterRowDef,
  CdkRowDef,
  CdkCellOutlet,
  CdkNoDataRow,
  CdkRecycleRows,
  DataRowOutlet,
  HeaderRowOutlet,
  FooterRowOutlet,
  NoDataRowOutlet,
];

const EXPORTED_DECLARATIONS = [CdkTable, CdkRow, CdkHeaderRow, CdkFooterRow, CdkTextColumn];

@NgModule({
  exports: [...EXPORTED_DECLARATIONS, ...TABLE_DIRECTIVES],
  declarations: EXPORTED_DECLARATIONS,
  imports: [ScrollingModule, ...TABLE_DIRECTIVES],
})
export class CdkTableModule {}
