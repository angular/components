/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, Input, booleanAttribute} from '@angular/core';

import {CdkTree, CdkTreeNode} from './tree';

/**
 * Node toggle to expand/collapse the node.
 */
@Directive({
  selector: '[cdkTreeNodeToggle]',
  host: {
    '(click)': '_toggle($event)',
  },
})
export class CdkTreeNodeToggle<T, K = T> {
  /** Whether expand/collapse the node recursively. */
  @Input({alias: 'cdkTreeNodeToggleRecursive', transform: booleanAttribute})
  recursive: boolean = false;

  constructor(
    protected _tree: CdkTree<T, K>,
    protected _treeNode: CdkTreeNode<T, K>,
  ) {}

  _toggle(event: Event): void {
    this.recursive
      ? this._tree.treeControl.toggleDescendants(this._treeNode.data)
      : this._tree.treeControl.toggle(this._treeNode.data);

    event.stopPropagation();
  }
}
