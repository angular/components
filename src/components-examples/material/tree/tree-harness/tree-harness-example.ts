import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatTreeModule, MatTreeNestedDataSource} from '@angular/material/tree';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';

interface Node {
  name: string;
  children?: Node[];
}

const TREE_DATA: Node[] = [
  {
    name: 'Example Group 1',
    children: [{name: 'Example Leaf 1.1'}, {name: 'Example Leaf 1.2'}, {name: 'Example Leaf 1.3'}],
  },
  {
    name: 'Example Group 2',
    children: [
      {
        name: 'Example Group 2.1',
        children: [
          {name: 'Example Leaf 2.1.1'},
          {name: 'Example Leaf 2.1.2'},
          {name: 'Example Leaf 2.1.3'},
        ],
      },
    ],
  },
];

/**
 * @title Testing with MatTreeHarness
 */
@Component({
  selector: 'tree-harness-example',
  templateUrl: 'tree-harness-example.html',
  standalone: true,
  imports: [MatTreeModule, MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeHarnessExample {
  dataSource = new MatTreeNestedDataSource<Node>();

  constructor() {
    this.dataSource.data = TREE_DATA;
  }

  childrenAccessor = (node: Node) => node.children || [];

  hasChild = (_: number, node: Node) => !!node.children && node.children.length > 0;
}
