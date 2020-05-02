/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Observable} from 'rxjs';

/** Function that can be used to get the children of a tree node. */
export type GetChildrenFn<T> = (node: T) =>
  Observable<T[] | ReadonlyArray<T>> | T[] | ReadonlyArray<T> | undefined | null;
