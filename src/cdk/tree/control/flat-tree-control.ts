/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BaseTreeControl} from './base-tree-control';

/** Flat tree control. Able to expand/collapse a subtree recursively for FlatNode type. */
export class FlatTreeControl<T> extends BaseTreeControl<T> {

  /** Construct with flat tree data node functions getLevel and isExpandable. */
  constructor(public getLevel: (dataNode: T) => number,
              public isExpandable: (dataNode: T) => boolean) {
    super();
  }

  /**
   * Gets a list of descendent data nodes of a subtree rooted at given data node recursively.
   *
   * To make this working, the `dataNodes` of the TreeControl must be set correctly.
   */
  getDescendants(dataNode: T): T[] {
    const startIndex = this.dataNodes.indexOf(dataNode);
    const results: T[] = [];
    let i = startIndex + 1;

    for (;
        i < this.dataNodes.length && this.getLevel(dataNode) < this.getLevel(this.dataNodes[i]);
        i++) {
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
    this.expansionModel.select(...this.dataNodes);
  }
}
