/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {FlatTreeControl, NestedTreeControl} from '@angular/cdk/tree';
import {of as ofObservable} from 'rxjs/observable/of';

import {JsonNode, JsonDatabase} from './json-database';
import {FlatDataSource, JsonFlatNode} from './flat-data-source';
import {JsonNestedDataSource} from './nested-data-source';


@Component({
  moduleId: module.id,
  selector: 'tree-demo',
  templateUrl: 'tree-demo.html',
  styleUrls: ['tree-demo.css'],
})
export class TreeDemo {
  // Flat tree control
  treeControl: FlatTreeControl<JsonFlatNode>;

  // Nested tree control
  nestedTreeControl: NestedTreeControl<JsonNode>;

  // Flat tree data source
  dataSource: FlatDataSource;

  // Nested tree data source
  nestedDataSource: JsonNestedDataSource;

  constructor(database: JsonDatabase) {
    // For flat tree
    this.treeControl = new FlatTreeControl<JsonFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new FlatDataSource(database, this.treeControl);

    // For nested tree
    this.nestedTreeControl = new NestedTreeControl<JsonNode>(this.getChildren);
    this.nestedDataSource = new JsonNestedDataSource(database);
  }

  getLevel = (node: JsonFlatNode) => { return node.level };

  isExpandable = (node: JsonFlatNode) => { return node.expandable; }

  getChildren = (node: JsonNode) => { return ofObservable(node.children); }

  hasChild = (_: number, _nodeData: JsonFlatNode) => { return _nodeData.expandable; }

  hasNestedChild = (_: number, nodeData: JsonNode) => {return !(nodeData.value); }
}
