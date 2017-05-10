import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {
  CdkRowCell,
  CdkHeaderRowCell,
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
  CdkHeaderRowDef
} from './data-table';

export * from './data-source';
export * from './data-table';

@NgModule({
  imports: [CommonModule],
  exports: [
    CdkTable, CdkRowDef, CdkRowCellDef, CdkCellOutlet, CdkHeaderCellDef,
    CdkColumnDef, CdkRowCell, CdkRow,
    CdkHeaderRowCell, CdkHeaderRow, CdkHeaderRowDef],
  declarations: [
    CdkTable, CdkRowDef, CdkRowCellDef, CdkCellOutlet, CdkHeaderCellDef,
    CdkColumnDef, CdkRowCell, CdkRow,
    CdkHeaderRowCell, CdkHeaderRow, CdkHeaderRowDef,
    CdkRowPlaceholder, CdkHeaderRowPlaceholder,
  ]

})
export class CdkDataTableModule { }
