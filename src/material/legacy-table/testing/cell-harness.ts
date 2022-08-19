/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {_MatCellHarnessBase} from '@angular/material/table/testing';

/** Harness for interacting with a standard Angular Material table cell. */
export class MatLegacyCellHarness extends _MatCellHarnessBase {
  /** The selector for the host element of a `MatCellHarness` instance. */
  static hostSelector = '.mat-cell';
}

/** Harness for interacting with a standard Angular Material table header cell. */
export class MatLegacyHeaderCellHarness extends _MatCellHarnessBase {
  /** The selector for the host element of a `MatHeaderCellHarness` instance. */
  static hostSelector = '.mat-header-cell';
}

/** Harness for interacting with a standard Angular Material table footer cell. */
export class MatLegacyFooterCellHarness extends _MatCellHarnessBase {
  /** The selector for the host element of a `MatFooterCellHarness` instance. */
  static hostSelector = '.mat-footer-cell';
}
