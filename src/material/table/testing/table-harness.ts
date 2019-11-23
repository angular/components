/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarness, HarnessPredicate} from '@angular/cdk/testing';
import {TableHarnessFilters, RowHarnessFilters} from './table-harness-filters';
import {MatRowHarness, MatHeaderRowHarness, MatFooterRowHarness} from './row-harness';

/** Data extracted from a table organized by columns. */
export interface MatTableHarnessColumnsData {
  [columnName: string]: {
    text: string[];
    headerText: string;
    footerText: string;
  };
}

/** Data extracted from a table organized by rows. */
export type MatTableHarnessRowsData = {
  columnName: string;
  text: string;
}[][];

/** Harness for interacting with a standard mat-table in tests. */
export class MatTableHarness extends ComponentHarness {
  static hostSelector = '.mat-table';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a radio-button with
   * specific attributes.
   * @param options Options for narrowing the search
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: TableHarnessFilters = {}): HarnessPredicate<MatTableHarness> {
    return new HarnessPredicate(MatTableHarness, options);
  }

  /** Gets all of the header rows in a table. */
  async getHeaderRows(filter: RowHarnessFilters = {}): Promise<MatHeaderRowHarness[]> {
    return this.locatorForAll(MatHeaderRowHarness.with(filter))();
  }

  /** Gets all of the regular data rows in a table. */
  async getRows(filter: RowHarnessFilters = {}): Promise<MatRowHarness[]> {
    return this.locatorForAll(MatRowHarness.with(filter))();
  }

  /** Gets all of the footer rows in a table. */
  async getFooterRows(filter: RowHarnessFilters = {}): Promise<MatFooterRowHarness[]> {
    return this.locatorForAll(MatFooterRowHarness.with(filter))();
  }

  /** Gets the data inside the entire table organized by rows. */
  async getRowsData(): Promise<MatTableHarnessRowsData> {
    const rows = await this.getRows();
    return Promise.all(rows.map(row => row.getData()));
  }

  /** Gets the data inside the entire table organized by columns. */
  async getColumnsData(): Promise<MatTableHarnessColumnsData> {
    // Tables can have multiple header rows, but we consider the first one as the "main" row.
    const headerRow = (await this.getHeaderRows())[0];
    const footerRow = (await this.getFooterRows())[0];
    const dataRows = await this.getRows();

    const headerData = headerRow ? await headerRow.getData() : [];
    const footerData = footerRow ? await footerRow.getData() : [];
    const rowsData = await Promise.all(dataRows.map(row => row.getData()));
    const data: MatTableHarnessColumnsData = {};

    rowsData.forEach(cells => {
      cells.forEach(cell => {
        if (!data[cell.columnName]) {
          const headerCell = headerData.find(header => header.columnName === cell.columnName);
          const footerCell = footerData.find(footer => footer.columnName === cell.columnName);

          data[cell.columnName] = {
            headerText: headerCell ? headerCell.text : '',
            footerText: footerCell ? footerCell.text : '',
            text: []
          };
        }

        data[cell.columnName].text.push(cell.text);
      });
    });

    return data;
  }
}
