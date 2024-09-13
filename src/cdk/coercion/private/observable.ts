/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {Observable, isObservable, of as observableOf} from 'rxjs';

/**
 * Given either an Observable or non-Observable value, returns either the original
 * Observable, or wraps it in an Observable that emits the non-Observable value.
 */
export function coerceObservable<T>(data: T | Observable<T>): Observable<T> {
  if (!isObservable(data)) {
    return observableOf(data);
  }
  return data;
}
