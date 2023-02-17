import {ArrayDataSource} from '@angular/cdk/collections';
import {CdkTree} from '@angular/cdk/tree';
import {Component, ViewChild} from '@angular/core';
import {timer} from 'rxjs';
import {mapTo} from 'rxjs/operators';
import {NestedFoodNode, NESTED_DATA} from '../tree-data';

function* allNodes(nodes: NestedFoodNode[]): Iterable<NestedFoodNode> {
  for (const node of nodes) {
    yield node;
    if (node.children) {
      yield* allNodes(node.children);
    }
  }
}

/**
 * @title Tree with flat nodes
 */
@Component({
  selector: 'cdk-tree-flat-children-accessor-example',
  templateUrl: 'cdk-tree-flat-children-accessor-example.html',
  styleUrls: ['cdk-tree-flat-children-accessor-example.css'],
})
export class CdkTreeFlatChildrenAccessorExample {
  @ViewChild(CdkTree)
  tree!: CdkTree<NestedFoodNode>;

  childrenAccessor = (dataNode: NestedFoodNode) => timer(100).pipe(mapTo(dataNode.children ?? []));

  dataSource = new ArrayDataSource(NESTED_DATA);

  hasChild = (_: number, node: NestedFoodNode) => !!node.children?.length;

  getParentNode(node: NestedFoodNode) {
    for (const parent of allNodes(NESTED_DATA)) {
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
