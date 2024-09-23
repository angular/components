/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {BaseHarnessFilters} from '@angular/cdk/testing';

/** Criteria that can be used to filter a list of `MatButtonToggleGroupHarness` instances. */
export interface ButtonToggleGroupHarnessFilters extends BaseHarnessFilters {
  /** Only find instances which match the given disabled state. */
  disabled?: boolean;
}
