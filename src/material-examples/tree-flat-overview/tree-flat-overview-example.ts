import {Component} from '@angular/core';
import {MatExpandableDataSource} from '@angular/material/tree';

/**
 * Food data with nested structure.
 * Each node has a name and an optiona list of children.
 */
interface FoodNode {
  name: string;
  expandable: boolean;
  level: number;
}

const TREE_DATA: FoodNode[] = [
  { name: 'Fruit', expandable: true, level: 0 },
  { name: 'Apple', expandable: false, level: 1 },
  { name: 'Banana', expandable: false, level: 1 }
];

/**
 * @title Tree with flat nodes
 */
@Component({
  selector: 'tree-flat-overview-example',
  templateUrl: 'tree-flat-overview-example.html',
  styleUrls: ['tree-flat-overview-example.css'],
})
export class TreeFlatOverviewExample {
  dataSource = new MatExpandableDataSource<FoodNode>(node => node.level, node => node.expandable);
  treeControl = this.dataSource._treeControl;

  constructor() {
    this.dataSource.data = TREE_DATA;
  }

  hasChild = (_: number, node: FoodNode) => node.expandable;
}
