/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SortDirection} from './sort-direction';

/**
 * Interface for a directive that triggers sort state changes and is contained by a `SortContainer`.
 */
export interface MatSortable {
  /** The id of the sortable being sorted. */
  id: string;

  /** Starting sort direction. */
  start: 'asc'|'desc';

  /** Whether to disable clearing the sorting state. */
  disableClear: boolean;

  /** Whether the sortable is disabled. */
  disabled: boolean;
}

/** Interface for the current state of a sortable, which is determined by its `SortContainer`. */
export interface SortableState {
  /** Whether this sortable is currently sorted. */
  isSorted: boolean;

  /** Whether this sortable is disabled. */
  isDisabled: boolean;

  /** The direction that this sortable is oriented if sorted, otherwise an empty string.  */
  direction: SortDirection;

  /** The sort direction that will be next if this sortable is triggered again. */
  nextDirection: SortDirection;
}
