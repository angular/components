import {TreeDataSource, MdTreeViewData} from '@angular/material';
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

export class JsonDataSource extends TreeDataSource<any> {
  dottedLineLevels = new Map<any, number[]>();
  flat: boolean = false;

  _renderedData: any[] = [];

  _filteredData = new BehaviorSubject<any>([]);
  get filteredData(): any { return this._filteredData.value; }


  set data(value: any) {
    let tree = this.buildJsonTree(value);
    this._filteredData.next(tree);
  }

  constructor() {
    super();
  }

  connectTree(viewChange: Observable<MdTreeViewData>): Observable<UserData[]> {

    return Observable.combineLatest([viewChange, this.flattenNodes(this._filteredData)]).map((result: any[]) => {
      const [view, displayData] = result;
      console.log(displayData);
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

  getChildren(node: any): any[] {
    return node.children;
  }

  flattenNodes(structuredData: Observable<any[]>): Observable<any[]> {
    return Observable.combineLatest(structuredData, this.expandChange).map((result: any[]) => {
      let [dataNodes, selectionChange] = result;
      let flatNodes: any[] = [];
      dataNodes.forEach((node: any) => {
        this._flattenNode(node, 0, flatNodes);
      });
      return this.flat ? flatNodes : dataNodes;
    });
  }
  _flattenNode(node: any, level: number, flatNodes: any[]) {
    let children = this.getChildren(node);
    let selected = this.expansionModel.isSelected(node);
    this.levelMap.set(node, level);

    this.indexMap.set(node, flatNodes.length);
    flatNodes.push(node);

    if (!!children && selected) {

      children.forEach((child, index) => {
        this.parentMap.set(child, node);
        this._flattenNode(child, level + 1, flatNodes);

        let dottedLineLevels = this.dottedLineLevels.get(node)|| [];
        dottedLineLevels = dottedLineLevels.slice();
        if (index != children.length - 1) {
          dottedLineLevels.push(level);
        }
        this.dottedLineLevels.set(child, dottedLineLevels);

      });
    }
  }

  childrenMap: Map<string, string[]> = new Map<string, string[]>();

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
        console.log(`json key value ${k}: ${v} with children ${node.children}`)
      } else {
        console.log(`json key value ${k}: ${v}`)
        node.value = v;
      }
      data.push(node);
    }
    return data;
  }
}