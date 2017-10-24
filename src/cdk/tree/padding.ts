/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directionality} from '@angular/cdk/bidi';
import {Directive, Input, Optional} from '@angular/core';
import {CdkTreeNode} from './node';
import {CdkTree} from './tree';

/**
 * Indent for the children tree nodes.
 * This directive will add left-padding to the node to show hierarchy.
 */
@Directive({
  selector: '[cdkTreeNodePadding]',
  host: {
    '[style.padding-left]': 'paddingIndentLeft()',
    '[style.padding-right]': 'paddingIndentRight()',
  }
})
export class CdkTreeNodePadding<T> {
  /** The level of depth of the tree node. The padding will be `level * indent` pixels. */
  @Input('cdkTreeNodePadding') level: number;

  /** The indent for each level. */
  @Input('cdkTreeNodePaddingIndent') indent: number;

  constructor(private _treeNode: CdkTreeNode<T>,
              private _tree: CdkTree<T>,
              @Optional() private _dir: Directionality) {}

  /** The padding indent value for the tree node. Returns a string with px numbers if not null. */
  _paddingIndent(): string|null {
    const nodeLevel = (this._treeNode.data && this._tree.treeControl.getLevel)
      ? this._tree.treeControl.getLevel(this._treeNode.data)
      : null;
    const level = this.level || nodeLevel;
    return level ? `${level * this.indent}px` : null;
  }

  /** The left padding indent value for the tree node. */
  paddingIndentLeft(): string|null {
    return this._dir && this._dir.value === 'rtl' ? null : this._paddingIndent();
  }

  /** The right padding indent value for the tree node. */
  paddingIndentRight(): string|null {
    return this._dir && this._dir.value === 'rtl' ? this._paddingIndent() : null;
  }
}
