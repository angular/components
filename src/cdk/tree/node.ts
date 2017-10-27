/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {FocusableOption} from '@angular/cdk/a11y';
import {
  Directive,
  ElementRef,
  Input,
  OnDestroy,
  TemplateRef
} from '@angular/core';
import {takeUntil} from 'rxjs/operator/takeUntil';
import {Subject} from 'rxjs/Subject';
import {CdkTree} from './tree';
import {getTreeControlFunctionsMissingError} from './tree-errors';


/** Context provided to the ndoes */
export class CdkTreeNodeOutletContext<T> {

  static mostRecentContextData: any;

  /** Data for the node. */
  $implicit: T;

  /** Index location of the node. */
  index?: number;

  /** Length of the number of total nodes. */
  count?: number;

  constructor(data: T) {
    this.$implicit = data;
    CdkTreeNodeOutletContext.mostRecentContextData = data;
  }
}

/**
 * Data node definition for the CdkTree.
 * Captures the node's template and a when predicate that describes when this node should be used.
 */
@Directive({
  selector: '[cdkTreeNodeDef]',
  inputs: [
    'when: cdkTreeNodeDefWhen'
  ],
})
export class CdkTreeNodeDef<T> {
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
@Directive({
  selector: 'cdk-tree-node',
  exportAs: 'cdkTreeNode',
  host: {
    '[attr.role]': 'role',
    'class': 'cdk-tree-node',
    'tabindex': '0',
  },
})
export class CdkTreeNode<T>  implements FocusableOption, OnDestroy {
  /** Subject that emits when the component has been destroyed. */
  private _destroyed = new Subject<void>();

  /** The tree node's data. */
  get data(): T { return this._data; }
  private _data: T;

  /**
   * The role of the node should be 'group' if it's an internal node,
   * and 'treeitem' if it's a leaf node.
   */
  @Input() role: 'treeitem' | 'group' = 'treeitem';

  constructor(private _elementRef: ElementRef,
              private _tree: CdkTree<T>) {

    this._data = CdkTreeNodeOutletContext.mostRecentContextData;
    this._setRoleFromData();
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }

  /** Focuses the menu item. Implements for FocusableOption. */
  focus(): void {
    this._elementRef.nativeElement.focus();
  }

  private _setRoleFromData(): void {
    if (this._tree.treeControl.isExpandable) {
      this.role = this._tree.treeControl.isExpandable(this._data) ? 'group' : 'treeitem';
    } else {
      if (!this._tree.treeControl.getChildren) {
        throw getTreeControlFunctionsMissingError();
      }
      takeUntil.call(this._tree.treeControl.getChildren(this._data), this._destroyed)
        .subscribe(children => {
          this.role = children ? 'group' : 'treeitem';
        });
    }
  }
}
