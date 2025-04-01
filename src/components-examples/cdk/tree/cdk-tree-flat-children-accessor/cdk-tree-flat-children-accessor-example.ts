import {ArrayDataSource} from '@angular/cdk/collections';
import {CdkTree, CdkTreeModule} from '@angular/cdk/tree';
import {ChangeDetectionStrategy, Component, ViewChild} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {timer} from 'rxjs';
import {mapTo} from 'rxjs/operators';
import {NestedFoodNode, NESTED_DATA} from './cdk-tree-flat-children-accessor-example-data';

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

  dataSource = new ArrayDataSource(NESTED_DATA);

  hasChild = (_: number, node: NestedFoodNode) => !!node.children?.length;

  getParentNode(node: NestedFoodNode) {
    for (const parent of flattenNodes(NESTED_DATA)) {
      if (parent.children?.includes(node)) {
        return parent;
      }
    }

    return null;
  }

  shouldRender(node: NestedFoodNode) {
    let parent = this.getParentNode(node);
    while (parent) {
      if (!this.tree.isExpanded(parent)) {
        return false;
      }
      parent = this.getParentNode(parent);
    }
    return true;
  }
}
