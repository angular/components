/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {BaseHarnessFilters} from '@angular/cdk/testing';

/** A set of criteria that can be used to filter a list of `MatDrawerHarness` instances. */
export interface DrawerHarnessFilters extends BaseHarnessFilters {
  /** Only find instances whose side is the given value. */
  position?: 'start' | 'end';
}

/** A set of criteria that can be used to filter a list of `MatDrawerContainerHarness` instances. */
export interface DrawerContainerHarnessFilters extends BaseHarnessFilters {}

/** A set of criteria that can be used to filter a list of `MatDrawerContentHarness` instances. */
export interface DrawerContentHarnessFilters extends BaseHarnessFilters {}
