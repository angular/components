import {ArrayDataSource} from '@angular/cdk/collections';
import {CdkTreeModule} from '@angular/cdk/tree';
import {Component} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {FLAT_DATA, FlatFoodNode} from '../tree-data';

/**
 * @title Tree with nested nodes
 */
@Component({
  selector: 'cdk-tree-nested-level-accessor-example',
  templateUrl: 'cdk-tree-nested-level-accessor-example.html',
  styleUrls: ['cdk-tree-nested-level-accessor-example.css'],
  standalone: true,
  imports: [CdkTreeModule, MatButtonModule, MatIconModule],
})
export class CdkTreeNestedLevelAccessorExample {
  levelAccessor = (dataNode: FlatFoodNode) => dataNode.level;

  dataSource = new ArrayDataSource(FLAT_DATA);

  hasChild = (_: number, node: FlatFoodNode) => node.expandable;
}
