/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';

import {TREE_KEY_MANAGER_FACTORY_PROVIDER} from '@angular/cdk/a11y';
import {CdkTreeModule} from '@angular/cdk/tree';
import {MatCommonModule} from '@angular/material/core';
import {MatNestedTreeNode, MatTreeNodeDef, MatTreeNode} from './node';
import {MatTree} from './tree';
import {MatTreeNodeToggle} from './toggle';
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
];

@NgModule({
  imports: [CdkTreeModule, MatCommonModule],
  exports: [MatCommonModule, MAT_TREE_DIRECTIVES],
  declarations: MAT_TREE_DIRECTIVES,
  providers: [TREE_KEY_MANAGER_FACTORY_PROVIDER],
})
export class MatTreeModule {}
