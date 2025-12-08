/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component} from '@angular/core';
import {
  CdkTableBasicExample,
  CdkTableFixedLayoutExample,
  CdkTableFlexBasicExample,
  CdkTableRecycleRowsExample,
  CdkTableVirtualScrollExample,
} from '@angular/components-examples/cdk/table';
import {
  TableBasicExample,
  TableDynamicColumnsExample,
  TableExpandableRowsExample,
  TableFilteringExample,
  TableFlexBasicExample,
  TableFlexLargeRowExample,
  TableFooterRowExample,
  TableHttpExample,
  TableMultipleHeaderFooterExample,
  TableMultipleRowTemplateExample,
  TableOverviewExample,
  TablePaginationExample,
  TableRecycleRowsExample,
  TableReorderableExample,
  TableRowContextExample,
  TableSelectionExample,
  TableSortingExample,
  TableStickyColumnsExample,
  TableStickyComplexExample,
  TableStickyComplexFlexExample,
  TableStickyFooterExample,
  TableStickyHeaderExample,
  TableTextColumnAdvancedExample,
  TableTextColumnExample,
  TableVirtualScrollExample,
  TableWrappedExample,
} from '@angular/components-examples/material/table';

@Component({
  templateUrl: './table-demo.html',
  imports: [
    CdkTableFlexBasicExample,
    CdkTableBasicExample,
    CdkTableFixedLayoutExample,
    CdkTableRecycleRowsExample,
    CdkTableVirtualScrollExample,
    TableFlexBasicExample,
    TableBasicExample,
    TableDynamicColumnsExample,
    TableExpandableRowsExample,
    TableFilteringExample,
    TableFooterRowExample,
    TableHttpExample,
    TableMultipleHeaderFooterExample,
    TableMultipleRowTemplateExample,
    TableOverviewExample,
    TablePaginationExample,
    TableVirtualScrollExample,
    TableRowContextExample,
    TableSelectionExample,
    TableSortingExample,
    TableStickyColumnsExample,
    TableStickyComplexFlexExample,
    TableStickyComplexExample,
    TableStickyFooterExample,
    TableStickyHeaderExample,
    TableTextColumnAdvancedExample,
    TableTextColumnExample,
    TableWrappedExample,
    TableReorderableExample,
    TableRecycleRowsExample,
    TableFlexLargeRowExample,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableDemo {}
