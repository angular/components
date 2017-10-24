/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {first} from '@angular/cdk/rxjs';
import {BaseTreeControl} from './base-tree-control';
import {Observable} from 'rxjs/Observable';


/** Nested tree control. Able to expand/collapse a subtree recursively for NestedNode type. */
export class NestedTreeControl<T> extends BaseTreeControl<T> {

  /** Construct with nested tree function getChildren. */
  constructor(public getChildren: (node: T) => Observable<T[]>) {
    super();
  }

  /**
   * Expands all nodes in the tree.
   *
   * To make this working, the `nodes` of the TreeControl must be set correctly.
   */
  expandAll(): void {
    this.expansionModel.clear();
    let toBeExpanded = <any>[];
    this.nodes.forEach(node => toBeExpanded.push(...this.getDescendants(node)));
    this.expansionModel.select(...toBeExpanded);
  }

  /** Gets a list of descendant nodes of a subtree rooted at given `node` recursively. */
  getDescendants(node: T): T[] {
    const descendants = [];
    this._getDescendants(descendants, node);
    return descendants;
  }

  /** A helper function to get descendants recursively. */
  protected _getDescendants(descendants: T[], node: T): void {
    descendants.push(node);
    first.call(this.getChildren(node)).subscribe(children => {
      if (children && children.length > 0) {
        children.forEach((child: T) => this._getDescendants(descendants, child));
      }
    });
  }
}
