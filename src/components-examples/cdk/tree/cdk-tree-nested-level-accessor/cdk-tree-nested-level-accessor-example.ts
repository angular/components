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
}
