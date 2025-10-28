/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component} from '@angular/core';
import {NgTemplateOutlet} from '@angular/common';
import {Tree, TreeItem, TreeItemGroup} from '@angular/aria/tree';
import {TreeNode, NODES} from '../tree-data';

/**
 * @title Tree with active descendant focus.
 */
@Component({
  selector: 'tree-rtl-active-descendant-example',
  templateUrl: 'tree-rtl-active-descendant-example.html',
  styleUrl: '../tree-common.css',
  imports: [Tree, TreeItem, TreeItemGroup, NgTemplateOutlet],
})
export class TreeRtlActiveDescendantExample {
  nodes: TreeNode[] = NODES;
}
