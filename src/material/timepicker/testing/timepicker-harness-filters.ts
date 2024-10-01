/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {BaseHarnessFilters} from '@angular/cdk/testing';

/** A set of criteria that can be used to filter a list of `MatTimepickerHarness` instances. */
export interface TimepickerHarnessFilters extends BaseHarnessFilters {}

/** A set of criteria that can be used to filter a list of timepicker input instances. */
export interface TimepickerInputHarnessFilters extends BaseHarnessFilters {
  /** Filters based on the value of the input. */
  value?: string | RegExp;
  /** Filters based on the placeholder text of the input. */
  placeholder?: string | RegExp;
}

/** A set of criteria that can be used to filter a list of timepicker toggle instances. */
export interface TimepickerToggleHarnessFilters extends BaseHarnessFilters {}
