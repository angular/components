/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ContentChildren,
  Directive,
  Input,
  QueryList
} from '@angular/core';
import {
  CdkNestedTreeNode,
  CdkTreeNodeDef,
  CdkTreeNode,
} from '@angular/cdk/tree';
import {MatTreeNodeOutlet} from './outlet';

/**
 * Wrapper for the CdkTree node with Material design styles.
 */
// TODO(tinayuangao): use mixinTabIndex
@Directive({
  selector: 'mat-tree-node',
  exportAs: 'matTreeNode',
  host: {
    '[attr.role]': 'role',
    'class': 'mat-tree-node',
    'tabindex': '0',
  },
  providers: [{provide: CdkTreeNode, useExisting: MatTreeNode}]
})
export class MatTreeNode<T> extends CdkTreeNode<T> {
  @Input() role: 'treeitem' | 'group' = 'treeitem';
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
    '[attr.role]': 'role',
    'class': 'mat-nested-tree-node',
  },
  providers: [
    {provide: CdkNestedTreeNode, useExisting: MatNestedTreeNode},
    {provide: CdkTreeNode, useExisting: MatNestedTreeNode}
  ]
})
export class MatNestedTreeNode<T> extends CdkNestedTreeNode<T> {
  @Input('matNestedTreeNode') node: T;

  @ContentChildren(MatTreeNodeOutlet) nodeOutlet: QueryList<MatTreeNodeOutlet>;
}
