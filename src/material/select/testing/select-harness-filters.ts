/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {MatFormFieldControlHarnessFilters} from '@angular/material/form-field/testing/control';

/** A set of criteria that can be used to filter a list of `MatSelectHarness` instances. */
export interface SelectHarnessFilters extends MatFormFieldControlHarnessFilters {
  /** Only find instances which match the given disabled state. */
  disabled?: boolean;
}
