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
import {takeUntil} from 'rxjs/operators/takeUntil';
import {Subject} from 'rxjs/Subject';
import {CdkTree} from './tree';
import {getTreeControlFunctionsMissingError} from './tree-errors';


/** Context provided to the tree node component. */
export class CdkTreeNodeOutletContext<T> {
  /** Data for the node. */
  $implicit: T;

  /** Index location of the node. */
  index?: number;

  /** Length of the number of total dataNodes. */
  count?: number;

  constructor(data: T) {
    this.$implicit = data;
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
  when: (index: number, nodeData: T) => boolean;

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
    '[attr.aria-expanded]': 'isExpanded',
    '[attr.aria-level]': 'level',
    '[attr.role]': 'role',
    'class': 'cdk-tree-node',
  },
})
export class CdkTreeNode<T>  implements FocusableOption, OnDestroy {
  /**
   * The most recently created `CdkTreeNode`. We save it in static variable so we can retrieve it
   * in `CdkTree` and set the data to it.
   */
  static mostRecentTreeNode: CdkTreeNode<any> | null = null;

  /** Subject that emits when the component has been destroyed. */
  protected _destroyed = new Subject<void>();

  /** The tree node's data. */
  get data(): T { return this._data; }
  set data(value: T) {
    this._data = value;
    this._setRoleFromData();
  }
  protected _data: T;

  get isExpanded(): boolean {
    return this._tree.treeControl.isExpanded(this._data);
  }

  get level(): number {
    return this._tree.treeControl.getLevel ? this._tree.treeControl.getLevel(this._data) : 0;
  }

  /**
   * The role of the node should be 'group' if it's an internal node,
   * and 'treeitem' if it's a leaf node.
   */
  @Input() role: 'treeitem' | 'group' = 'treeitem';

  constructor(protected _elementRef: ElementRef,
              protected _tree: CdkTree<T>) {
    CdkTreeNode.mostRecentTreeNode = this;
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
      this._tree.treeControl.getChildren(this._data).pipe(takeUntil(this._destroyed))
        .subscribe(children => {
          this.role = children && children.length ? 'group' : 'treeitem';
        });
    }
  }
}
