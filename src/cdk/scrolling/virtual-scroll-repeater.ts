/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ListRange} from '@angular/cdk/collections';
import {Observable} from 'rxjs';

/**
 * An item to be repeated by the VirtualScrollViewport
 */
export interface CdkVirtualScrollRepeater<T> {
  readonly dataStream: Observable<readonly T[]>;
  measureRangeSize(range: ListRange, orientation: 'horizontal'|'vertical'): number;
}
