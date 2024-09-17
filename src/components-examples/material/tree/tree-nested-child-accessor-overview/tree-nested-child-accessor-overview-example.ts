import {NestedTreeControl} from '@angular/cdk/tree';
import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatTreeNestedDataSource, MatTreeModule} from '@angular/material/tree';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';

/**
 * Food data with nested structure.
 * Each node has a name and an optional list of children.
 */
interface FoodNode {
  name: string;
  children?: FoodNode[];
}

const TREE_DATA: FoodNode[] = [
  {
    name: 'Fruit',
    children: [{name: 'Apple'}, {name: 'Banana'}, {name: 'Fruit loops'}],
  },
  {
    name: 'Vegetables',
    children: [
      {
        name: 'Green',
        children: [{name: 'Broccoli'}, {name: 'Brussels sprouts'}],
      },
      {
        name: 'Orange',
        children: [{name: 'Pumpkins'}, {name: 'Carrots'}],
      },
    ],
  },
];

/**
 * @title Tree with nested nodes (childrenAccessor)
 */
@Component({
  selector: 'tree-nested-child-accessor-overview-example',
  templateUrl: 'tree-nested-child-accessor-overview-example.html',
  styleUrl: 'tree-nested-child-accessor-overview-example.css',
  standalone: true,
  imports: [MatTreeModule, MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeNestedChildAccessorOverviewExample {
  childrenAccessor = (node: FoodNode) => node.children ?? [];

  dataSource = TREE_DATA;

  hasChild = (_: number, node: FoodNode) => !!node.children && node.children.length > 0;
}
