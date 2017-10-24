/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {FocusableOption} from '@angular/cdk/a11y';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  Input,
  OnDestroy,
  TemplateRef,
  ViewEncapsulation
} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';
import {CdkTree} from './tree';
import {getTreeControlFunctionsMissingError} from './tree-errors';


/**
 * Data node definition for the CdkTree.
 * Captures the node's template and a when predicate that describes when this node should be used.
 */
@Directive({
  selector: '[cdkNodeDef]',
  inputs: [
    'when: cdkNodeDefWhen'
  ],
})
export class CdkNodeDef<T> {
  /**
   * Function that should return true if this node template should be used for the provided node
   * data and index. If left undefined, this node will be considered the default node template to
   * use when no other when functions return true for the data.
   * For every node, there must be at least one when function that passes or an undefined to
   * default.
   */
  when: (nodeData: T, index: number) => boolean;

  /** @docs-private */
  constructor(public template: TemplateRef<any>) {}
}


/**
 * Tree node for CdkTree. It contains the data in the tree node.
 */
@Component({
  selector: 'cdk-tree-node',
  exportAs: 'cdkTreeNode',
  template: `<ng-content></ng-content>`,
  host: {
    '[attr.role]': 'role',
    'class': 'cdk-tree-node',
    'tabindex': '0',
  },
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CdkTreeNode<T>  implements FocusableOption, OnDestroy {

  private _treeChildrenSubscription: Subscription;

  /** The tree node data */
  @Input('cdkTreeNode')
  set data(v: T) {
    this._data = v;
    this.setRoleFromData();
  }
  get data(): T { return this._data; }
  private _data: T;

  private setRoleFromData(): void {
    if (this._tree.treeControl.isExpandable) {
      this.role = this._tree.treeControl.isExpandable(this._data) ? 'group' : 'treeitem';
    } else {
      if (!this._tree.treeControl.getChildren) {
        throw getTreeControlFunctionsMissingError();
      }
      if (this._treeChildrenSubscription) {
        this._treeChildrenSubscription.unsubscribe();
      }
      this._treeChildrenSubscription = this._tree.treeControl.getChildren(this._data)
        .subscribe(children => {
          this.role = children ? 'group' : 'treeitem';
        });
    }
  }

  /**
   * The role of the node should be 'group' if it's an internal node,
   * and 'treeitem' if it's a leaf node.
   */
  @Input() role: 'treeitem' | 'group' = 'treeitem';

  constructor(private _elementRef: ElementRef,
              private _tree: CdkTree<T>) {}

  ngOnDestroy() {
    if (this._treeChildrenSubscription) {
      this._treeChildrenSubscription.unsubscribe();
    }
  }

  /** Focuses the menu item. Implements for FocusableOption. */
  focus(): void {
    this._elementRef.nativeElement.focus();
  }
}
