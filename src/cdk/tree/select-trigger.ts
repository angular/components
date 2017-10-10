/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SelectionModel} from '@angular/cdk/collections';
import {
  Directive,
  forwardRef,
  Inject,
  Input,
  Optional,
} from '@angular/core';
import {CdkTree} from './tree';
import {CdkTreeNode} from './node';

/**
 * Node selection trigger. Clicking on the trigger will change the selection.
 */
@Directive({
  selector: '[cdkNodeSelectTrigger]',
  host: {
    '(click)': 'trigger($event)',
  }
})
export class CdkNodeSelectTrigger<T> {
  @Input('cdkNodeSelectTrigger') selection: SelectionModel<T>;
  @Input('cdkNodeSelectTriggerRecursive') recursive: boolean = false;

  get node() {
    return this.treeNode.data;
  }

  constructor(@Inject(forwardRef(() => CdkTree)) private tree: CdkTree<T>,
              private treeNode: CdkTreeNode<T>) {}

  trigger(_: Event) {
    this.selection.toggle(this.node);
    if (this.recursive) {
      const select = this.selection.isSelected(this.node);
      const decedents = this.tree.treeControl.getDecedents(this.node);
      decedents.forEach((child) => {
        select ? this.selection.select(child) : this.selection.deselect(child);
      });
    }
  }
}
