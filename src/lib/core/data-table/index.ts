import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {
  CdkRowCell,
  CdkHeaderCell,
  CdkRow,
  CdkHeaderRowPlaceholder,
  CdkRowPlaceholder,
  CdkColumnDef,
  CdkHeaderCellDef,
  CdkCellOutlet,
  CdkRowCellDef,
  CdkRowDef,
  CdkTable,
  CdkHeaderRow,
  CdkHeaderDef
} from './data-table';

export * from './data-source';
export * from './data-table';

@NgModule({
  imports: [CommonModule],
  exports: [
    CdkTable, CdkRowDef, CdkRowCellDef, CdkCellOutlet, CdkHeaderCellDef, CdkColumnDef, CdkRowCell, CdkRow,
    CdkHeaderCell, CdkHeaderRow, CdkHeaderDef],
  declarations: [
    CdkTable, CdkRowDef, CdkRowCellDef, CdkCellOutlet, CdkHeaderCellDef, CdkColumnDef, CdkRowCell, CdkRow,
    CdkHeaderCell, CdkHeaderRow, CdkHeaderDef,
    CdkRowPlaceholder, CdkHeaderRowPlaceholder,
  ]

})
export class CdkDataTableModule { }
