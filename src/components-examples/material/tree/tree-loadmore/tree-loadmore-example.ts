/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {ChangeDetectionStrategy, Component, Injectable, inject, signal} from '@angular/core';
import {MatTreeModule} from '@angular/material/tree';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {ENTER, SPACE} from '@angular/cdk/keycodes';

/** Node data with optional children */
interface TreeNode {
  name: string;
  parent: string | null;
  expandable: boolean;
  isLoadMore: boolean;
  children?: TreeNode[];
}

/** Number of nodes loaded at a time */
const batchSize = 3;

/**
 * A database that only loads part of the data initially. After user clicks on the `Load more`
 * button, more data will be loaded.
 */
@Injectable()
export class LoadmoreDatabase {
  /** Map of node name to node */
  private _nodes = new Map<string, TreeNode>();

  /** Example data */
  rootNodes: string[] = ['Vegetables', 'Fruits'];
  childMap = new Map<string, string[]>([
    ['Fruits', ['Apple', 'Orange', 'Banana']],
    ['Vegetables', ['Tomato', 'Potato', 'Onion']],
    [
      'Apple',
      [
        'Gala',
        'Braeburn',
        'Fuji',
        'Macintosh',
        'Golden Delicious',
        'Red Delicious',
        'Empire',
        'Granny Smith',
        'Cameo',
        'Baldwin',
        'Jonagold',
      ],
    ],
    ['Onion', ['Yellow', 'White', 'Purple', 'Green', 'Shallot', 'Sweet', 'Red', 'Leek']],
  ]);

  initialize(): TreeNode[] {
    return this.rootNodes.map(name => this._getOrCreateNode(name, null));
  }

  private _getOrCreateNode(name: string, parent: string | null): TreeNode {
    if (!this._nodes.has(name)) {
      this._nodes.set(name, {
        name,
        parent,
        expandable: this.childMap.has(name),
        isLoadMore: false,
        children: undefined,
      });
    }
    return this._nodes.get(name)!;
  }

  /** Load children for a node, with pagination support */
  loadChildren(parentName: string, onlyFirstTime = false): void {
    const parent = this._nodes.get(parentName);
    const childNames = this.childMap.get(parentName);
    if (!parent || !childNames) {
      return;
    }

    if (onlyFirstTime && parent.children && parent.children.length > 0) {
      return;
    }

    const currentChildCount = parent.children?.filter(c => !c.isLoadMore).length ?? 0;
    const newChildCount = currentChildCount + batchSize;

    const children = childNames
      .slice(0, newChildCount)
      .map(name => this._getOrCreateNode(name, parentName));

    // Add "Load more" node if there are more children
    if (newChildCount < childNames.length) {
      children.push({
        name: `LOAD_MORE_${parentName}_${Date.now()}`,
        parent: parentName,
        expandable: false,
        isLoadMore: true,
      });
    }

    parent.children = children;
  }
}

/**
 * @title Tree with partially loaded data
 */
@Component({
  selector: 'tree-loadmore-example',
  templateUrl: 'tree-loadmore-example.html',
  styleUrl: 'tree-loadmore-example.css',
  providers: [LoadmoreDatabase],
  imports: [MatTreeModule, MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeLoadmoreExample {
  private _database = inject(LoadmoreDatabase);

  dataSource = signal<TreeNode[]>([]);

  childrenAccessor = (node: TreeNode) => node.children ?? [];

  hasChild = (_: number, node: TreeNode) => node.expandable;

  isLoadMore = (_: number, node: TreeNode) => node.isLoadMore;

  constructor() {
    this.dataSource.set(this._database.initialize());
  }

  loadChildren(node: TreeNode) {
    this._database.loadChildren(node.name, true);
    // Trigger change detection by updating the signal
    this.dataSource.set([...this.dataSource()]);
  }

  /** Load more nodes when clicking on "Load more" node. */
  loadOnClick(event: MouseEvent, node: TreeNode) {
    this._loadSiblings(event.target as HTMLElement, node);
  }

  /** Load more nodes on keypress when focused on "Load more" node */
  loadOnKeypress(event: KeyboardEvent, node: TreeNode) {
    if (event.keyCode === ENTER || event.keyCode === SPACE) {
      this._loadSiblings(event.target as HTMLElement, node);
    }
  }

  private _loadSiblings(nodeElement: HTMLElement, node: TreeNode) {
    if (node.parent) {
      // Store a reference to the sibling of the "Load More" node before it is removed from the DOM
      const previousSibling = nodeElement.previousElementSibling;

      // Synchronously load data.
      this._database.loadChildren(node.parent);

      // Trigger change detection
      this.dataSource.set([...this.dataSource()]);

      const focusDestination = previousSibling?.nextElementSibling || previousSibling;

      if (focusDestination) {
        // Restore focus.
        (focusDestination as HTMLElement).focus();
      }
    }
  }
}
