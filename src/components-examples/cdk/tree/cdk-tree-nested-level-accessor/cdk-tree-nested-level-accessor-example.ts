import {ArrayDataSource} from '@angular/cdk/collections';
import {CdkTree, CdkTreeModule} from '@angular/cdk/tree';
import {ChangeDetectionStrategy, Component, ViewChild} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';

/** Flat node with expandable and level information */
interface FlatFoodNode {
  expandable: boolean;
  name: string;
  level: number;
  isExpanded?: boolean;
}

/**
 * @title Tree with nested nodes and level accessor
 */
@Component({
  selector: 'cdk-tree-nested-level-accessor-example',
  templateUrl: 'cdk-tree-nested-level-accessor-example.html',
  styleUrls: ['cdk-tree-nested-level-accessor-example.css'],
  imports: [CdkTreeModule, MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CdkTreeNestedLevelAccessorExample {
  @ViewChild(CdkTree) tree: CdkTree<FlatFoodNode>;

  levelAccessor = (dataNode: FlatFoodNode) => dataNode.level;

  dataSource = new ArrayDataSource(EXAMPLE_DATA);

  hasChild = (_: number, node: FlatFoodNode) => node.expandable;

  getParentNode(node: FlatFoodNode) {
    const nodeIndex = EXAMPLE_DATA.indexOf(node);

    // Determine the node's parent by finding the first preceding node that's
    // one level shallower.
    for (let i = nodeIndex - 1; i >= 0; i--) {
      if (EXAMPLE_DATA[i].level === node.level - 1) {
        return EXAMPLE_DATA[i];
      }
    }

    return null;
  }
}

const EXAMPLE_DATA: FlatFoodNode[] = [
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
