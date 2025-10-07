/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/** Configuration object for customizing the icons used by `mat-sort-header`. */
export interface SortHeaderIcons {
  /** Icon shown when the column is not sorted (idle state). */
  default?: string;
  /** Icon shown when the column is sorted ascending. */
  ascending: string;
  /** Icon shown when the column is sorted descending. */
  descending: string;
}
