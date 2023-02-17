import {ArrayDataSource} from '@angular/cdk/collections';
import {Component} from '@angular/core';
import {FlatFoodNode, FLAT_DATA} from '../tree-data';

/**
 * @title Tree with nested nodes
 */
@Component({
  selector: 'cdk-tree-nested-level-accessor-example',
  templateUrl: 'cdk-tree-nested-level-accessor-example.html',
  styleUrls: ['cdk-tree-nested-level-accessor-example.css'],
})
export class CdkTreeNestedLevelAccessorExample {
  levelAccessor = (dataNode: FlatFoodNode) => dataNode.level;

  dataSource = new ArrayDataSource(FLAT_DATA);

  hasChild = (_: number, node: FlatFoodNode) => node.expandable;

  getParentNode(node: FlatFoodNode) {
    const nodeIndex = FLAT_DATA.indexOf(node);

    for (let i = nodeIndex - 1; i >= 0; i--) {
      if (FLAT_DATA[i].level === node.level - 1) {
        return FLAT_DATA[i];
      }
    }

    return null;
  }

  shouldRender(node: FlatFoodNode) {
    let parent = this.getParentNode(node);
    while (parent) {
      if (!parent.isExpanded) {
        return false;
      }
      parent = this.getParentNode(parent);
    }
    return true;
  }
}
