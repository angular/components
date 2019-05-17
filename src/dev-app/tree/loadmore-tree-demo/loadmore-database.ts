/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';


const LOAD_MORE = 'LOAD_MORE';

/** Nested node */
export class LoadMoreNode {
  childrenChange: BehaviorSubject<LoadMoreNode[]> = new BehaviorSubject<LoadMoreNode[]>([]);

  get children(): LoadMoreNode[] {
    return this.childrenChange.value;
  }

  constructor(public item: string,
              public hasChildren: boolean = false,
              public loadMoreParentItem: string | null = null) {}
}

/** Flat node with expandable and level information */
export class LoadMoreFlatNode {
  constructor(public item: string,
              public level: number = 1,
              public expandable: boolean = false,
              public loadMoreParentItem: string | null = null) {}
}

/**
 * A database that only load part of the data initially. After user clicks on the `Load more`
 * button, more data will be loaded.
 */
@Injectable()
export class LoadMoreDatabase {
  batchNumber = 2;
  dataChange: BehaviorSubject<LoadMoreNode[]> = new BehaviorSubject<LoadMoreNode[]>([]);
  nodeMap: Map<string, LoadMoreNode> = new Map<string, LoadMoreNode>();

  /** The data */
  rootLevelNodes = ['Vegetables', 'Fruits'];
  dataMap = new Map([
    ['Fruits', ['Apple', 'Orange', 'Banana']],
    ['Vegetables', ['Tomato', 'Potato', 'Onion']],
    ['Apple', ['Fuji', 'Macintosh']],
    ['Onion', ['Yellow', 'White', 'Purple', 'Green', 'Shallot', 'Sweet', 'Red', 'Leek']],
  ]);

  initialize() {
    const data = this.rootLevelNodes.map(name => this._generateNode(name));
    this.dataChange.next(data);
  }

  /** Expand a node whose children are not loaded */
  loadMore(item: string, onlyFirstTime: boolean = false) {
    if (!this.nodeMap.has(item) || !this.dataMap.has(item)) {
      return;
    }
    const parent = this.nodeMap.get(item)!;
    const children = this.dataMap.get(item)!;
    if (onlyFirstTime && parent.children!.length > 0) {
      return;
    }
    const newChildrenNumber = (parent.children!.length && parent.children!.length - 1)
        + this.batchNumber;
    const nodes = children.slice(0, newChildrenNumber)
        .map(name => this._generateNode(name));
    if (newChildrenNumber < children.length) {
      // Need a new load more node
      nodes.push(new LoadMoreNode(`${LOAD_MORE}_${item}`, false, item));
    }

    parent.childrenChange.next(nodes);
    this.dataChange.next(this.dataChange.value);
  }

  private _generateNode(item: string): LoadMoreNode {
    if (this.nodeMap.has(item)) {
      return this.nodeMap.get(item)!;
    }
    const result = new LoadMoreNode(item, this.dataMap.has(item));
    this.nodeMap.set(item, result);
    return result;
  }
}
