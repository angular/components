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
import {MatCommonModule} from '@angular/material/core';
import {MatNestedTreeNode, MatTreeNodeDef, MatTreeNode} from './node';
import {MatTree} from './tree';
import {MatTreeNodeTrigger} from './trigger';
import {MatTreeNodeOutlet} from './outlet';
import {MatTreeNodePadding} from './padding';

const MAT_TREE_DIRECTIVES = [
  MatNestedTreeNode,
  MatTreeNodeDef,
  MatTreeNodePadding,
  MatTreeNodeTrigger,
  MatTree,
  MatTreeNode,
  MatTreeNodeOutlet,
];

@NgModule({
  imports: [CdkTreeModule, CommonModule, MatCommonModule],
  exports: MAT_TREE_DIRECTIVES,
  declarations: MAT_TREE_DIRECTIVES,
})
export class MatTreeModule {}
