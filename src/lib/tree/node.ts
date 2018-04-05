/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FocusMonitor} from '@angular/cdk/a11y';
import {
  CdkNestedTreeNode,
  CdkTree,
  CdkTreeKeyboardInteraction,
  CdkTreeNode,
  CdkTreeNodeDef,
} from '@angular/cdk/tree';
import {
  AfterContentInit,
  Attribute,
  ContentChildren,
  Directive,
  ElementRef,
  Input,
  IterableDiffers,
  OnDestroy,
  Optional,
  QueryList
} from '@angular/core';
import {CanDisable, HasTabIndex, mixinDisabled, mixinTabIndex} from '@angular/material/core';
import {MatTreeNodeOutlet} from './outlet';


export const _MatTreeNodeMixinBase = mixinTabIndex(mixinDisabled(CdkTreeNode));
export const _MatNestedTreeNodeMixinBase = mixinTabIndex(mixinDisabled(CdkNestedTreeNode));

/**
 * Wrapper for the CdkTree node with Material design styles.
 */
@Directive({
  selector: 'mat-tree-node',
  exportAs: 'matTreeNode',
  inputs: ['disabled', 'tabIndex'],
  host: {
    '[attr.tabindex]': 'tabIndex',
    '[attr.aria-expanded]': 'isExpanded',
    '[attr.aria-level]': 'role === "treeitem" ? level : null',
    '[attr.role]': 'role',
    'class': 'mat-tree-node',
    '(focus)': '_focus()',
  },
  providers: [{provide: CdkTreeNode, useExisting: MatTreeNode}]
})
export class MatTreeNode<T> extends _MatTreeNodeMixinBase<T>
    implements CanDisable, HasTabIndex {
  @Input() role: 'treeitem' | 'group' = 'treeitem';

  constructor(protected _elementRef: ElementRef,
              protected _tree: CdkTree<T>,
              protected _focusMonitor: FocusMonitor,
              @Optional() public _treeInteraction: CdkTreeKeyboardInteraction<T>,
              @Attribute('tabindex') tabIndex: string) {
    super(_elementRef, _tree, _focusMonitor, _treeInteraction);

    this.tabIndex = Number(tabIndex) || (_treeInteraction ? -1 : 0);
  }
}

/**
 * Wrapper for the CdkTree node definition with Material design styles.
 */
@Directive({
  selector: '[matTreeNodeDef]',
  inputs: [
    'when: matTreeNodeDefWhen'
  ],
  providers: [{provide: CdkTreeNodeDef, useExisting: MatTreeNodeDef}]
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
  host: {
    '[attr.tabindex]': 'tabIndex',
    '[attr.aria-expanded]': 'isExpanded',
    '[attr.role]': 'role',
    'class': 'mat-nested-tree-node',
    '(focus)': '_focus()',
  },
  inputs: ['disabled', 'tabIndex'],
  providers: [
    {provide: CdkNestedTreeNode, useExisting: MatNestedTreeNode},
    {provide: CdkTreeNode, useExisting: MatNestedTreeNode}
  ]
})
export class MatNestedTreeNode<T> extends _MatNestedTreeNodeMixinBase<T>
    implements AfterContentInit, CanDisable, HasTabIndex, OnDestroy {

  @Input('matNestedTreeNode') node: T;

  @ContentChildren(MatTreeNodeOutlet) nodeOutlet: QueryList<MatTreeNodeOutlet>;

  constructor(protected _elementRef: ElementRef,
              protected _tree: CdkTree<T>,
              protected _focusMonitor: FocusMonitor,
              @Optional() public _treeInteraction: CdkTreeKeyboardInteraction<T>,
              protected _differs: IterableDiffers,
              @Attribute('tabindex') tabIndex: string) {
    super(_elementRef, _tree, _focusMonitor, _treeInteraction, _differs);

    this.tabIndex = Number(tabIndex) || (_treeInteraction ? -1 : 0);
  }

  // This is a workaround for https://github.com/angular/angular/issues/23091
  // In aot mode, the lifecycle hooks from parent class are not called.
  // TODO(tinayuangao): Remove when the angular issue #23091 is fixed
  ngAfterContentInit() {
    super.ngAfterContentInit();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }
}
