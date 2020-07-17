/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BaseHarnessFilters} from '@angular/cdk/testing';

export interface TreeHarnessFilters extends BaseHarnessFilters {
}

export interface TreeNodeHarnessFilters extends BaseHarnessFilters {
  /** Only find instances whose text matches the given value. */
  text?: string | RegExp;
  /** Only find instances whose state matches the given value. */
  disabled?: boolean;
  /** Only find instances whose expansion state matches the given value. */
  expanded?: boolean;
  /** Only find instances whose role matches the given value. */
  role?: 'treeitem'|'group';
  /** Only find instances whose level matches the given value. */
  level?: number;
}
