/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentHarness, HarnessPredicate, parallel} from '@angular/cdk/testing';
import {TreeItemHarness} from './item-harness';
import {TreeHarnessFilters, TreeItemHarnessFilters} from './tree-harness-filters';

export interface TextTree {
  text?: string;
  children?: TextTree[];
}

/** Harness for interacting with an Aria tree in tests. */
export class TreeHarness extends ComponentHarness {
  static hostSelector = '[ngTree]';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a tree with specific attributes.
   * @param options Options for narrowing the search
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: TreeHarnessFilters = {}): HarnessPredicate<TreeHarness> {
    return new HarnessPredicate(TreeHarness, options);
  }

  /** Gets all of the items in the tree. */
  async getItems(filter: TreeItemHarnessFilters = {}): Promise<TreeItemHarness[]> {
    return this.locatorForAll(TreeItemHarness.with(filter))();
  }

  /**
   * Gets an object representation for the visible tree structure
   * If an item is under an unexpanded item it will not be included.
   */
  async getTreeStructure(): Promise<TextTree> {
    const items = await this.getItems();
    const itemInformation = await parallel(() =>
      items.map(item => parallel(() => [item.getLevel(), item.getText(), item.isExpanded()])),
    );
    return this._getTreeStructure(itemInformation, 1, true);
  }

  /**
   * Recursively collect the structured text of the tree items.
   * @param items A list of tree items
   * @param level The level of items that are being accounted for during this iteration
   * @param parentExpanded Whether the parent of the first item in param items is expanded
   */
  private _getTreeStructure(
    items: [number, string, boolean][],
    level: number,
    parentExpanded: boolean,
  ): TextTree {
    const result: TextTree = {};
    for (let i = 0; i < items.length; i++) {
      const [itemLevel, text, expanded] = items[i];
      const nextItemLevel = items[i + 1]?.[0] ?? -1;

      // Return the accumulated value for the current level once we reach a shallower level item
      if (itemLevel < level) {
        return result;
      }
      // Skip deeper level items during this iteration, they will be picked up in a later iteration
      if (itemLevel > level) {
        continue;
      }
      // Only add to representation if it is visible (parent is expanded)
      if (parentExpanded) {
        // Collect the data under this item according to the following rules:
        // 1. If the next item in the list is a sibling of the current item add it to the child list
        // 2. If the next item is a child of the current item, get the sub-tree structure for the
        //    child and add it under this item
        // 3. If the next item has a shallower level, we've reached the end of the child items for
        //    the current parent.
        if (nextItemLevel === level) {
          this._addChildToItem(result, {text});
        } else if (nextItemLevel > level) {
          let children = this._getTreeStructure(
            items.slice(i + 1),
            nextItemLevel,
            expanded,
          )?.children;
          let child = children ? {text, children} : {text};
          this._addChildToItem(result, child);
        } else {
          this._addChildToItem(result, {text});
          return result;
        }
      }
    }
    return result;
  }

  private _addChildToItem(result: TextTree, child: TextTree) {
    result.children ? result.children.push(child) : (result.children = [child]);
  }
}
