/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BooleanInput, coerceBooleanProperty} from '@angular/cdk/coercion';
import {Directive, Input} from '@angular/core';
import {ENTER, SPACE} from '@angular/cdk/keycodes';

import {CdkTree, CdkTreeNode} from './tree';

/**
 * Node toggle to expand and collapse the node.
 *
 * CdkTreeNodeToggle is intended only to be used on native button elements, elements with button role,
 * or elements with treeitem role.
 */
@Directive({
  selector: '[cdkTreeNodeToggle]',
  host: {
    '(click)': '_toggle($event)',
    '(keydown)': '_toggleOnEnterOrSpace($event)',
    'tabindex': '-1',
  },
})
export class CdkTreeNodeToggle<T, K = T> {
  /** Whether expand/collapse the node recursively. */
  @Input('cdkTreeNodeToggleRecursive')
  get recursive(): boolean {
    return this._recursive;
  }
  set recursive(value: BooleanInput) {
    this._recursive = coerceBooleanProperty(value);
  }
  protected _recursive = false;

  constructor(
    protected _tree: CdkTree<T, K>,
    protected _treeNode: CdkTreeNode<T, K>,
  ) {}

  // Toggle the expanded or collapsed state of this node.
  //
  // Focus this node with expanding or collapsing it. This ensures that the active node will always
  // be visible when expanding and collapsing.
  _toggle(event: Event): void {
    this.recursive
      ? this._tree.toggleDescendants(this._treeNode.data)
      : this._tree.toggle(this._treeNode.data);

    this._tree._keyManager.focusItem(this._treeNode);

    event.stopPropagation();
  }

  _toggleOnEnterOrSpace(event: KeyboardEvent) {
    if (event.keyCode === ENTER || event.keyCode === SPACE) {
      this._toggle(event);
      event.preventDefault();
    }
  }
}
