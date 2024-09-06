import {ChangeDetectionStrategy, Component, ViewChild} from '@angular/core';
import {MatTree, MatTreeModule} from '@angular/material/tree';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {ArrayDataSource} from '@angular/cdk/collections';

/**
 * Food data with a flat structure.
 * Each node has a name and the level it should display. The order
 * is used such that an item is a child of the previous item if the
 * level is increased.
 */
interface FoodNode {
  name: string;
  level: number;
}

const TREE_DATA: FoodNode[] = [
  {name: 'Fruit', level: 0},
  {name: 'Apple', level: 1},
  {name: 'Banana', level: 1},
  {name: 'Fruit loops', level: 1},
  {name: 'Vegetables', level: 0},
  {name: 'Green', level: 1},
  {name: 'Broccoli', level: 2},
  {name: 'Brussels spouts', level: 2},
  {name: 'Orange', level: 1},
  {name: 'Pumpkins', level: 2},
  {name: 'Carrots', level: 2},
];

/**
 * @title Tree with flat nodes
 */
@Component({
  selector: 'tree-flat-overview-example',
  templateUrl: 'tree-flat-overview-example.html',
  standalone: true,
  imports: [MatTreeModule, MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeFlatOverviewExample {
  @ViewChild(MatTree) tree: MatTree<FoodNode>;

  dataSource = new ArrayDataSource(TREE_DATA);

  levelAccessor = (dataNode: FoodNode) => dataNode.level;

  hasChild = (index: number, node: FoodNode) => {
    return node.level < TREE_DATA[index + 1]?.level;
  };

  shouldRender(node: FoodNode): boolean {
    // This node should render if it is a root node or if all of its ancestors are expanded.
    const parent = this._getParentNode(node);
    return !parent || (!!this.tree?.isExpanded(parent) && this.shouldRender(parent));
  }

  private _getParentNode(node: FoodNode) {
    const nodeIndex = TREE_DATA.indexOf(node);

    // Determine the node's parent by finding the first preceding node that's
    // one level shallower.
    for (let i = nodeIndex - 1; i >= 0; i--) {
      if (TREE_DATA[i].level === node.level - 1) {
        return TREE_DATA[i];
      }
    }

    return null;
  }
}
