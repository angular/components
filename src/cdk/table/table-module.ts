/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {HeaderRowPlaceholder, RowPlaceholder, CdkTable, FooterRowPlaceholder} from './table';
import {
  CdkCellOutlet, CdkFooterRow, CdkFooterRowDef, CdkHeaderRow, CdkHeaderRowDef, CdkRow,
  CdkRowDef
} from './row';
import {
  CdkColumnDef, CdkHeaderCellDef, CdkHeaderCell, CdkCell, CdkCellDef,
  CdkFooterCellDef, CdkFooterCell
} from './cell';

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
  RowPlaceholder,
  HeaderRowPlaceholder,
  FooterRowPlaceholder,
];

@NgModule({
  imports: [CommonModule],
  exports: [EXPORTED_DECLARATIONS],
  declarations: [EXPORTED_DECLARATIONS]

})
export class CdkTableModule { }
