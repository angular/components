/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';

import {CdkTreeModule} from '@angular/cdk/tree';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatCommonModule} from '@angular/material/core';
import {MatNestedTreeNode, MatTreeNodeDef, MatTreeNode} from './node';
import {MatTree} from './tree';
import {MatTreeNodeToggle, MatTreeNodeToggleComponent} from './toggle';
import {MatTreeNodeOutlet} from './outlet';
import {MatTreeNodePadding} from './padding';

const MAT_TREE_DIRECTIVES = [
  MatNestedTreeNode,
  MatTreeNodeDef,
  MatTreeNodePadding,
  MatTreeNodeToggle,
  MatTree,
  MatTreeNode,
  MatTreeNodeOutlet,
  MatTreeNodeToggleComponent
];

@NgModule({
  imports: [CdkTreeModule, CommonModule, MatCommonModule, MatButtonModule],
  exports: MAT_TREE_DIRECTIVES,
  declarations: MAT_TREE_DIRECTIVES,
})
export class MatTreeModule {}
