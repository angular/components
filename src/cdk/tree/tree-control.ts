/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {SelectionModel} from '@angular/cdk/collections';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {FlatNode, NestedNode} from './tree-data';
import {CdkTreeNode} from './node';

/**
 * Tree control interface
 */
export interface TreeControl {
  /** The expansion change event */
  expandChange: BehaviorSubject<any>;

  /** The expansion model */
  expansionModel: SelectionModel<any>;

  /** Whether the node is expanded or collapsed. Return true if it's expanded. */
  expanded(node: any): boolean;

  /** Get all decedents of a node */
  getDecedents(node: any): any[];

  /** Expand or collapse node */
  toggle(node: any);

  /** Expand one node */
  expand(node: any);

  /** Collapse one node */
  collapse(node: any);

  /** Expand all the nodes in the tree */
  expandAll();

  /** Collapse all the nodes in the tree */
  collapseAll();

  /** Toggle a node by expand/collapse it and all its decedents */
  toggleDecedents(node: any);

  /** Expand a node and all its decedents */
  expandDecedents(node: any);

  /** Collapse a ndoe and all its decedents */
  collapseDecedents(node: any);
}

/** Base tree control. It has basic toggle/expand/collapse operations on a single node. */
export abstract class BaseTreeControl<T extends FlatNode|NestedNode> implements TreeControl {
  /** Saved node for `expandAll` action. */
  nodes: T[];

  /** Expansion info: the changes */
  expandChange = new BehaviorSubject<T[]>([]);

  /** A selection model with multi-selection to track expansion status. */
  expansionModel: SelectionModel<T> = new SelectionModel<T>(true);

  /** Toggles one single node. Expands a collapsed node or collapse an expanded node. */
  toggle(node: T) {
    this.expansionModel.toggle(node);
    this.expandChange.next(this.expansionModel.selected);
  }

  /** Expands one single node. */
  expand(node: T) {
    this.expansionModel.select(node);
    this.expandChange.next(this.expansionModel.selected);
  }

  /** Collapses one single node. */
  collapse(node: T) {
    this.expansionModel.deselect(node);
    this.expandChange.next(this.expansionModel.selected);
  }

  /** Whether a given node is expanded or not. Returns true if the node is expanded. */
  expanded(node: T) {
    return this.expansionModel.isSelected(node);
  }

  /** Toggles a subtree rooted at `node` recursively. */
  toggleDecedents(node: T) {
    this.expansionModel.toggle(node);
    let expand = this.expansionModel.isSelected(node);
    expand ? this.expandDecedents(node) : this.collapseDecedents(node);
  }

  /** Collapse all nodes in the tree. */
  collapseAll() {
    this.expansionModel.clear();
    this.expandChange.next(this.expansionModel.selected);
  }

  /** Expands all nodes in the tree. */
  abstract expandAll();

  /** Expands a subtree rooted at given `node` recursively. */
  abstract expandDecedents(node: T);

  /** Collapses a subtree rooted at given `node` recursively. */
  abstract collapseDecedents(node: T);

  /** Gets a list of decedent nodes of a subtree rooted at given `node` recursively. */
  abstract getDecedents(node: T): T[];
}

/** Flat tree control. Able to expand/collapse a subtree recursively for FlatNode type. */
export class FlatTreeControl<T extends FlatNode> extends BaseTreeControl<T> {
  /**
   * Gets a list of decedent nodes of a subtree rooted at given `node` recursively.
   *
   * To make this working, the `nodes` of the TreeControl must be set correctly.
   */
  getDecedents(node: T) {
    const startIndex = this.nodes.indexOf(node);
    const results: T[] = [];
    for (let i = startIndex + 1; i < this.nodes.length && node.level < this.nodes[i].level; i++) {
      results.push(this.nodes[i]);
    }
    return results;
  }

  /**
   * Expands all nodes in the tree.
   *
   * To make this working, the `nodes` of the TreeControl must be set correctly.
   */
  expandAll() {
    this.expansionModel.clear();
    this.nodes.forEach((node) => node.expandable && this.expansionModel.select(node));
    this.expandChange.next(this.expansionModel.selected);
  }

  /** Expands a subtree rooted at given `node` recursively. */
  expandDecedents(node: T) {
    let decedents = this.getDecedents(node);
    decedents.forEach((child) => child.expandable && this.expansionModel.select(child));
    this.expandChange.next(this.expansionModel.selected);
  }

  /** Collapses a subtree rooted at given `node` recursively. */
  collapseDecedents(node: T) {
    let decedents = this.getDecedents(node);
    decedents.forEach((child) => this.expansionModel.deselect(child));
    this.expandChange.next(this.expansionModel.selected);
  }
}

/** Nested tree control. Able to expand/collapse a subtree recursively for NestedNode type. */
export class NestedTreeControl<T extends NestedNode> extends BaseTreeControl<T> {
  /**
   * Expands all nodes in the tree.
   *
   * To make this working, the `nodes` of the TreeControl must be set correctly.
   */
  expandAll() {
    this.expansionModel.clear();
    this.nodes.forEach((node) => this._expandDecedents(node));
    this.expandChange.next(this.expansionModel.selected);
  }

  /** Gets a list of decedent nodes of a subtree rooted at given `node` recursively. */
  getDecedents(node: T): T[] {
    let decedents = [];
    this._getDecedents(decedents, node);
    return decedents;
  }


  /** Expands a subtree rooted at given `node` recursively. */
  expandDecedents(node: T) {
    this._expandDecedents(node);
    this.expandChange.next(this.expansionModel.selected);
  }

  /** Collapses a subtree rooted at given `node` recursively. */
  collapseDecedents(node: T) {
    this.expansionModel.deselect(node);
    const subscription = node.getChildren().subscribe((children: T[]) => {
      if (children) {
        children.forEach((child) => {
          this.collapseDecedents(child)
        });
      }
    });
    subscription.unsubscribe();
    this.expandChange.next(this.expansionModel.selected);
  }

  /** Expands a subtree rooted at given `node` recursively without notification. */
  protected _expandDecedents(node: T) {
    this.expansionModel.select(node);
    const subscription = node.getChildren().subscribe((children: T[]) => {
      if (children) {
        children.forEach((child) => {
          this.expandDecedents(child)
        });
      }
    });
    subscription.unsubscribe();
  }

  /** A helper function to get decedents recursively. */
  protected _getDecedents(decedents: T[], node: T) {
    decedents.push(node);
    const subscription = node.getChildren().subscribe((children: T[]) => {
      if (children) {
        children.forEach((child) => {
          this._getDecedents(decedents, child);
        });
      }
    });
    subscription.unsubscribe();
    this.expandChange.next(this.expansionModel.selected);
  }
}
