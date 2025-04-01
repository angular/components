/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Observable} from 'rxjs';
import {ListRange} from '@angular/cdk/collections';

/**
 * An item to be repeated by the VirtualScrollViewport
 */
export interface CdkVirtualScrollRepeater<T> {
  readonly dataStream: Observable<readonly T[]>;
  measureRangeSize(range: ListRange, orientation: 'horizontal' | 'vertical'): number;
}
