/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Observable} from 'rxjs/Observable';
import {take} from 'rxjs/operators/take';
import {BaseTreeControl} from './base-tree-control';

/** Nested tree control. Able to expand/collapse a subtree recursively for NestedNode type. */
export class NestedTreeControl<T> extends BaseTreeControl<T> {

  flattenedNodes: T[] = [];

  /** Construct with nested tree function getChildren. */
  constructor(public getChildren: (dataNode: T) => Observable<T[]>) {
    super();
  }

  /**
   * Expands all dataNodes in the tree.
   *
   * To make this working, the `dataNodes` variable of the TreeControl must be set to all root level
   * data nodes of the tree.
   */
  expandAll(): void {
    this.expansionModel.clear();
    let toBeExpanded = <any>[];
    this.dataNodes.forEach(dataNode => toBeExpanded.push(...this.getDescendants(dataNode)));
    this.expansionModel.select(...toBeExpanded);
  }

  /** Gets a list of descendant dataNodes of a subtree rooted at given data node recursively. */
  getDescendants(dataNode: T): T[] {
    const descendants = [];
    this._getDescendants(descendants, dataNode);
    return descendants;
  }

  /** A helper function to get descendants recursively. */
  protected _getDescendants(descendants: T[], dataNode: T): void {
    descendants.push(dataNode);
    this.getChildren(dataNode).pipe(take(1)).subscribe(children => {
      if (children && children.length > 0) {
        children.forEach((child: T) => {
          this.parentMap.set(child, dataNode);
          this._getDescendants(descendants, child);
        });
      }
    });
  }

  getAllVisibleNodes() {
    this.flattenedNodes = [];
    this.dataNodes.forEach(dataNode => this._getVisibleDescendants(dataNode));
  }

  _getVisibleDescendants(dataNode: T) {
    this.flattenedNodes.push(dataNode);

    if (this.isExpanded(dataNode)) {
      this.getChildren(dataNode).pipe(take(1)).subscribe(children => {
        if (children && children.length > 0) {
          children.forEach((child: T) => {
            this._getVisibleDescendants(child);
          });
        }
      });
    }
  }

  getFirstChild(dataNode: T): T | undefined {
    let result;
    if (this.isExpanded(dataNode)) {
      this.getChildren(dataNode).pipe(take(1)).subscribe(children => {
        if (children && children.length > 0) {
          result = children[0];
        }
      });
    }
    return result;
  }

  /** Get the previous visible node of a given node */
  getPrevious(dataNode: T): T | undefined {
    this.getAllVisibleNodes();
    const index = this.flattenedNodes.indexOf(dataNode);
    if (index > 0) {
      return this.flattenedNodes[index - 1];
    }
  }

  /** Get the next visible node of a given node */
  getNext(dataNode: T): T | undefined {
    this.getAllVisibleNodes();
    const index = this.flattenedNodes.indexOf(dataNode);
    if (index < this.flattenedNodes.length - 1) {
      return this.flattenedNodes[index + 1];
    }
  }

  getFirstNode(): T | undefined {
    return this.dataNodes[0];
  }

  getLastNode(): T | undefined {
    this.getAllVisibleNodes();
    return this.flattenedNodes[this.flattenedNodes.length - 1];
  }

}
