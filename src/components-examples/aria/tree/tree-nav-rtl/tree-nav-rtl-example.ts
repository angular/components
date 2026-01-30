/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component} from '@angular/core';
import {Dir} from '@angular/cdk/bidi';
import {NgTemplateOutlet} from '@angular/common';
import {Tree, TreeItem, TreeItemGroup} from '@angular/aria/tree';
import {TreeNode, NODES} from '../tree-data';

/**
 * @title Tree with nav mode.
 */
@Component({
  selector: 'tree-nav-rtl-example',
  templateUrl: 'tree-nav-rtl-example.html',
  styleUrl: '../tree-common.css',
  imports: [Dir, Tree, TreeItem, TreeItemGroup, NgTemplateOutlet],
})
export class TreeNavRtlExample {
  nodes: TreeNode[] = NODES;
}
