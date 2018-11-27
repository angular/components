/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Observable} from 'rxjs';
import {ListRange} from '../collections';

export interface CdkVirtualScrollAdapter<T> {
  dataStream: Observable<T[] | ReadonlyArray<T>>;
  measureRangeSize(range: ListRange, orientation: 'horizontal' | 'vertical'): number;
}
