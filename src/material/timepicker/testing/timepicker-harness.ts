/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentHarness, HarnessPredicate} from '@angular/cdk/testing';
import {TimepickerHarnessFilters} from './timepicker-harness-filters';

/** Harness for interacting with a standard `MatTimepicker` in tests. */
export class MatTimepickerHarness extends ComponentHarness {
  /** The selector for the host element of a `MatTimepicker` instance. */
  static hostSelector = '.mat-timepicker';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatTimepicker`
   * that meets certain criteria.
   * @param options Options for filtering which dialog instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: TimepickerHarnessFilters = {}): HarnessPredicate<MatTimepickerHarness> {
    return new HarnessPredicate(MatTimepickerHarness, options);
  }
}
