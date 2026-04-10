/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {BaseHarnessFilters} from '@angular/cdk/testing';

/** Filters for locating a `MenuTriggerHarness`. */
export interface MenuTriggerHarnessFilters extends BaseHarnessFilters {
  /** Only find instances whose text matches the given value. */
  text?: string | RegExp;
}

/** Filters for locating a `MenuHarness`. */
export interface MenuHarnessFilters extends BaseHarnessFilters {}

/** Filters for locating a `MenuItemHarness`. */
export interface MenuItemHarnessFilters extends BaseHarnessFilters {
  /** Only find instances whose text matches the given value. */
  text?: string | RegExp;
  /** Only find instances whose disabled state matches the given value. */
  disabled?: boolean;
  /** Only find instances whose expanded state matches the given value. */
  expanded?: boolean;
}
