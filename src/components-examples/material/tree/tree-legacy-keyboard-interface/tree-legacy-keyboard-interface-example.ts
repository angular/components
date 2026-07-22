import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ArrayDataSource} from '@angular/cdk/collections';
import {FlatTreeControl} from '@angular/cdk/tree';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {NOOP_TREE_KEY_MANAGER_FACTORY_PROVIDER} from '@angular/cdk/a11y';
import {MatTreeModule} from '@angular/material/tree';

/** Flat node with expandable and level information */
interface ExampleFlatNode {
  expandable: boolean;
  name: string;
  level: number;
}

/**
 * @title Tree with flat nodes
 */
@Component({
  selector: 'tree-legacy-keyboard-interface-example',
  templateUrl: 'tree-legacy-keyboard-interface-example.html',
  styleUrls: ['tree-legacy-keyboard-interface-example.css'],
  imports: [MatTreeModule, MatButtonModule, MatIconModule],
  providers: [NOOP_TREE_KEY_MANAGER_FACTORY_PROVIDER],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeLegacyKeyboardInterfaceExample {
  treeControl = new FlatTreeControl<ExampleFlatNode>(
    node => node.level,
    node => node.expandable,
  );

  dataSource = new ArrayDataSource(EXAMPLE_DATA);

  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;

  getParentNode(node: ExampleFlatNode) {
    const nodeIndex = EXAMPLE_DATA.indexOf(node);

    for (let i = nodeIndex - 1; i >= 0; i--) {
      if (EXAMPLE_DATA[i].level === node.level - 1) {
        return EXAMPLE_DATA[i];
      }
    }

    return null;
  }
}

const EXAMPLE_DATA: ExampleFlatNode[] = [
  {
    name: 'Fruit',
    expandable: true,
    level: 0,
  },
  {
    name: 'Apple',
    expandable: false,
    level: 1,
  },
  {
    name: 'Banana',
    expandable: false,
    level: 1,
  },
  {
    name: 'Fruit loops',
    expandable: false,
    level: 1,
  },
  {
    name: 'Vegetables',
    expandable: true,
    level: 0,
  },
  {
    name: 'Green',
    expandable: true,
    level: 1,
  },
  {
    name: 'Broccoli',
    expandable: false,
    level: 2,
  },
  {
    name: 'Brussels sprouts',
    expandable: false,
    level: 2,
  },
  {
    name: 'Orange',
    expandable: true,
    level: 1,
  },
  {
    name: 'Pumpkins',
    expandable: false,
    level: 2,
  },
  {
    name: 'Carrots',
    expandable: false,
    level: 2,
  },
];
