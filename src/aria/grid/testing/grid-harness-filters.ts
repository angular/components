/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {BaseHarnessFilters} from '@angular/cdk/testing';

/** Filters for locating a `GridCellHarness`. */
export interface GridCellHarnessFilters extends BaseHarnessFilters {
  /** Only find instances whose text matches the given value. */
  text?: string | RegExp;
  /** Only find instances whose selected state matches the given value. */
  selected?: boolean;
  /** Only find instances whose disabled state matches the given value. */
  disabled?: boolean;
}

/** Filters for locating a `GridRowHarness`. */
export interface GridRowHarnessFilters extends BaseHarnessFilters {
  // Add filters if needed, e.g., rowIndex
}

/** Filters for locating a `GridHarness`. */
export interface GridHarnessFilters extends BaseHarnessFilters {
  /** Only find instances whose disabled state matches the given value. */
  disabled?: boolean;
}
