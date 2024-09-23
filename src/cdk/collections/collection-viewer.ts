/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Observable} from 'rxjs';

/** Represents a range of numbers with a specified start and end. */
export type ListRange = {start: number; end: number};

/**
 * Interface for any component that provides a view of some data collection and wants to provide
 * information regarding the view and any changes made.
 */
export interface CollectionViewer {
  /**
   * A stream that emits whenever the `CollectionViewer` starts looking at a new portion of the
   * data. The `start` index is inclusive, while the `end` is exclusive.
   */
  viewChange: Observable<ListRange>;
}
