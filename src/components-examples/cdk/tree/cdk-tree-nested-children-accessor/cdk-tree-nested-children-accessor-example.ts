import {ArrayDataSource} from '@angular/cdk/collections';
import {CdkTree, CdkTreeModule} from '@angular/cdk/tree';
import {ChangeDetectionStrategy, Component, ViewChild} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {NestedFoodNode, NESTED_DATA} from '../tree-data';

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
 * @title Tree with nested nodes using childAccessor
 */
@Component({
  selector: 'cdk-tree-nested-children-accessor-example',
  templateUrl: 'cdk-tree-nested-children-accessor-example.html',
  styleUrls: ['cdk-tree-nested-children-accessor-example.css'],
  standalone: true,
  imports: [CdkTreeModule, MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CdkTreeNestedChildrenAccessorExample {
  @ViewChild(CdkTree) tree: CdkTree<NestedFoodNode>;

  childrenAccessor = (dataNode: NestedFoodNode) => dataNode.children ?? [];

  dataSource = new ArrayDataSource(NESTED_DATA);

  hasChild = (_: number, node: NestedFoodNode) => !!node.children && node.children.length > 0;

  getParentNode(node: NestedFoodNode) {
    for (const parent of flattenNodes(NESTED_DATA)) {
      if (parent.children?.includes(node)) {
        return parent;
      }
    }

    return null;
  }

  shouldRender(node: NestedFoodNode): boolean {
    // This node should render if it is a root node or if all of its ancestors are expanded.
    const parent = this.getParentNode(node);
    return !parent || (!!this.tree?.isExpanded(parent) && this.shouldRender(parent));
  }
}
