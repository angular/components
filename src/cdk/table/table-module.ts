/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
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

const EXPORTED_DECLARATIONS = [
  CdkTable,
  CdkRowDef,
  CdkCellDef,
  CdkCellOutlet,
  CdkHeaderCellDef,
  CdkFooterCellDef,
  CdkColumnDef,
  CdkCell,
  CdkRow,
  CdkHeaderCell,
  CdkFooterCell,
  CdkHeaderRow,
  CdkHeaderRowDef,
  CdkFooterRow,
  CdkFooterRowDef,
  DataRowOutlet,
  HeaderRowOutlet,
  FooterRowOutlet,
  CdkTextColumn,
  CdkNoDataRow,
  CdkRecycleRows,
  NoDataRowOutlet,
];

@NgModule({
  exports: EXPORTED_DECLARATIONS,
  imports: [ScrollingModule, ...EXPORTED_DECLARATIONS],
})
export class CdkTableModule {}
