/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {FlatTreeControl, NestedTreeControl} from '@angular/cdk-experimental/tree';
import {MatTreeFlattener, MatTreeFlatDataSource, MatTreeNestedDataSource} from '@angular/material-experimental/tree';
import {of as ofObservable} from 'rxjs/observable/of';

import {JsonNode, JsonDatabase} from './json-database';
import {JsonFlatNode} from './flat-data-source';


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

  treeFlattener: MatTreeFlattener<JsonNode, JsonFlatNode>;

  // Flat tree data source
  dataSource: MatTreeFlatDataSource<JsonNode, JsonFlatNode>;

  // Nested tree data source
  nestedDataSource: MatTreeNestedDataSource<JsonNode>;

  constructor(database: JsonDatabase) {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel,
                                              this.isExpandable, this.getChildren);
    // For flat tree
    this.treeControl = new FlatTreeControl<JsonFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    // For nested tree
    this.nestedTreeControl = new NestedTreeControl<JsonNode>(this.getChildren);
    this.nestedDataSource = new MatTreeNestedDataSource();

    database.dataChange.subscribe(data => {
      console.log(`datachanges in demo`)
      this.dataSource.data = data;
      this.nestedDataSource.data = data;
    })
  }

  transformer = (node: JsonNode, level: number) => {
    let flatNode = new JsonFlatNode();
    flatNode.key = node.key;
    flatNode.value = node.value;
    flatNode.level = level;
    flatNode.expandable = !!node.children;
    return flatNode;
  };

  getLevel = (node: JsonFlatNode) => { return node.level; };

  isExpandable = (node: JsonFlatNode) => { return node.expandable; };

  getChildren = (node: JsonNode) => { return ofObservable(node.children); };

  hasChild = (_: number, _nodeData: JsonFlatNode) => { return _nodeData.expandable; };

  hasNestedChild = (_: number, nodeData: JsonNode) => {return !(nodeData.value); };
}
