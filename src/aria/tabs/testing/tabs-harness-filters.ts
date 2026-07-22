/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {BaseHarnessFilters} from '@angular/cdk/testing';

/** A set of criteria that can be used to filter a list of `TabsHarness` instances. */
export interface TabsHarnessFilters extends BaseHarnessFilters {}

/** A set of criteria that can be used to filter a list of `TabHarness` instances. */
export interface TabHarnessFilters extends BaseHarnessFilters {
  /** Only find instances whose title matches the given value. */
  title?: string | RegExp;
  /** Only find instances that are selected. */
  selected?: boolean;
  /** Only find instances that are disabled. */
  disabled?: boolean;
}
