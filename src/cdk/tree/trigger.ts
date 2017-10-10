/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  Directive,
  forwardRef,
  Inject,
  Input,
} from '@angular/core';
import {CdkTree} from './tree';
import {CdkTreeNode} from './node';
import {FlatNode, NestedNode} from './tree-data';

/**
 * Node trigger to expand/collapse the node.
 */
@Directive({
  selector: '[cdkNodeTrigger]',
  host: {
    '(click)': '_trigger($event)',
  }
})
export class CdkNodeTrigger<T extends FlatNode|NestedNode> {
  /** Whether expand/collapse the node recursively. */
  @Input('cdkNodeTriggerRecursive') recursive: boolean = true;

  constructor(@Inject(forwardRef(() => CdkTree)) private _tree: CdkTree<T>,
              private _treeNode: CdkTreeNode<T>) {}

  _trigger(_: Event) {
    this.recursive
        ? this._tree.treeControl.toggleDecedents(this._treeNode.data)
        : this._tree.treeControl.toggle(this._treeNode.data);
  }
}
