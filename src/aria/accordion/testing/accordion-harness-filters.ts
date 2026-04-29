/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {BaseHarnessFilters} from '@angular/cdk/testing';

/** Filters for locating an `AccordionHarness`. */
export interface AccordionHarnessFilters extends BaseHarnessFilters {
  /** Only find instances whose title text matches the given value. */
  title?: string | RegExp;
  /** Only find instances whose expanded state matches the given value. */
  expanded?: boolean;
  /** Only find instances whose disabled state matches the given value. */
  disabled?: boolean;
  /** Only find instances whose id matches the given value. */
  id?: string | RegExp;
}

/** Filters for locating an `AccordionGroupHarness`. */
export interface AccordionGroupHarnessFilters extends BaseHarnessFilters {}
