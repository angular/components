/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DataSource} from './data-source';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

/**
 * Array-based data source that can be used to connect to a CollectionViewer. Will trigger an
 * update to the CollectionViewer whenever a new data array is set.
 */
export class ArrayDataSource<T> implements DataSource<T> {
  /** Stream that emits when a new data array is set on the data source. */
  private _data: BehaviorSubject<T[]>;
  set data(data: T[]) { this._data.next(data); }
  get data() { return this._data.value; }

  constructor(initialData: T[] = []) {
    this._data = new BehaviorSubject<T[]>(initialData);
  }

  /**
   * Triggers an update to the CollectionViewer. Should be used when elements are added, removed,
   * or moved in the data array and should be reflected in the CollectionViewer.
   */
  refresh() { this._data.next(this.data); }

  /**
   * Used by the CollectionViewer. Called when it connects to the data source.
   * @docs-private
   */
  connect() { return this._data; }

  /**
   * Used by the CollectionViewer. Called when it is destroyed. No-op.
   * @docs-private
   */
  disconnect() { }
}
