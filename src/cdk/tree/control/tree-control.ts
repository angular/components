/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {SelectionModel} from '@angular/cdk/collections';
import {Observable} from 'rxjs/Observable';

/**
 * Tree control interface. User can implement TreeControl to expand/collapse nodes in the tree.
 * The CDKTree will use this TreeControl to expand/collapse a node.
 * User can also use it outside the `<cdk-tree>` to control the expansion status of the tree.
 */
export interface TreeControl<T> {
  /** The saved tree nodes data for `expandAll` action. */
  nodes: T[];

  /** The expansion model */
  expansionModel: SelectionModel<T>;

  /** Whether the node is expanded or collapsed. Return true if it's expanded. */
  isExpanded(node: T): boolean;

  /** Get all descendants of a node */
  getDescendants(node: T): any[];

  /** Expand or collapse node */
  toggle(node: T): void;

  /** Expand one node */
  expand(node: T): void;

  /** Collapse one node */
  collapse(node: T): void;

  /** Expand all the nodes in the tree */
  expandAll(): void;

  /** Collapse all the nodes in the tree */
  collapseAll(): void;

  /** Toggle a node by expand/collapse it and all its descendants */
  toggleDescendants(node: T): void;

  /** Expand a node and all its descendants */
  expandDescendants(node: T): void;

  /** Collapse a ndoe and all its descendants */
  collapseDescendants(node: T): void;

  /** Get depth of a given node, return the level number. This is for flat tree node. */
  readonly getLevel: (node: T) => number;

  /** Whether the node is expandable. Returns true if expandable. This is for flat tree node. */
  readonly isExpandable: (node: T) => boolean;

  /** Gets a stream that emits whenever the given node's children change. */
  readonly getChildren: (node: T) => Observable<T[]>;
}
