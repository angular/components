/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FlatTreeControl} from '@angular/cdk/tree';
import {Component} from '@angular/core';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import {Observable} from 'rxjs';
import {LoadMoreDatabase, LoadMoreFlatNode, LoadMoreNode} from './loadmore-database';


const LOAD_MORE = 'LOAD_MORE';

/**
 * When a node has a large number of children, only load part of the children, and display a
 * `Load more...` button to manually request for more data in the tree.
 */
@Component({
  moduleId: module.id,
  selector: 'loadmore-tree-demo',
  templateUrl: 'loadmore-tree-demo.html',
  styleUrls: ['loadmore-tree-demo.css'],
  providers: [LoadMoreDatabase]
})
export class LoadMoreTreeDemo {

  nodeMap: Map<string, LoadMoreFlatNode> = new Map<string, LoadMoreFlatNode>();

  treeControl: FlatTreeControl<LoadMoreFlatNode>;

  treeFlattener: MatTreeFlattener<LoadMoreNode, LoadMoreFlatNode>;

  // Flat tree data source
  dataSource: MatTreeFlatDataSource<LoadMoreNode, LoadMoreFlatNode>;

  constructor(private _database: LoadMoreDatabase) {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel,
      this.isExpandable, this.getChildren);

    this.treeControl = new FlatTreeControl<LoadMoreFlatNode>(this.getLevel, this.isExpandable);

    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    _database.dataChange.subscribe(data => {
      this.dataSource.data = data;
    });

    _database.initialize();
  }

  getChildren = (node: LoadMoreNode): Observable<LoadMoreNode[]> => { return node.childrenChange; };

  transformer = (node: LoadMoreNode, level: number) => {
    if (this.nodeMap.has(node.item)) {
      return this.nodeMap.get(node.item)!;
    }
    const newNode =
        new LoadMoreFlatNode(node.item, level, node.hasChildren, node.loadMoreParentItem);
    this.nodeMap.set(node.item, newNode);
    return newNode;
  }

  getLevel = (node: LoadMoreFlatNode) => { return node.level; };

  isExpandable = (node: LoadMoreFlatNode) => { return node.expandable; };

  hasChild = (_: number, _nodeData: LoadMoreFlatNode) => { return _nodeData.expandable; };

  isLoadMore = (_: number, _nodeData: LoadMoreFlatNode) => {
    return _nodeData.item.startsWith(LOAD_MORE);
  }

  /** Load more nodes from data source */
  loadMore(item: string) {
    this._database.loadMore(item);
  }

  loadChildren(node: LoadMoreFlatNode) {
    this._database.loadMore(node.item, true);
  }
}
