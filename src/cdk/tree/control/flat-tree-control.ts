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

  /** Construct with flat tree node functions getLevel and isExpandable. */
  constructor(public getLevel: (node: T) => number, public isExpandable: (node: T) => boolean) {
    super();
  }

  /**
   * Gets a list of descendent nodes of a subtree rooted at given `node` recursively.
   *
   * To make this working, the `nodes` of the TreeControl must be set correctly.
   */
  getDescendants(node: T): T[] {
    const startIndex = this.nodes.indexOf(node);
    const results: T[] = [];
    let i = startIndex + 1;

    for (; i < this.nodes.length && this.getLevel(node) < this.getLevel(this.nodes[i]); i++) {
      results.push(this.nodes[i]);
    }
    return results;
  }

  /**
   * Expands all nodes in the tree.
   *
   * To make this working, the `nodes` of the TreeControl must be set correctly.
   */
  expandAll(): void {
    this.expansionModel.select(...this.nodes);
  }
}
