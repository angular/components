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
 * Node toggle to expand and collapse the node.
 */
@Directive({
  selector: '[cdkTreeNodeToggle]',
  host: {
    '(click)': '_toggle(); $event.stopPropagation();',
    '(keydown.Enter)': '_toggle(); $event.preventDefault();',
    '(keydown.Space)': '_toggle(); $event.preventDefault();',
    'tabindex': '-1',
  },
  standalone: true,
})
export class CdkTreeNodeToggle<T, K = T> {
  /** Whether expand/collapse the node recursively. */
  @Input({alias: 'cdkTreeNodeToggleRecursive', transform: booleanAttribute})
  recursive: boolean = false;

  constructor(
    protected _tree: CdkTree<T, K>,
    protected _treeNode: CdkTreeNode<T, K>,
  ) {}

  // Toggle the expanded or collapsed state of this node.
  //
  // Focus this node with expanding or collapsing it. This ensures that the active node will always
  // be visible when expanding and collapsing.
  _toggle(): void {
    this.recursive
      ? this._tree.toggleDescendants(this._treeNode.data)
      : this._tree.toggle(this._treeNode.data);

    this._tree._keyManager.focusItem(this._treeNode);
  }
}
