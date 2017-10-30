/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {SelectionModel} from '@angular/cdk/collections';
import {Observable} from 'rxjs/Observable';
import {TreeControl} from './tree-control';

/** Base tree control. It has basic toggle/expand/collapse operations on a single node. */
export abstract class BaseTreeControl<T> implements TreeControl<T> {
  /** Saved node for `expandAll` action. */
  nodes: T[];
  /** A selection model with multi-selection to track expansion status. */
  expansionModel: SelectionModel<T> = new SelectionModel<T>(true);

  /** Toggles one single node. Expands a collapsed node or collapse an expanded node. */
  toggle(node: T): void {
    this.expansionModel.toggle(node);
  }

  /** Expands one single node. */
  expand(node: T): void {
    this.expansionModel.select(node);
  }

  /** Collapses one single node. */
  collapse(node: T): void {
    this.expansionModel.deselect(node);
  }

  /** Whether a given node is expanded or not. Returns true if the node is expanded. */
  isExpanded(node: T): boolean {
    return this.expansionModel.isSelected(node);
  }

  /** Toggles a subtree rooted at `node` recursively. */
  toggleDescendants(node: T): void {
    this.expansionModel.isSelected(node)
        ? this.collapseDescendants(node)
        : this.expandDescendants(node);
  }

  /** Collapse all nodes in the tree. */
  collapseAll(): void {
    this.expansionModel.clear();
  }

  /** Expands a subtree rooted at given `node` recursively. */
  expandDescendants(node: T): void {
    let toBeProcessed = [node];
    toBeProcessed.push(...this.getDescendants(node));
    this.expansionModel.select(...toBeProcessed);
  }

  /** Collapses a subtree rooted at given `node` recursively. */
  collapseDescendants(node: T): void {
    let toBeProcessed = [node];
    toBeProcessed.push(...this.getDescendants(node));
    this.expansionModel.deselect(...toBeProcessed);
  }

  /** Gets a list of descendent nodes of a subtree rooted at given `node` recursively. */
  abstract getDescendants(node: T): T[];

  /** Expands all nodes in the tree. */
  abstract expandAll(): void;

  /** Get depth of a given node, return the level number. This is for flat tree node. */
  getLevel: (node: T) => number;

  /** Whether the node is expandable. Returns true if expandable. This is for flat tree node. */
  isExpandable: (node: T) => boolean;

  /** Gets a stream that emits whenever the given node's children change. */
  getChildren: (node: T) => Observable<T[]>;
}
