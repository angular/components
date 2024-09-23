/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {BaseHarnessFilters} from '@angular/cdk/testing';

/** A set of criteria that can be used to filter a list of `MatCheckboxHarness` instances. */
export interface CheckboxHarnessFilters extends BaseHarnessFilters {
  /** Only find instances whose label matches the given value. */
  label?: string | RegExp;
  /** Only find instances whose name attribute is the given value. */
  name?: string;
  /** Only find instances with the given checked value. */
  checked?: boolean;
  /** Only find instances which match the given disabled state. */
  disabled?: boolean;
}
