/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  AfterContentInit,
  ContentChildren,
  Directive,
  IterableDiffer,
  IterableDiffers,
  OnDestroy,
  QueryList,
  inject,
} from '@angular/core';
import {takeUntil} from 'rxjs/operators';

import {CDK_TREE_NODE_OUTLET_NODE, CdkTreeNodeOutlet} from './outlet';
import {CdkTreeNode} from './tree';

/**
 * Nested node is a child of `<cdk-tree>`. It works with nested tree.
 * By using `cdk-nested-tree-node` component in tree node template, children of the parent node will
 * be added in the `cdkTreeNodeOutlet` in tree node template.
 * The children of node will be automatically added to `cdkTreeNodeOutlet`.
 */
@Directive({
  selector: 'cdk-nested-tree-node',
  exportAs: 'cdkNestedTreeNode',
  providers: [
    {provide: CdkTreeNode, useExisting: CdkNestedTreeNode},
    {provide: CDK_TREE_NODE_OUTLET_NODE, useExisting: CdkNestedTreeNode},
  ],
  host: {
    'class': 'cdk-nested-tree-node',
  },
})
export class CdkNestedTreeNode<T, K = T>
  extends CdkTreeNode<T, K>
  implements AfterContentInit, OnDestroy
{
  protected override _type: 'flat' | 'nested' = 'nested';
  protected _differs = inject(IterableDiffers);

  /** Differ used to find the changes in the data provided by the data source. */
  private _dataDiffer: IterableDiffer<T>;

  /** The children data dataNodes of current node. They will be placed in `CdkTreeNodeOutlet`. */
  protected _children: T[];

  /** The children node placeholder. */
  @ContentChildren(CdkTreeNodeOutlet, {
    // We need to use `descendants: true`, because Ivy will no longer match
    // indirect descendants if it's left as false.
    descendants: true,
  })
  nodeOutlet: QueryList<CdkTreeNodeOutlet>;

  constructor(...args: unknown[]);

  constructor() {
    super();
  }

  ngAfterContentInit() {
    this._dataDiffer = this._differs.find([]).create(this._tree.trackBy);
    this._tree
      ._getDirectChildren(this.data)
      .pipe(takeUntil(this._destroyed))
      .subscribe(result => this.updateChildrenNodes(result));
    this.nodeOutlet.changes
      .pipe(takeUntil(this._destroyed))
      .subscribe(() => this.updateChildrenNodes());
  }

  override ngOnDestroy() {
    this._clear();
    super.ngOnDestroy();
  }

  /** Add children dataNodes to the NodeOutlet */
  protected updateChildrenNodes(children?: T[]): void {
    const outlet = this._getNodeOutlet();
    if (children) {
      this._children = children;
    }
    if (outlet && this._children) {
      const viewContainer = outlet.viewContainer;
      this._tree.renderNodeChanges(this._children, this._dataDiffer, viewContainer, this._data);
    } else {
      // Reset the data differ if there's no children nodes displayed
      this._dataDiffer.diff([]);
    }
  }

  /** Clear the children dataNodes. */
  protected _clear(): void {
    const outlet = this._getNodeOutlet();
    if (outlet) {
      outlet.viewContainer.clear();
      this._dataDiffer.diff([]);
    }
  }

  /** Gets the outlet for the current node. */
  private _getNodeOutlet() {
    const outlets = this.nodeOutlet;

    // Note that since we use `descendants: true` on the query, we have to ensure
    // that we don't pick up the outlet of a child node by accident.
    return outlets && outlets.find(outlet => !outlet._node || outlet._node === this);
  }
}
