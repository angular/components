import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {CdkHeaderRowPlaceholder, CdkRowPlaceholder, CdkTable} from './data-table';
import {CdkCellOutlet, CdkHeaderRow, CdkHeaderRowDef, CdkRow, CdkRowDef} from './row';
import {CdkColumnDef, CdkHeaderCellDef, CdkHeaderRowCell, CdkRowCell, CdkRowCellDef} from './cell';

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
