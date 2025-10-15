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
 * @title Tree with disabled state.
 */
@Component({
  selector: 'tree-disabled-example',
  exportAs: 'TreeDisabledExample',
  templateUrl: 'tree-disabled-example.html',
  styleUrl: '../tree-common.css',
  standalone: true,
  imports: [Tree, TreeItem, TreeItemGroup, NgTemplateOutlet],
})
export class TreeDisabledExample {
  nodes: TreeNode[] = NODES;
}
