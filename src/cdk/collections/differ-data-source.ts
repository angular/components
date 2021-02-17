/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DataSource} from './data-source';
import {IterableDiffer, IterableDiffers, TrackByFunction} from '@angular/core';
import {Subject, Observable} from 'rxjs';

/** DataSource wrapper for an iterable whose value might change. Emits when changes are detected. */
export class DifferDataSource<T> extends DataSource<T> {
  private _differ: IterableDiffer<T>;
  private _changes = new Subject<T[]>();

  constructor(
    private _differs: IterableDiffers,
    private _iterable: T[],
    trackBy?: TrackByFunction<T>) {

    super();
    this._differ = _differs.find(_iterable).create(trackBy);
  }

  connect(): Observable<T[] | ReadonlyArray<T>> {
    return this._changes;
  }

  disconnect() {
    this._changes.complete();
  }

  /** Checks the array for changes. */
  doCheck() {
    if (this._differ.diff(this._iterable)) {
      this._changes.next(this._iterable);
    }
  }

  /** Switches the `trackBy` function of the data source. */
  switchTrackBy(trackBy?: TrackByFunction<T>) {
    this._differ = this._differs.find(this._iterable).create(trackBy);
    this.doCheck();
  }
}
