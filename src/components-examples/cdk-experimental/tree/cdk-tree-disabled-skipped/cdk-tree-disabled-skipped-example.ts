/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component} from '@angular/core';
import {NgTemplateOutlet} from '@angular/common';
import {
  CdkTree,
  CdkTreeItem,
  CdkTreeItemGroup,
  CdkTreeItemGroupContent,
} from '@angular/cdk-experimental/tree';
import {TreeNode, NODES} from '../tree-data';

/**
 * @title Tree with skipped disabled items.
 */
@Component({
  selector: 'cdk-tree-disabled-skipped-example',
  exportAs: 'cdkTreeDisabledSkippedExample',
  templateUrl: 'cdk-tree-disabled-skipped-example.html',
  styleUrl: '../tree-common.css',
  standalone: true,
  imports: [CdkTree, CdkTreeItem, CdkTreeItemGroup, CdkTreeItemGroupContent, NgTemplateOutlet],
})
export class CdkTreeDisabledSkippedExample {
  nodes: TreeNode[] = NODES;
}
