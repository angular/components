import {CollectionViewer, TreeDataSource, TreeAdapter, TreeControl} from '@angular/material';
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

export class JsonNode {
  key: string;
  value: any;
  children: any[];
}

export class JsonDataSource implements TreeDataSource<any> {
  dottedLineLevels = new Map<any, number[]>();
  flat: boolean = false;

  _renderedData: any[] = [];

  _flattenedData = new BehaviorSubject<any>([]);
  get flattenedData() { return this._flattenedData.value; }

  _filteredData = new BehaviorSubject<any>([]);
  get filteredData(): any { return this._filteredData.value; }


  set data(value: any) {
    let tree = this.buildJsonTree(value);
    this._filteredData.next(tree);
    console.log(`set filtered data`);
  }

  constructor(public treeAdapter: TreeAdapter<any>) {
    Observable.combineLatest([
      this.treeAdapter.treeControl.expandChange,
      this.treeAdapter.flattenNodes(
        this.getChildrenFunc, this._filteredData)])
      .map((result: any[]) => {
        console.log(`combine ${result}`);
      return this.treeAdapter.treeControl.flatNodes;
    });

  }

  connect(collectionViewer: CollectionViewer): Observable<UserData[]> {
    return collectionViewer.viewChanged.map((view) => {
      let displayData = flattenedData;
      console.log(displayData); console.log(`combineLatest in side `);
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

  getChildrenFunc(node: any): any[] {
    return node.children;
  }

  getChildren(node: any): Observable<any[]> {
    console.log(node);
    return Observable.of(node.children);
  }

  buildJsonTree(value: any) {
    let data: any[] = [];
    for (let k in value) {
      let v = value[k];
      let node = new JsonNode();
      node.key = `${k}`;
      if (v === null || v === undefined) {
        // no action
      } else if (typeof v === 'object') {
        node.children = this.buildJsonTree(v);
      } else {
        node.value = v;
      }
      data.push(node);
    }
    return data;
  }

  addChild(key: string, value: string, node: JsonNode) {
    console.log(node.children);
    if (!node.children) {
      node.children = [];
    }
    let child = new JsonNode();
    child.key = key;
    child.value = value;
    node.children.push(child);
    console.log(node);
    console.log(this.filteredData);
    this._filteredData.next(this._filteredData.value);
  }
}
