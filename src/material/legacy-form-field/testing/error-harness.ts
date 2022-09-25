/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarnessConstructor, HarnessPredicate} from '@angular/cdk/testing';

import {_MatErrorHarnessBase, ErrorHarnessFilters} from '@angular/material/form-field/testing';

/** Harness for interacting with a `mat-error` in tests. */
export class MatErrorHarness extends _MatErrorHarnessBase {
  static hostSelector = '.mat-error';

  /**
   * Gets a `HarnessPredicate` that can be used to search for an error with specific
   * attributes.
   * @param options Options for filtering which error instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with<T extends MatErrorHarness>(
    this: ComponentHarnessConstructor<T>,
    options: ErrorHarnessFilters = {},
  ): HarnessPredicate<T> {
    return _MatErrorHarnessBase._getErrorPredicate(this, options);
  }
}
