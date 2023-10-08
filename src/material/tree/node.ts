/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  CDK_TREE_NODE_OUTLET_NODE,
  CdkNestedTreeNode,
  CdkTree,
  CdkTreeNode,
  CdkTreeNodeDef,
} from '@angular/cdk/tree';
import {
  AfterContentInit,
  Attribute,
  Directive,
  ElementRef,
  Input,
  IterableDiffers,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {CanDisable, HasTabIndex} from '@angular/material/core';
import {BooleanInput, coerceBooleanProperty} from '@angular/cdk/coercion';

/**
 * Wrapper for the CdkTree node with Material design styles.
 */
@Directive({
  selector: 'mat-tree-node',
  exportAs: 'matTreeNode',
  inputs: ['role', 'disabled', 'tabIndex', 'isExpandable', 'isExpanded', 'isDisabled'],
  outputs: ['activation', 'expandedChange'],
  providers: [{provide: CdkTreeNode, useExisting: MatTreeNode}],
  host: {
    'class': 'mat-tree-node',
    '[attr.aria-expanded]': '_getAriaExpanded()',
    '[attr.aria-level]': 'level + 1',
    '[attr.aria-posinset]': '_getPositionInSet()',
    '[attr.aria-setsize]': '_getSetSize()',
    'tabindex': '-1',
    '(click)': '_setActiveItem()',
  },
})
export class MatTreeNode<T, K = T>
  extends CdkTreeNode<T, K>
  implements CanDisable, HasTabIndex, OnInit, OnDestroy
{
  /**
   * The tabindex of the tree node.
   *
   * @deprecated MatTreeNode ignores this proprety. Changing tabIndex has no affect. The tree
   *   automatically determines the appropriate tabindex for the tree node. To be removed in a
   *   future version.
   * @breaking-change 19.0.0 Remove this attribute.
   */
  tabIndex: number;

  /**
   * The tabindex of the tree node.
   *
   * @deprecated MatTreeNode ignores this proprety. Changing defaultTabIndex has no affect. The tree
   *   automatically determines the appropriate tabindex for the tree node. To be removed in a
   *   future version.
   * @breaking-change 19.0.0 Remove this attribute.
   */
  defaultTabIndex: number;

  /**
   * Whether the component is disabled.
   *
   * @deprecated This is an alias for `isDisabled`.
   * @breaking-change 19.0.0 Remove this input
   */
  get disabled(): boolean {
    return this.isDisabled ?? false;
  }
  set disabled(value: BooleanInput) {
    this.isDisabled = coerceBooleanProperty(value);
  }

  constructor(
    elementRef: ElementRef<HTMLElement>,
    tree: CdkTree<T, K>,
    // Ignore tabindex attribute. MatTree manages its own active state using TreeKeyManager.
    // Keeping tabIndex in constructor for backwards compatibility with trees created before
    // introducing TreeKeyManager.
    @Attribute('tabindex') tabIndex: string,
  ) {
    super(elementRef, tree);
  }

  // This is a workaround for https://github.com/angular/angular/issues/23091
  // In aot mode, the lifecycle hooks from parent class are not called.
  override ngOnInit() {
    super.ngOnInit();
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
  }
}

/**
 * Wrapper for the CdkTree node definition with Material design styles.
 * Captures the node's template and a when predicate that describes when this node should be used.
 */
@Directive({
  selector: '[matTreeNodeDef]',
  inputs: ['when: matTreeNodeDefWhen'],
  providers: [{provide: CdkTreeNodeDef, useExisting: MatTreeNodeDef}],
})
export class MatTreeNodeDef<T> extends CdkTreeNodeDef<T> {
  @Input('matTreeNode') data: T;
}

/**
 * Wrapper for the CdkTree nested node with Material design styles.
 */
@Directive({
  selector: 'mat-nested-tree-node',
  exportAs: 'matNestedTreeNode',
  inputs: ['role', 'disabled', 'tabIndex', 'isExpandable', 'isExpanded', 'isDisabled'],
  outputs: ['activation', 'expandedChange'],
  providers: [
    {provide: CdkNestedTreeNode, useExisting: MatNestedTreeNode},
    {provide: CdkTreeNode, useExisting: MatNestedTreeNode},
    {provide: CDK_TREE_NODE_OUTLET_NODE, useExisting: MatNestedTreeNode},
  ],
  host: {
    'class': 'mat-nested-tree-node',
  },
})
export class MatNestedTreeNode<T, K = T>
  extends CdkNestedTreeNode<T, K>
  implements AfterContentInit, OnDestroy, OnInit
{
  @Input('matNestedTreeNode') node: T;

  /**
   * Whether the component is disabled.
   *
   * @deprecated This is an alias for `isDisabled`.
   * @breaking-change 19.0.0 Remove this input
   */
  get disabled(): boolean {
    return this.isDisabled ?? false;
  }
  set disabled(value: BooleanInput) {
    this.isDisabled = coerceBooleanProperty(value);
  }

  constructor(
    elementRef: ElementRef<HTMLElement>,
    tree: CdkTree<T, K>,
    differs: IterableDiffers,
    // Ignore tabindex attribute. MatTree manages its own active state using TreeKeyManager.
    // Keeping tabIndex in constructor for backwards compatibility with trees created before
    // introducing TreeKeyManager.
    @Attribute('tabindex') tabIndex: string,
  ) {
    super(elementRef, tree, differs);
  }

  // This is a workaround for https://github.com/angular/angular/issues/19145
  // In aot mode, the lifecycle hooks from parent class are not called.
  // TODO(tinayuangao): Remove when the angular issue #19145 is fixed
  override ngOnInit() {
    super.ngOnInit();
  }

  override ngAfterContentInit() {
    super.ngAfterContentInit();
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
  }
}
