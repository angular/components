/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarness, HarnessPredicate} from '@angular/cdk/testing';
import {CellHarnessFilters} from './table-harness-filters';

/** Harness for interacting with a standard Angular Material table cell. */
export class MatCellHarness extends ComponentHarness {
  static hostSelector = '.mat-cell';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a cell with specific attributes.
   */
  static with(options: CellHarnessFilters = {}): HarnessPredicate<MatCellHarness> {
    return new HarnessPredicate(MatCellHarness, options)
        .addOption('text', options.text,
            (harness, text) => HarnessPredicate.stringMatches(harness.getText(), text));
  }

  /** Gets a promise for the cell's text. */
  async getText(): Promise<string> {
    return (await this.host()).text();
  }

  /** Gets the name of the column. */
  async getColumnName(): Promise<string> {
    const host = await this.host();
    const classAttribute = await host.getAttribute('class');

    if (classAttribute) {
      const prefix = 'mat-column-';
      const name = classAttribute.split(' ').map(c => c.trim()).find(c => c.startsWith(prefix));

      if (name) {
        return name.split(prefix)[1];
      }
    }

    throw Error('Could not determine column name of cell.');
  }
}

/** Harness for interacting with a standard Angular Material table header cell. */
export class MatHeaderCellHarness extends MatCellHarness {
  static hostSelector = '.mat-header-cell';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a header cell with specific attributes
   */
  static with(options: CellHarnessFilters = {}): HarnessPredicate<MatHeaderCellHarness> {
    return new HarnessPredicate(MatHeaderCellHarness, options)
        .addOption('text', options.text,
            (harness, text) => HarnessPredicate.stringMatches(harness.getText(), text));
  }
}

/** Harness for interacting with a standard Angular Material table footer cell. */
export class MatFooterCellHarness extends MatCellHarness {
  static hostSelector = '.mat-footer-cell';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a footer cell with specific attributes
   */
  static with(options: CellHarnessFilters = {}): HarnessPredicate<MatFooterCellHarness> {
    return new HarnessPredicate(MatFooterCellHarness, options)
        .addOption('text', options.text,
            (harness, text) => HarnessPredicate.stringMatches(harness.getText(), text));
  }
}
