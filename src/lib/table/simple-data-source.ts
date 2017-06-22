/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CollectionViewer, DataSource} from '../core/data-table/data-source';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

/**
 * Data source that can be used for the MdTable or CdkTable. Provides a getter/setter for
 * the collection of data that should be displayed in the table.
 */
export class SimpleDataSource<T> extends DataSource<T> {
  set data(data: T[]) { this._dataChange.next(data); }
  get data(): T[] { return this._dataChange.getValue(); }
  _dataChange: BehaviorSubject<T[]> = new BehaviorSubject([]);

  connect(collectionViewer: CollectionViewer): Observable<T[]> {
    return Observable.combineLatest(collectionViewer.viewChange, this._dataChange)
        .map(() => this.data);
  }

  refresh() {
    this._dataChange.next(this.data);
  }
}
