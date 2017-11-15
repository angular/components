/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CollectionViewer, DataSource} from '@angular/cdk/collections';
import {FlatTreeControl, TreeControl} from '@angular/cdk/tree';
import {Observable} from 'rxjs/Observable';
import {merge} from 'rxjs/observable/merge';
import {map} from 'rxjs/operators/map';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {JsonNode, JsonDatabase} from './json-database';

/** Flat node with expandable and level information */
export class JsonFlatNode {
  key: string;
  value: any;
  level: number;
  expandable: boolean;
}

function _flattenNode(node: JsonNode, level: number,
                      resultNodes: JsonFlatNode[], parentMap: boolean[]) {
  let flatNode: JsonFlatNode = new JsonFlatNode();
  flatNode.key = node.key;
  flatNode.value = node.value;
  flatNode.level = level;
  flatNode.expandable = !!node.children;
  resultNodes.push(flatNode);

  if (flatNode.expandable) {
    node.children.forEach((child, index) => {
      let childParentMap: boolean[] = parentMap.slice();
      childParentMap.push(index != node.children.length - 1);
      _flattenNode(child, level + 1, resultNodes, childParentMap);
    });
  }
  return resultNodes;
}

/** Tree flattener to transfrom JsonNode to JsonFlatNode */
export function flattenNodes(structuredData: JsonNode[]): JsonFlatNode[] {
  let resultNodes: JsonFlatNode[] = [];
  structuredData.forEach(node => _flattenNode(node, 0, resultNodes, []));
  return resultNodes;
}

export function expandFlattenedNodes(nodes: JsonFlatNode[],
                            treeControl: TreeControl<JsonFlatNode>): JsonFlatNode[] {
  let results: JsonFlatNode[] = [];
  let currentExpand: boolean[] = [];
  currentExpand[0] = true;

  nodes.forEach((node) => {
    let expand = true;
    for (let i = 0; i <= node.level; i++) {
      expand = expand && currentExpand[i];
    }
    if (expand) {
      results.push(node);
    }
    if (node.expandable) {
      currentExpand[node.level + 1] = treeControl.isExpanded(node);
    }
  });
  return results;
}

/** Flat data source */
export class FlatDataSource implements DataSource<any> {
  _flattenedData = new BehaviorSubject<any>([]);
  get flattenedData() { return this._flattenedData.value; }

  _expandedData = new BehaviorSubject<any>([]);
  get expandedData() { return this._expandedData.value; }

  constructor(database: JsonDatabase, private treeControl: FlatTreeControl<JsonFlatNode>) {
    database.dataChange.subscribe((tree) => {
      this._flattenedData.next(flattenNodes(tree));
      this.treeControl.dataNodes = this.flattenedData;
    });
  }

  connect(collectionViewer: CollectionViewer): Observable<JsonFlatNode[]> {
    return merge([
        collectionViewer.viewChange,
        this.treeControl.expansionModel.onChange,
        this._flattenedData])
      .pipe(map(() => {
        this._expandedData.next(
            expandFlattenedNodes(this.flattenedData, this.treeControl));
        return this.expandedData;
      }));
  }

  disconnect() {
  }
}

