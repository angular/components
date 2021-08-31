/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ScrollingModule} from '@angular/cdk/scrolling';
import {NgModule} from '@angular/core';

import {
  CdkCell,
  CdkCellDef,
  CdkColumnDef,
  CdkFooterCell,
  CdkFooterCellDef,
  CdkHeaderCell,
  CdkHeaderCellDef
} from './cell';
import {
  CdkCellOutlet,
  CdkFooterRow,
  CdkFooterRowDef,
  CdkHeaderRow,
  CdkHeaderRowDef,
  CdkNoDataRow,
  CdkRow,
  CdkRowDef
} from './row';
import {
  CdkRecycleRows,
  CdkTable,
  DataRowOutlet,
  FooterRowOutlet,
  HeaderRowOutlet,
  NoDataRowOutlet,
} from './table';
import {CdkTextColumn} from './text-column';

const EXPORTED_DECLARATIONS = [
  CdkTable,         CdkRowDef,       CdkCellDef,      CdkCellOutlet, CdkHeaderCellDef,
  CdkFooterCellDef, CdkColumnDef,    CdkCell,         CdkRow,        CdkHeaderCell,
  CdkFooterCell,    CdkHeaderRow,    CdkHeaderRowDef, CdkFooterRow,  CdkFooterRowDef,
  DataRowOutlet,    HeaderRowOutlet, FooterRowOutlet, CdkTextColumn, CdkNoDataRow,
  CdkRecycleRows,   NoDataRowOutlet,
];

@NgModule({
  exports: EXPORTED_DECLARATIONS,
  declarations: EXPORTED_DECLARATIONS,
  imports: [ScrollingModule]
})
export class CdkTableModule {
}
