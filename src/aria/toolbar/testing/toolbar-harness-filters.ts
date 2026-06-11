/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {BaseHarnessFilters} from '@angular/cdk/testing';

/** A set of criteria that can be used to filter a list of Aria toolbar instances. */
export interface ToolbarHarnessFilters extends BaseHarnessFilters {}

/** A set of criteria that can be used to filter a list of Aria toolbar widget group instances. */
export interface ToolbarWidgetGroupHarnessFilters extends BaseHarnessFilters {}

/** A set of criteria that can be used to filter a list of Aria toolbar widgets. */
export interface ToolbarWidgetHarnessFilters extends BaseHarnessFilters {
  /** Text that the widget should match. */
  text?: string | RegExp;

  /** Active state that the widget should match. */
  active?: boolean;

  /** Selected state that the widget should match. */
  selected?: boolean;
}
