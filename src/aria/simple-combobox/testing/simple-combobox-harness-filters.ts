/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {BaseHarnessFilters} from '@angular/cdk/testing';

/** A set of criteria that can be used to filter a list of `SimpleComboboxHarness` instances. */
export interface SimpleComboboxHarnessFilters extends BaseHarnessFilters {
  /** Only find instances whose placeholder matches the given value. */
  placeholder?: string | RegExp;
  /** Only find instances whose value matches the given value. */
  value?: string | RegExp;
  /** Only find instances with the given disabled state. */
  disabled?: boolean;
}
