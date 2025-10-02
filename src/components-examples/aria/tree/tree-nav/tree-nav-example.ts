/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component} from '@angular/core';
import {NgTemplateOutlet} from '@angular/common';
import {Tree, TreeItem, TreeItemGroup, TreeItemGroupContent} from '@angular/aria/tree';
import {TreeNode, NODES} from '../tree-data';

/**
 * @title Tree with nav mode.
 */
@Component({
  selector: 'tree-nav-example',
  exportAs: 'TreeNavExample',
  templateUrl: 'tree-nav-example.html',
  styleUrl: '../tree-common.css',
  standalone: true,
  imports: [Tree, TreeItem, TreeItemGroup, TreeItemGroupContent, NgTemplateOutlet],
})
export class TreeNavExample {
  nodes: TreeNode[] = NODES;
}
