/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {Observable, isObservable} from 'rxjs';
import {take, filter} from 'rxjs/operators';
import {BaseTreeControl} from './base-tree-control';

/** Optional set of configuration that can be provided to the NestedTreeControl. */
export interface NestedTreeControlOptions<T, K> {
  /** Function to determine if the provided node is expandable. */
  isExpandable?: (dataNode: T) => boolean;
  trackBy?: (dataNode: T) => K;
}

/**
 * Nested tree control. Able to expand/collapse a subtree recursively for NestedNode type.
 *
 * @deprecated Use one of levelAccessor or childrenAccessor instead. To be removed in a future
 * version.
 * @breaking-change 21.0.0
 */
export class NestedTreeControl<T, K = T> extends BaseTreeControl<T, K> {
  /** Construct with nested tree function getChildren. */
  constructor(
    public override getChildren: (dataNode: T) => Observable<T[]> | T[] | undefined | null,
    public options?: NestedTreeControlOptions<T, K>,
  ) {
    super();

    if (this.options) {
      this.trackBy = this.options.trackBy;
    }

    if (this.options?.isExpandable) {
      this.isExpandable = this.options.isExpandable;
    }
  }

  /**
   * Expands all dataNodes in the tree.
   *
   * To make this working, the `dataNodes` variable of the TreeControl must be set to all root level
   * data nodes of the tree.
   */
  expandAll(): void {
    this.expansionModel.clear();
    const allNodes = this.dataNodes.reduce(
      (accumulator: T[], dataNode) => [...accumulator, ...this.getDescendants(dataNode), dataNode],
      [],
    );
    this.expansionModel.select(...allNodes.map(node => this._trackByValue(node)));
  }

  /** Gets a list of descendant dataNodes of a subtree rooted at given data node recursively. */
  getDescendants(dataNode: T): T[] {
    const descendants: T[] = [];

    this._getDescendants(descendants, dataNode);
    // Remove the node itself
    return descendants.splice(1);
  }

  /** A helper function to get descendants recursively. */
  protected _getDescendants(descendants: T[], dataNode: T): void {
    descendants.push(dataNode);
    const childrenNodes = this.getChildren(dataNode);
    if (Array.isArray(childrenNodes)) {
      childrenNodes.forEach((child: T) => this._getDescendants(descendants, child));
    } else if (isObservable(childrenNodes)) {
      // TypeScript as of version 3.5 doesn't seem to treat `Boolean` like a function that
      // returns a `boolean` specifically in the context of `filter`, so we manually clarify that.
      childrenNodes.pipe(take(1), filter(Boolean as () => boolean)).subscribe(children => {
        for (const child of children) {
          this._getDescendants(descendants, child);
        }
      });
    }
  }
}
