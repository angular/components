/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CollectionViewer, DataSource} from '@angular/cdk/collections';
import {Observable} from 'rxjs/Observable';
import {merge} from 'rxjs/observable/merge';
import {map} from 'rxjs/operators/map';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

import {JsonNode, JsonDatabase} from './json-database';

export class JsonNestedDataSource implements DataSource<any> {
  _renderedData = new BehaviorSubject<JsonNode[]>([]);
  get renderedData(): JsonNode[] { return this._renderedData.value; }

  constructor(private database: JsonDatabase) {}

  connect(collectionViewer: CollectionViewer): Observable<JsonNode[]> {
    return merge([collectionViewer.viewChange, this.database.dataChange])
      .pipe(map(() => {
        this._renderedData.next(this.database.data);
        return this.renderedData;
      }));
  }

  disconnect() { }
}

