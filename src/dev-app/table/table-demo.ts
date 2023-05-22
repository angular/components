/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {
  CdkTableFlexBasicExample,
  CdkTableBasicExample,
  CdkTableFixedLayoutExample,
  CdkTableRecycleRowsExample,
} from '@angular/components-examples/cdk/table';
import {
  TableFlexBasicExample,
  TableBasicExample,
  TableDynamicColumnsExample,
  TableExpandableRowsExample,
  TableFilteringExample,
  TableFooterRowExample,
  TableHttpExample,
  TableMultipleHeaderFooterExample,
  TableOverviewExample,
  TablePaginationExample,
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
  TableHarnessExample,
  TableWithRipplesExample,
  TableColumnStylingExample,
  TableRowBindingExample,
  TableDynamicArrayDataExample,
  TableDynamicObservableDataExample,
  TableGeneratedColumnsExample,
  TableFlexLargeRowExample,
} from '@angular/components-examples/material/table';

@Component({
  templateUrl: './table-demo.html',
  standalone: true,
  imports: [
    CdkTableFlexBasicExample,
    CdkTableBasicExample,
    CdkTableFixedLayoutExample,
    CdkTableRecycleRowsExample,
    TableFlexBasicExample,
    TableBasicExample,
    TableDynamicColumnsExample,
    TableExpandableRowsExample,
    TableFilteringExample,
    TableFooterRowExample,
    TableHttpExample,
    TableMultipleHeaderFooterExample,
    TableOverviewExample,
    TablePaginationExample,
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
    TableHarnessExample,
    TableWithRipplesExample,
    TableColumnStylingExample,
    TableRowBindingExample,
    TableDynamicArrayDataExample,
    TableDynamicObservableDataExample,
    TableGeneratedColumnsExample,
    TableFlexLargeRowExample,
  ],
})
export class TableDemo {}
