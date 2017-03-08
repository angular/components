import {CommonModule} from '@angular/common';
import {NgModule, ModuleWithProviders} from '@angular/core';

import {MdCell, MdDataTable, MdHeaderCell, MdHeaderRow, MdRow, MdRowContext} from './data-table';

export * from './data-table';
export * from './data-source';
export * from './data-table-errors';
export * from './sort-service';

@NgModule({
  imports: [CommonModule],
  exports: [
    MdDataTable,
    MdRow,
    MdRowContext,
    MdCell,
    MdHeaderRow,
    MdHeaderCell,
  ],
  declarations: [
    MdDataTable,
    MdRow,
    MdRowContext,
    MdCell,
    MdHeaderRow,
    MdHeaderCell,
  ],
})
export class MdDataTableModule {
  /** @deprecated */
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdDataTableModule,
    };
  }
}
