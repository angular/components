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
import {combineLatest} from 'rxjs/observable/combineLatest';
import {map} from '../core/rxjs/index';
import {MdPaginator} from '../paginator/index';
import {Subscription} from 'rxjs/Subscription';

/**
 * Data source that can be used for the MdTable or CdkTable. Provides a getter/setter for
 * the collection of data that should be displayed in the table.
 */
export class SimpleDataSource<T> extends DataSource<T> {
  set data(data: T[]) {
    this._baseData = data;
    this.refresh();
  }
  get data(): T[] { return this._baseData; }
  private _baseData: T[] = [];

  private _renderedData = new BehaviorSubject<T[]>([]);

  private _pageSubscription: Subscription;

  set paginator(paginator: MdPaginator) {
    if (this._pageSubscription) { this._pageSubscription.unsubscribe(); }
    this._paginator = paginator;
    this._pageSubscription = this._paginator.page.subscribe(() => { this.refresh(); });
  }
  get paginator(): MdPaginator { return this._paginator; }
  _paginator: MdPaginator;

  connect(collectionViewer: CollectionViewer): Observable<T[]> {
    return map.call(combineLatest(this._renderedData, collectionViewer.viewChange),
        ([data]) => data);
  }

  refresh() {
    let data = this.data.slice();

    if (this._paginator) {
      // Grab the page's slice of data.
      const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
      data = data.splice(startIndex, this._paginator.pageSize);
    }

    this._renderedData.next(data);
  }
}
