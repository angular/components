/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, Input} from '@angular/core';
import {CdkTreeNode} from './node';
import {FlatNode} from './tree-data';

/**
 * Indent for the children tree nodes.
 * This directive will add left-padding to the node to show hierarchy.
 */
@Directive({
  selector: '[cdkNodePadding]',
  host: {
    '[style.padding-left]': 'paddingIndent',
  }
})
export class CdkNodePadding<T extends FlatNode> {
  /** The level of depth of the tree node. The padding will be `level * indent` pixels. */
  @Input('cdkNodePadding') level: number;

  /** The indent for each level. Default value is 28px. */
  @Input('cdkNodePaddingIndex') indent: number = 28;

  get paddingIndent() {
    const nodeLevel = (this._treeNode.data && this._treeNode.data.level)
      ? this._treeNode.data.level
      : null;
    const level = this.level || nodeLevel;

    return level ? `${level * this.indent}px` : '';
  }

  constructor(private _treeNode: CdkTreeNode<T>) {}
}
