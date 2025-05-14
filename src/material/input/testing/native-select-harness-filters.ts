/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {BaseHarnessFilters} from '@angular/cdk/testing';
import {MatFormFieldControlHarnessFilters} from '@angular/material/form-field/testing/control';

/** A set of criteria that can be used to filter a list of `MatNativeSelectHarness` instances. */
export interface NativeSelectHarnessFilters extends MatFormFieldControlHarnessFilters {}

/** A set of criteria that can be used to filter a list of `MatNativeOptionHarness` instances. */
export interface NativeOptionHarnessFilters extends BaseHarnessFilters {
  text?: string | RegExp;
  index?: number;
  isSelected?: boolean;
}
