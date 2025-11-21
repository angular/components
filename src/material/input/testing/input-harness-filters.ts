/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {MatFormFieldControlHarnessFilters} from '@angular/material/form-field/testing/control';

/** A set of criteria that can be used to filter a list of `MatInputHarness` instances. */
export interface InputHarnessFilters extends MatFormFieldControlHarnessFilters {
  /** Filters based on the value of the input. */
  value?: string | RegExp;
  /** Filters based on the placeholder text of the input. */
  placeholder?: string | RegExp;
}
