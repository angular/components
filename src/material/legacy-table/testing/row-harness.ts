/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  MatLegacyCellHarness,
  MatLegacyFooterCellHarness,
  MatLegacyHeaderCellHarness,
} from './cell-harness';
import {_MatRowHarnessBase} from '@angular/material/table/testing';

/** Harness for interacting with a standard Angular Material table row. */
export class MatLegacyRowHarness extends _MatRowHarnessBase<
  typeof MatLegacyCellHarness,
  MatLegacyCellHarness
> {
  /** The selector for the host element of a `MatRowHarness` instance. */
  static hostSelector = '.mat-row';
  protected _cellHarness = MatLegacyCellHarness;
}

/** Harness for interacting with a standard Angular Material table header row. */
export class MatLegacyHeaderRowHarness extends _MatRowHarnessBase<
  typeof MatLegacyHeaderCellHarness,
  MatLegacyHeaderCellHarness
> {
  /** The selector for the host element of a `MatHeaderRowHarness` instance. */
  static hostSelector = '.mat-header-row';
  protected _cellHarness = MatLegacyHeaderCellHarness;
}

/** Harness for interacting with a standard Angular Material table footer row. */
export class MatLegacyFooterRowHarness extends _MatRowHarnessBase<
  typeof MatLegacyFooterCellHarness,
  MatLegacyFooterCellHarness
> {
  /** The selector for the host element of a `MatFooterRowHarness` instance. */
  static hostSelector = '.mat-footer-row';
  protected _cellHarness = MatLegacyFooterCellHarness;
}
