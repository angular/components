/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {
  AfterContentInit,
  ContentChildren,
  Directive,
  OnDestroy,
  QueryList,
} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {takeUntil} from '@angular/cdk/rxjs';
import {CdkTree} from './tree';
import {TreeNodeOutlet} from './outlet';
import {CdkTreeNode} from './node';

/**
 * Nested node is a child of `<cdk-tree>`. It works with nested tree.
 * By adding `cdkNestedTreeNode` to the tree node template, children of the parent node will be
 * added in the `nodeOutlet` in tree node template.
 * For example:
 *   <cdk-tree-node cdkNestedTreeNode [cdkNode]="node">
 *     tree node data: {{node.name}}
 *     <ng-template nodeOutlet> </ng-template>
 *   </cdk-tree-node>
 * The children of node will be automatically added to `cdkNodeOutlet`, the result dom will be like
 * this:
 *   <cdk-tree-node cdkNestedTreeNode [cdkNode]="node">
 *     tree node data: {{node.name}}
 *     <ng-template cdkNodeOutlet>
 *       <cdk-tree-node cdKNestedTreeNode [cdkNode]="child1"></cdk-tree-node>
 *       <cdk-tree-node cdKNestedTreeNode [cdkNode]="child2"></cdk-tree-node>
 *     </ng-template>
 *   </cdk-tree-node>
 */
@Directive({
  selector: '[cdkNestedTreeNode]'
})
export class CdkNestedTreeNode<T> implements AfterContentInit, OnDestroy {

  /** Emits when the component is destroyed. */
  private _destroyed = new Subject<void>();

  /** The children data nodes of current NestedNode They will be placed in `TreeNodeOutlet`. */
  protected _children: T[];

  /** The children node placeholder. */
  @ContentChildren(TreeNodeOutlet) nodeOutlet: QueryList<TreeNodeOutlet>;

  constructor(private tree: CdkTree<T>,
              public treeNode: CdkTreeNode<T>) {}

  ngAfterContentInit() {
    takeUntil.call(this.tree.treeControl.getChildren(this.treeNode.data), this._destroyed)
      .subscribe(result => {
        // In case when nodePlacholder is not in the DOM when children changes, save it in the node
        // and add to nodeOutlet when it's available.
        this._children = result as T[];
        this._addChildrenNodes();
      });
    takeUntil.call(this.nodeOutlet.changes, this._destroyed)
      .subscribe((_) => this._addChildrenNodes());
  }

  ngOnDestroy() {
    this._clear();
    this._destroyed.next();
    this._destroyed.complete();
  }

  /** Add children nodes to the NodePlacholder */
  protected _addChildrenNodes(): void {
    this._clear();
    if (this.nodeOutlet.length && this._children) {
      this._children.forEach((child, index) => {
        this.tree.insertNode(child, index, this.nodeOutlet.first.viewContainer);
      });
    }
  }

  /** Clear the children nodes. */
  protected _clear(): void {
    if (this.nodeOutlet.first) {
      this.nodeOutlet.first.viewContainer.clear();
    }
  }
}
