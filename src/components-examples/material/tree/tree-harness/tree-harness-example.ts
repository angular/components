import {FlatTreeControl} from '@angular/cdk/tree';
import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatTreeFlatDataSource, MatTreeFlattener, MatTreeModule} from '@angular/material/tree';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';

interface Node {
  name: string;
  children?: Node[];
}

interface ExampleFlatNode {
  expandable: boolean;
  name: string;
  level: number;
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
  private _transformer = (node: Node, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level: level,
    };
  };

  treeControl = new FlatTreeControl<ExampleFlatNode>(
    node => node.level,
    node => node.expandable,
  );

  treeFlattener = new MatTreeFlattener(
    this._transformer,
    node => node.level,
    node => node.expandable,
    node => node.children,
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  constructor() {
    this.dataSource.data = EXAMPLE_DATA;
  }

  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;
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
