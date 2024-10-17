/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  CdkTableBasicExample,
  CdkTableFixedLayoutExample,
  CdkTableFlexBasicExample,
  CdkTableRecycleRowsExample,
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
  TableWrappedExample,
} from '@angular/components-examples/material/table';
import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  templateUrl: './table-demo.html',
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
    TableMultipleRowTemplateExample,
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
    TableFlexLargeRowExample,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableDemo {}
