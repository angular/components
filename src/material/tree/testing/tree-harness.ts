/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarness, HarnessPredicate} from '@angular/cdk/testing';
import {
  TreeHarnessFilters,
  TreeNodeHarnessFilters
} from '@angular/material/tree/testing/tree-harness-filters';
import {
  MatNestedTreeNodeHarness,
  MatTreeNodeHarness
} from '@angular/material/tree/testing/node-harness';

export class MatTreeHarness extends ComponentHarness {
  /** The selector for the host element of a `MatTableHarness` instance. */
  static hostSelector = '.mat-tree';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a tree with specific attributes.
   * @param options Options for narrowing the search
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: TreeHarnessFilters = {}): HarnessPredicate<MatTreeHarness> {
    return new HarnessPredicate(MatTreeHarness, options);
  }

  async getNodes(filter: TreeNodeHarnessFilters = {}): Promise<MatTreeNodeHarness[]> {
    return this.locatorForAll(MatTreeNodeHarness.with(filter))();
  }

  async getNestedNodes(filter: TreeNodeHarnessFilters = {}): Promise<MatNestedTreeNodeHarness[]> {
    return this.locatorForAll(MatNestedTreeNodeHarness.with(filter))();
  }
}
