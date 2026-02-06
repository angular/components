import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatTreeModule} from '@angular/material/tree';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';

interface Node {
  name: string;
  children?: Node[];
}

/**
 * @title Testing with MatTreeHarness
 */
@Component({
  selector: 'tree-harness-example',
  templateUrl: 'tree-harness-example.html',
  imports: [MatTreeModule, MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeHarnessExample {
  dataSource = EXAMPLE_DATA;

  childrenAccessor = (node: Node) => node.children ?? [];

  hasChild = (_: number, node: Node) => !!node.children && node.children.length > 0;
}

const EXAMPLE_DATA: Node[] = [
  {
    name: 'Flat Group 1',
    children: [{name: 'Flat Leaf 1.1'}, {name: 'Flat Leaf 1.2'}, {name: 'Flat Leaf 1.3'}],
  },
  {
    name: 'Flat Group 2',
    children: [
      {
        name: 'Flat Group 2.1',
        children: [{name: 'Flat Leaf 2.1.1'}, {name: 'Flat Leaf 2.1.2'}, {name: 'Flat Leaf 2.1.3'}],
      },
    ],
  },
];
