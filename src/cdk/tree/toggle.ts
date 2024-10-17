/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Directive, Input, booleanAttribute, inject} from '@angular/core';

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
})
export class CdkTreeNodeToggle<T, K = T> {
  protected _tree = inject<CdkTree<T, K>>(CdkTree);
  protected _treeNode = inject<CdkTreeNode<T, K>>(CdkTreeNode);

  /** Whether expand/collapse the node recursively. */
  @Input({alias: 'cdkTreeNodeToggleRecursive', transform: booleanAttribute})
  recursive: boolean = false;

  constructor(...args: unknown[]);
  constructor() {}

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
