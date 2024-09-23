/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CollectionViewer, DataSource} from '@angular/cdk/collections';
import {BehaviorSubject, merge, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

/**
 * Data source for nested tree.
 *
 * The data source for nested tree doesn't have to consider node flattener, or the way to expand
 * or collapse. The expansion/collapsion will be handled by TreeControl and each non-leaf node.
 */
export class MatTreeNestedDataSource<T> extends DataSource<T> {
  /**
   * Data for the nested tree
   */
  get data() {
    return this._data.value;
  }
  set data(value: T[]) {
    this._data.next(value);
  }
  private readonly _data = new BehaviorSubject<T[]>([]);

  connect(collectionViewer: CollectionViewer): Observable<T[]> {
    return merge(...([collectionViewer.viewChange, this._data] as Observable<unknown>[])).pipe(
      map(() => this.data),
    );
  }

  disconnect() {
    // no op
  }
}
