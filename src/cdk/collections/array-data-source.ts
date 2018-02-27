/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Observable} from 'rxjs/Observable';
import {of as observableOf} from 'rxjs/observable/of';
import {DataSource} from './data-source';


/** DataSource wrapper for a native array. */
export class ArrayDataSource<T> implements DataSource<T> {
  constructor(private _data: T[] | Observable<T[]>) {}

  connect(): Observable<T[]> {
    return this._data instanceof Observable ? this._data : observableOf(this._data);
  }

  disconnect() {}
}
