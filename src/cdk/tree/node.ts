/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
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
  ViewContainerRef,
  ViewEncapsulation
} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';
import {FlatNode, NestedNode} from './tree-data';

/** The tree node template */
export const CDK_TREE_NODE_TEMPLATE = '<ng-content cdkNodeOutlet></ng-content>';


/**
 * Data node definition for the CdkTree.
 * Captures the node's template and a when predicate that describes when this node should be used.
 */
@Directive({
  selector: '[cdkNodeDef]',
  inputs: ['when: cdkNodeDefWhen'],
})
export class CdkNodeDef<T extends FlatNode|NestedNode> {
  /**
   * Function that should return true if this node template should be used for the provided node
   * data and index. If left undefined, this node will be considered the default node template to
   * use when no other when functions return true for the data.
   * For every node, there must be at least one when function that passes or an undefined to
   * default.
   */
  when: (nodeData: T, index: number) => boolean;

  constructor(public template: TemplateRef<any>) {}
}


/**
 * Tree node for CdkTree. It contains the data in the tree node.
 */
// TODO: Role should be group for expandable ndoes
@Component({
  selector: 'cdk-tree-node',
  exportAs: 'cdkTreeNode',
  template: CDK_TREE_NODE_TEMPLATE,
  host: {
    '[attr.role]': 'role',
    'class': 'cdk-tree-node',
    'tabindex': '0',
  },
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CdkTreeNode<T extends FlatNode|NestedNode>  implements FocusableOption, OnDestroy {
  /** Subscription for tree's children */
  private _childrenSubscrition: Subscription;

  /** The tree node data */
  @Input('cdkNode')
  set data(v: T) {
    this._data = v;
    if (this._childrenSubscrition) {
      this._childrenSubscrition.unsubscribe();
    }
    if ('level' in v) {
      this.role = (this._data as FlatNode).expandable ? 'group' : 'treeitem';
    } else {
      this._childrenSubscrition = (this._data as NestedNode).getChildren().subscribe((children) => {
        this.role = !!children ? 'group' : 'treeitem';
      });
    }
  }
  get data(): T { return this._data; }
  _data: T;


  /** The offset top of the element. Used by CdkTree to decide the order of the nodes. [Focus] */
  get offsetTop() {
    return this._elementRef.nativeElement.offsetTop;
  }

  /**
   * The role of the node should be 'group' if it's an internal node,
   * and 'treeitem' if it's a leaf node.
   */
  @Input() role: string = 'treeitem';

  constructor(private _elementRef: ElementRef) {}

  ngOnDestroy() {
    if (this._childrenSubscrition) {
      this._childrenSubscrition.unsubscribe();
    }
  }

  /** Focuses the menu item. Implements for FocusableOptoin. */
  focus(): void {
    this._elementRef.nativeElement.focus();
  }
}
