/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  Input,
  ViewEncapsulation
} from '@angular/core';
import {CdkTreeNodeToggle} from '@angular/cdk/tree';

/**
 * Wrapper for the CdkTree's toggle with Material design styles.
 */
@Directive({
  selector: '[matTreeNodeToggle]',
  host: {
    '(click)': '_toggle($event)',
  },
  providers: [{provide: CdkTreeNodeToggle, useExisting: MatTreeNodeToggle}]
})
export class MatTreeNodeToggle<T> extends CdkTreeNodeToggle<T> {
  @Input('matTreeNodeToggleRecursive') recursive: boolean = false;
}


/**
 * Toggle component with arrow icons
 */
@Component({
  moduleId: module.id,
  selector: 'mat-tree-node-toggle',
  exportAs: 'matTreeNodeToggle',
  templateUrl: 'toggle.html',
  styleUrls: ['toggle.css'],
  host: {
    'class': 'mat-tree-node-toggle',
    '(click)': '_toggle($event)',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatTreeNodeToggleComponent<T> extends CdkTreeNodeToggle<T> {
  /** Whether the toggle is recursive */
  @Input('matTreeNodeToggleRecursive') recursive: boolean = false;

  /** Used to set the aria-label attribute on the underlying input element. */
  @Input('aria-label') ariaLabel: string | null = null;

  /** Whether the current tree node is expandable */
  @Input()
  get isExpandable() {
    // For flat tree, use `isExpandable`
    // For nested tree, use `getDescendants`
    return this._tree.treeControl.isExpandable
      ? this._tree.treeControl.isExpandable(this._treeNode.data)
      : this._tree.treeControl.getDescendants(this._treeNode.data).length;
  }

  /** Whether the current tree node is expanded */
  @Input()
  get isExpanded() {
    return this._tree.treeControl.isExpanded(this._treeNode.data);
  }
}
