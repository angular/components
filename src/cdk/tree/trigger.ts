/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {
  Directive,
  Input,
} from '@angular/core';
import {CdkTree} from './tree';
import {CdkTreeNode} from './node';

/**
 * Node trigger to expand/collapse the node.
 */
@Directive({
  selector: '[cdkTreeNodeTrigger]',
  host: {
    '(click)': '_trigger($event)',
  }
})
export class CdkTreeNodeTrigger<T> {
  /** Whether expand/collapse the node recursively. */
  @Input('cdkTreeNodeTriggerRecursive')
  get recursive(): boolean { return this._recursive; }
  set recursive(value: boolean) { this._recursive = coerceBooleanProperty(value); }
  private _recursive = true;

  constructor(private _tree: CdkTree<T>,
              private _treeNode: CdkTreeNode<T>) {}

  _trigger(event: Event): void {
    this.recursive
      ? this._tree.treeControl.toggleDescendants(this._treeNode.data)
      : this._tree.treeControl.toggle(this._treeNode.data);

    event.stopPropagation();
  }
}
