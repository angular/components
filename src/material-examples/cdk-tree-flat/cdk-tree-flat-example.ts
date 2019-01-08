import {Component} from '@angular/core';
import {MatTreeDefaultFlatDataSource, NodeData, FlatNodeData}
       from '@angular/material/tree';

/**
 * Food data with nested structure.
 * Each node has a name and an optional list of children.
 */
const TREE_DATA: NodeData[] = [
  {
    name: 'Fruit',
    children: [
      {name: 'Apple'},
      {name: 'Banana'},
      {name: 'Fruit loops'},
    ]
  }, {
    name: 'Vegetables',
    children: [
      {
        name: 'Green',
        children: [
          {name: 'Broccoli'},
          {name: 'Brussel sprouts'},
        ]
      }, {
        name: 'Orange',
        children: [
          {name: 'Pumpkins'},
          {name: 'Carrots'},
        ]
      },
    ]
  },
];


/**
 * @title Tree with flat nodes
 */
@Component({
  selector: 'cdk-tree-flat-example',
  templateUrl: 'cdk-tree-flat-example.html',
  styleUrls: ['cdk-tree-flat-example.css'],
})
export class CdkTreeFlatExample {
  dataSource = new MatTreeDefaultFlatDataSource(TREE_DATA);
  treeControl = this.dataSource.getTreeControl();

  constructor() {
    this.dataSource.data = TREE_DATA;
  }

  hasChild = (_: number, node: FlatNodeData) => node.expandable;
}
