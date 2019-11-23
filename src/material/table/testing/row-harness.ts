/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarness, HarnessPredicate} from '@angular/cdk/testing';
import {RowHarnessFilters, CellHarnessFilters} from './table-harness-filters';
import {MatCellHarness, MatHeaderCellHarness, MatFooterCellHarness} from './cell-harness';

/** Data extracted from the cells in a table row. */
export type MatRowHarnessData = {
  columnName: string;
  text: string;
}[];

/** Harness for interacting with a standard Angular Material table row. */
export class MatRowHarness extends ComponentHarness {
  static hostSelector = '.mat-row';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a row with specific attributes.
   */
  static with(options: RowHarnessFilters = {}): HarnessPredicate<MatRowHarness> {
    return new HarnessPredicate(MatRowHarness, options);
  }

  /** Gets all cells of the table row. */
  async getCells(filter: CellHarnessFilters = {}): Promise<MatCellHarness[]> {
    return this.locatorForAll(MatCellHarness.with(filter))();
  }

  /** Gets the data of the cells in the footer row. */
  async getData(filter: CellHarnessFilters = {}): Promise<MatRowHarnessData> {
    return getCellData(await this.getCells(filter));
  }
}

/** Harness for interacting with a standard Angular Material table header row. */
export class MatHeaderRowHarness extends ComponentHarness {
  static hostSelector = '.mat-header-row';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a header row with specific attributes.
   */
  static with(options: RowHarnessFilters = {}): HarnessPredicate<MatHeaderRowHarness> {
    return new HarnessPredicate(MatHeaderRowHarness, options);
  }

  /** Gets all cells of the table header row. */
  async getCells(filter: CellHarnessFilters = {}): Promise<MatHeaderCellHarness[]> {
    return this.locatorForAll(MatHeaderCellHarness.with(filter))();
  }

  /** Gets the data of the cells in the footer row. */
  async getData(filter: CellHarnessFilters = {}): Promise<MatRowHarnessData> {
    return getCellData(await this.getCells(filter));
  }
}


/** Harness for interacting with a standard Angular Material table footer row. */
export class MatFooterRowHarness extends ComponentHarness {
  static hostSelector = '.mat-footer-row';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a footer row with specific attributes.
   */
  static with(options: RowHarnessFilters = {}): HarnessPredicate<MatFooterRowHarness> {
    return new HarnessPredicate(MatFooterRowHarness, options);
  }

  /** Gets all cells of the table footer row. */
  async getCells(filter: CellHarnessFilters = {}): Promise<MatFooterCellHarness[]> {
    return this.locatorForAll(MatFooterCellHarness.with(filter))();
  }

  /** Gets the data of the cells in the footer row. */
  async getData(filter: CellHarnessFilters = {}): Promise<MatRowHarnessData> {
    return getCellData(await this.getCells(filter));
  }
}

/** Extracts the data from the cells in a row. */
async function getCellData(cells: MatCellHarness[]): Promise<MatRowHarnessData> {
  return Promise.all(cells.map(async cell => ({
    text: await cell.getText(),
    columnName: await cell.getColumnName()
  })));
}
