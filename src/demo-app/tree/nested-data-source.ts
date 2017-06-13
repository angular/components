import {CollectionViewer, TreeDataSource, TreeAdapter, FlatTreeControl, TreeControl, FlatNode, NestedNode, SelectionModel} from '@angular/material';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/pairwise';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/combineLatest';
import {PeopleDatabase, UserData} from './person-database';
import {
  IterableDiffers,
  IterableDiffer,
} from '@angular/core';

export interface SimpleTreeNode {
  children: SimpleTreeNode[];
}

export class JsonNode implements SimpleTreeNode {
  children: JsonNode[];
  key: string;
  value: any;
}
export class JsonNestedNode implements NestedNode {
  key: string;
  value: any;
  children: JsonNestedNode[];
  getChildren(): Observable<JsonNestedNode[]> {
    return Observable.of(this.children);
  }
}

export class JsonNestedDataSource implements TreeDataSource<any> {
  dottedLineLevels = new Map<any, number[]>();
  flat: boolean = false;

  _renderedData: any[] = [];

  _filteredData = new BehaviorSubject<any>([]);
  get filteredData(): any { return this._filteredData.value; }

  set data(value: any) {
    let tree = this.buildJsonTree(value, 0);
    this._filteredData.next(tree);
  }

  connect(collectionViewer: CollectionViewer): Observable<JsonNestedNode[]> {
    return Observable.combineLatest([collectionViewer.viewChanged, this._filteredData])
      .map((results: any[]) => {
        let [view, displayData] = results;
        // Set the rendered rows length to the virtual page size. Fill in the data provided
        // from the index start until the end index or pagination size, whichever is smaller.
        this._renderedData.length = displayData.length;

        const buffer = 20;
        const rangeStart = Math.max(0, view.start - buffer);
        const rangeEnd = Math.min(displayData.length, view.end + buffer);
        for (let i = rangeStart; i < rangeEnd; i++) {
          this._renderedData[i] = displayData[i];
        }
        return this._renderedData; // Currently ignoring the view
      });
  }

  buildJsonTree(value: any, level: number) {
    let data: any[] = [];
    for (let k in value) {
      let v = value[k];
      let node = new JsonNestedNode();
      node.key = `${k}`;
      if (v === null || v === undefined) {
        // no action
      } else if (typeof v === 'object') {
        node.children = this.buildJsonTree(v, level + 1);
      } else {
        node.value = v;
      }
      data.push(node);
    }
    return data;
  }

  addChild(key: string, value: string, node: JsonNode) {
    if (!node.children) {
      node.children = [];
    }
    let child = new JsonNode();
    child.key = key;
    child.value = value;
    node.children.push(child);
    this._filteredData.next(this._filteredData.value);
  }
}
