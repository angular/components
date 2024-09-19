/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {BaseHarnessFilters} from '@angular/cdk/testing';

/** A set of criteria that can be used to filter a list of `MatTabHarness` instances. */
export interface TabHarnessFilters extends BaseHarnessFilters {
  /** Only find instances whose label matches the given value. */
  label?: string | RegExp;
  /** Only find instances whose selected state matches the given value. */
  selected?: boolean;
}

/** A set of criteria that can be used to filter a list of `MatTabGroupHarness` instances. */
export interface TabGroupHarnessFilters extends BaseHarnessFilters {
  /** Only find instances whose selected tab label matches the given value. */
  selectedTabLabel?: string | RegExp;
}

/** A set of criteria that can be used to filter a list of `MatTabLinkHarness` instances. */
export interface TabLinkHarnessFilters extends BaseHarnessFilters {
  /** Only find instances whose label matches the given value. */
  label?: string | RegExp;
}

/** A set of criteria that can be used to filter a list of `MatTabNavBarHarness` instances. */
export interface TabNavBarHarnessFilters extends BaseHarnessFilters {}

/** A set of criteria that can be used to filter a list of `MatTabNavPanelHarness` instances. */
export interface TabNavPanelHarnessFilters extends BaseHarnessFilters {}
