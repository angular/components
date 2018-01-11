/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BaseTreeControl} from './base-tree-control';

/** Flat tree control. Able to expand/collapse a subtree recursively for flattened tree. */
export class FlatTreeControl<T> extends BaseTreeControl<T> {

  _dataNodes: T[];
  set dataNodes(newData: T[]) {
    this._dataNodes = newData;

    let currentParent: T[] = [];
    for (let i = 0; i < this.dataNodes.length; i++) {
      const level = this.getLevel(this.dataNodes[i]);
      currentParent[level] = this.dataNodes[i];
      if (level > 0) {
        const parent = currentParent[level - 1];
        this.parentMap.set(this.dataNodes[i], parent);
      }
    }
  }
  get dataNodes(): T[] {
    return this._dataNodes;
  }

  /** Construct with flat tree data node functions getLevel and isExpandable. */
  constructor(public getLevel: (dataNode: T) => number,
              public isExpandable: (dataNode: T) => boolean) {
    super();
  }

  /**
   * Gets a list of the data node's subtree of descendent data nodes.
   *
   * To make this working, the `dataNodes` of the TreeControl must be flattened tree nodes
   * with correct levels.
   */
  getDescendants(dataNode: T): T[] {
    const startIndex = this.dataNodes.indexOf(dataNode);
    const results: T[] = [];
    const nodeLevel = this.getLevel(dataNode);

    // Goes through flattened tree nodes in the `dataNodes` array, and get all descendants.
    // The level of descendants of a tree node must be greater than the level of the given
    // tree node.
    // If we reach a node whose level is equal to the level of the tree node, we hit a sibling.
    // If we reach a node whose level is greater than the level of the tree node, we hit a
    // sibling of an ancestor.
    for (let i = startIndex + 1; i < this.dataNodes.length; i++) {
      if (nodeLevel >= this.getLevel(this.dataNodes[i])) {
        break;
      }
      results.push(this.dataNodes[i]);
    }
    return results;
  }

  /**
   * Expands all data nodes in the tree.
   *
   * To make this working, the `dataNodes` variable of the TreeControl must be set to all flattened
   * data nodes of the tree.
   */
  expandAll(): void {
    const expandables = this.dataNodes.filter(node => this.isExpandable(node));
    this.expansionModel.select(...expandables);
  }

  /** Get the previous visible node of a given node */
  getPrevious(dataNode: T): T | undefined {
    const index = this.dataNodes.indexOf(dataNode);
    if (index > 0) {
      return this.dataNodes[index - 1];
    }
  }

  /** Get the next visible node of a given node */
  getNext(dataNode: T): T | undefined {
    const index = this.dataNodes.indexOf(dataNode);
    if (index < this.dataNodes.length - 1) {
      return this.dataNodes[index + 1];
    }
  }

  /** Get the first child of a given node. Return undefined if no children */
  getFirstChild(dataNode: T): T | undefined {
    if (this.isExpanded(dataNode)) {
      return this.getNext(dataNode);
    }
  }

  getFirstNode(): T | undefined {
    return this.dataNodes[0];
  }

  getLastNode(): T | undefined {
    return this.dataNodes[this.dataNodes.length - 1];
  }
}
