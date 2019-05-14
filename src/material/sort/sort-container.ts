/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectionToken} from '@angular/core';
import {Subject} from 'rxjs';
import {MatSortable} from './sortable';

/** Injection token for the MatSortContainer. */
export const MAT_SORT_CONTAINER = new InjectionToken<MatSortContainer<any>>('MatSortContainer');

/** Container that is responsible for the state management of a set of registered Sortables. */
export interface MatSortContainer<T> {
  /**
   * Stream that emits when the state has changed for any Sortable in the set of
   * Sortables, e.g. the active Sortable has changed.
   */
  stateChanges: Subject<void>;

  /** Registers a sortable to the set of managed Sortables. */
  register(sortable: MatSortable): void;

  /** Deregisters a sortable to the set of managed Sortables. */
  deregister(sortable: MatSortable): void;

  /** Performs the sort action for this sortable with relation to this sort container. */
  sort(sortable: MatSortable): void;

  /** Provides the current state of the sortable. */
  getSortableState(sortable: MatSortable): T;
}
