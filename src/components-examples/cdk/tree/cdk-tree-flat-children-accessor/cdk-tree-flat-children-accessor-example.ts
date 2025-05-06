import {ArrayDataSource} from '@angular/cdk/collections';
import {CdkTree, CdkTreeModule} from '@angular/cdk/tree';
import {ChangeDetectionStrategy, Component, ViewChild} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {timer} from 'rxjs';
import {mapTo} from 'rxjs/operators';

/**
 * Food data with nested structure.
 * Each node has a name and an optional list of children.
 */
interface NestedFoodNode {
  name: string;
  children?: NestedFoodNode[];
}

function flattenNodes(nodes: NestedFoodNode[]): NestedFoodNode[] {
  const flattenedNodes = [];
  for (const node of nodes) {
    flattenedNodes.push(node);
    if (node.children) {
      flattenedNodes.push(...flattenNodes(node.children));
    }
  }
  return flattenedNodes;
}

/**
 * @title Tree with flat nodes
 */
@Component({
  selector: 'cdk-tree-flat-children-accessor-example',
  templateUrl: 'cdk-tree-flat-children-accessor-example.html',
  styleUrls: ['cdk-tree-flat-children-accessor-example.css'],
  imports: [CdkTreeModule, MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CdkTreeFlatChildrenAccessorExample {
  @ViewChild(CdkTree)
  tree!: CdkTree<NestedFoodNode>;

  childrenAccessor = (dataNode: NestedFoodNode) => timer(100).pipe(mapTo(dataNode.children ?? []));

  dataSource = new ArrayDataSource(EXAMPLE_DATA);

  hasChild = (_: number, node: NestedFoodNode) => !!node.children?.length;

  getParentNode(node: NestedFoodNode) {
    for (const parent of flattenNodes(EXAMPLE_DATA)) {
      if (parent.children?.includes(node)) {
        return parent;
      }
    }

    return null;
  }
}

const EXAMPLE_DATA: NestedFoodNode[] = [
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
