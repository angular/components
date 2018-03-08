/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatTable} from './table';
import {CdkTableModule} from '@angular/cdk/table';
import {
  MatCell, MatCellDef, MatColumnDef, MatFooterCell, MatFooterCellDef, MatHeaderCell,
  MatHeaderCellDef
} from './cell';
import {
  MatFooterRow, MatFooterRowDef, MatHeaderRow, MatHeaderRowDef, MatRow,
  MatRowDef
} from './row';
import {CommonModule} from '@angular/common';
import {MatCommonModule} from '@angular/material/core';

@NgModule({
  imports: [CdkTableModule, CommonModule, MatCommonModule],
  exports: [MatTable, MatCellDef, MatHeaderCellDef, MatFooterCellDef, MatColumnDef,
    MatHeaderCell, MatFooterCell, MatCell, MatHeaderRow, MatFooterRow, MatRow,
    MatHeaderRowDef, MatFooterRowDef, MatRowDef],
  declarations: [MatTable, MatCellDef, MatHeaderCellDef, MatFooterCellDef, MatColumnDef,
    MatHeaderCell, MatFooterCell, MatCell, MatHeaderRow, MatFooterRow, MatRow,
    MatHeaderRowDef, MatFooterRowDef, MatRowDef],
})
export class MatTableModule {}
