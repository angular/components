/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {BaseHarnessFilters} from '@angular/cdk/testing';

/**
 * A set of criteria shared by any class derived from `MatFormFieldControlHarness`, that can be
 * used to filter a list of those components.
 */
export interface MatFormFieldControlHarnessFilters extends BaseHarnessFilters {
  /** Filters based on the text of the form field's floating label. */
  label?: string | RegExp;
}
