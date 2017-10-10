/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {
  AfterContentInit,
  ContentChildren,
  Directive,
  forwardRef,
  Inject,
  OnDestroy,
  QueryList,
} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';
import {CdkTree} from './tree';
import {NestedNode} from './tree-data';
import {CdkNodePlaceholder} from './placeholder';
import {CdkTreeNode} from './node';


/**
 * Nested node, add children to `cdkNodePlaceholder` in template.
 */
@Directive({
  selector: '[cdkNestedNode]'
})
export class CdkNestedNode<T extends NestedNode> implements AfterContentInit, OnDestroy {

  /** The children node placeholder. */
  @ContentChildren(CdkNodePlaceholder) nodePlaceholder: QueryList<CdkNodePlaceholder>;

  /** The Children nodes data. */
  protected _children: T[];

  /** Subscribes to children changes. */
  protected _childrenSubscription: Subscription;

  /** Subscribes to node placeholder changes. */
  protected _placeholderSubscription: Subscription;

  constructor(@Inject(forwardRef(() => CdkTree)) private tree: CdkTree<T>,
              public treeNode: CdkTreeNode<T>) {}

  ngAfterContentInit() {
    this._childrenSubscription = this.treeNode.data.getChildren().subscribe((result) => {
      // In case when nodePlacholder is not in the DOM when children changes, save it in the node
      // and add to nodePlaceholder when it's available.
      this._children = result as T[];
      this._addChildrenNodes();
    });
    this._placeholderSubscription = this.nodePlaceholder.changes.subscribe((_) => {
      this._addChildrenNodes();
    })
  }

  ngOnDestroy() {
    if (this._childrenSubscription) {
      this._childrenSubscription.unsubscribe();
    }
    if (this._placeholderSubscription) {
      this._placeholderSubscription.unsubscribe();
    }
    this._clear();
  }

  /** Add children nodes to the NodePlacholder */
  protected _addChildrenNodes() {
    this._clear();
    if (this.nodePlaceholder.length && this._children) {
      this._children.forEach((child, index) => {
        this.tree.insertNode(child, index, this.nodePlaceholder.first.viewContainer);
      });
    }
  }

  /** Clear the children nodes. */
  protected _clear() {
    if (this.nodePlaceholder.first.viewContainer) {
      this.nodePlaceholder.first.viewContainer.clear();
    }
  }
}
