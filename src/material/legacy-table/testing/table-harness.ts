/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  MatLegacyFooterRowHarness,
  MatLegacyHeaderRowHarness,
  MatLegacyRowHarness,
} from './row-harness';
import {_MatTableHarnessBase} from '@angular/material/table/testing';

/** Harness for interacting with a standard mat-table in tests. */
export class MatLegacyTableHarness extends _MatTableHarnessBase<
  typeof MatLegacyHeaderRowHarness,
  MatLegacyHeaderRowHarness,
  typeof MatLegacyRowHarness,
  MatLegacyRowHarness,
  typeof MatLegacyFooterRowHarness,
  MatLegacyFooterRowHarness
> {
  /** The selector for the host element of a `MatTableHarness` instance. */
  static hostSelector = '.mat-table';
  protected _headerRowHarness = MatLegacyHeaderRowHarness;
  protected _rowHarness = MatLegacyRowHarness;
  protected _footerRowHarness = MatLegacyFooterRowHarness;
}
