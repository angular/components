/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
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
  booleanAttribute,
  numberAttribute,
} from '@angular/core';
import {NoopTreeKeyManager, TreeKeyManagerItem, TreeKeyManagerStrategy} from '@angular/cdk/a11y';

/**
 * Determinte if argument TreeKeyManager is the NoopTreeKeyManager. This function is safe to use with SSR.
 */
function isNoopTreeKeyManager<T extends TreeKeyManagerItem>(
  keyManager: TreeKeyManagerStrategy<T>,
): keyManager is NoopTreeKeyManager<T> {
  return !!(keyManager as any)._isNoopTreeKeyManager;
}

/**
 * Wrapper for the CdkTree node with Material design styles.
 */
@Directive({
  selector: 'mat-tree-node',
  exportAs: 'matTreeNode',
  outputs: ['activation', 'expandedChange'],
  providers: [{provide: CdkTreeNode, useExisting: MatTreeNode}],
  host: {
    'class': 'mat-tree-node',
    '[attr.aria-expanded]': '_getAriaExpanded()',
    '[attr.aria-level]': 'level + 1',
    '[attr.aria-posinset]': '_getPositionInSet()',
    '[attr.aria-setsize]': '_getSetSize()',
    '(click)': '_focusItem()',
    '[tabindex]': '_getTabindexAttribute()',
  },
  standalone: true,
})
export class MatTreeNode<T, K = T> extends CdkTreeNode<T, K> implements OnInit, OnDestroy {
  /**
   * The tabindex of the tree node.
   *
   * @deprecated By default MatTreeNode manages focus using TreeKeyManager instead of tabIndex.
   *   Recommend to avoid setting tabIndex directly to prevent TreeKeyManager form getting into
   *   an unexpected state. Tabindex to be removed in a future version.
   * @breaking-change 21.0.0 Remove this attribute.
   */
  @Input({
    transform: (value: unknown) => (value == null ? 0 : numberAttribute(value)),
    alias: 'tabIndex',
  })
  get tabIndexInputBinding(): number {
    return this._tabIndexInputBinding;
  }
  set tabIndexInputBinding(value: number) {
    // If the specified tabIndex value is null or undefined, fall back to the default value.
    this._tabIndexInputBinding = value;
  }
  private _tabIndexInputBinding: number;

  /**
   * The default tabindex of the tree node.
   *
   * @deprecated By default MatTreeNode manages focus using TreeKeyManager instead of tabIndex.
   *   Recommend to avoid setting tabIndex directly to prevent TreeKeyManager form getting into
   *   an unexpected state. Tabindex to be removed in a future version.
   * @breaking-change 21.0.0 Remove this attribute.
   */
  defaultTabIndex = 0;

  protected _getTabindexAttribute() {
    if (isNoopTreeKeyManager(this._tree._keyManager)) {
      return this.tabIndexInputBinding;
    }
    return this._tabindex;
  }

  /**
   * Whether the component is disabled.
   *
   * @deprecated This is an alias for `isDisabled`.
   * @breaking-change 21.0.0 Remove this input
   */
  @Input({transform: booleanAttribute})
  get disabled(): boolean {
    return this.isDisabled;
  }
  set disabled(value: boolean) {
    this.isDisabled = value;
  }

  constructor(
    elementRef: ElementRef<HTMLElement>,
    tree: CdkTree<T, K>,
    /**
     * The tabindex of the tree node.
     *
     * @deprecated By default MatTreeNode manages focus using TreeKeyManager instead of tabIndex.
     *   Recommend to avoid setting tabIndex directly to prevent TreeKeyManager form getting into
     *   an unexpected state. Tabindex to be removed in a future version.
     * @breaking-change 21.0.0 Remove this attribute.
     */
    @Attribute('tabindex') tabIndex: string,
  ) {
    super(elementRef, tree);

    this.tabIndexInputBinding = Number(tabIndex) || this.defaultTabIndex;
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
  inputs: [{name: 'when', alias: 'matTreeNodeDefWhen'}],
  providers: [{provide: CdkTreeNodeDef, useExisting: MatTreeNodeDef}],
  standalone: true,
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
  outputs: ['activation', 'expandedChange'],
  providers: [
    {provide: CdkNestedTreeNode, useExisting: MatNestedTreeNode},
    {provide: CdkTreeNode, useExisting: MatNestedTreeNode},
    {provide: CDK_TREE_NODE_OUTLET_NODE, useExisting: MatNestedTreeNode},
  ],
  host: {
    'class': 'mat-nested-tree-node',
  },
  standalone: true,
})
export class MatNestedTreeNode<T, K = T>
  extends CdkNestedTreeNode<T, K>
  implements AfterContentInit, OnDestroy, OnInit
{
  @Input('matNestedTreeNode') node: T;

  /**
   * Whether the node is disabled.
   *
   * @deprecated This is an alias for `isDisabled`.
   * @breaking-change 21.0.0 Remove this input
   */
  @Input({transform: booleanAttribute})
  get disabled(): boolean {
    return this.isDisabled;
  }
  set disabled(value: boolean) {
    this.isDisabled = value;
  }

  /** Tabindex of the node. */
  @Input({
    transform: (value: unknown) => (value == null ? 0 : numberAttribute(value)),
  })
  get tabIndex(): number {
    return this.isDisabled ? -1 : this._tabIndex;
  }
  set tabIndex(value: number) {
    // If the specified tabIndex value is null or undefined, fall back to the default value.
    this._tabIndex = value;
  }
  private _tabIndex: number;

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
