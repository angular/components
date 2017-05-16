import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {CdkHeaderRowPlaceholder, CdkRowPlaceholder, CdkTable} from './data-table';
import {CdkCellOutlet, CdkHeaderRow, CdkHeaderRowDef, CdkRow, CdkRowDef} from './row';
import {CdkColumnDef, CdkHeaderCellDef, CdkHeaderCell, CdkCell, CdkCellDef} from './cell';

export * from './data-source';
export * from './data-table';

@NgModule({
  imports: [CommonModule],
  exports: [
    CdkTable, CdkRowDef, CdkCellDef, CdkCellOutlet, CdkHeaderCellDef,
    CdkColumnDef, CdkCell, CdkRow,
    CdkHeaderCell, CdkHeaderRow, CdkHeaderRowDef],
  declarations: [
    CdkTable, CdkRowDef, CdkCellDef, CdkCellOutlet, CdkHeaderCellDef,
    CdkColumnDef, CdkCell, CdkRow,
    CdkHeaderCell, CdkHeaderRow, CdkHeaderRowDef,
    CdkRowPlaceholder, CdkHeaderRowPlaceholder,
  ]

})
export class CdkDataTableModule { }
