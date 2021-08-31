/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CdkTreeModule} from '@angular/cdk/tree';
import {NgModule} from '@angular/core';
import {MatCommonModule} from '@angular/material/core';

import {MatNestedTreeNode, MatTreeNode, MatTreeNodeDef} from './node';
import {MatTreeNodeOutlet} from './outlet';
import {MatTreeNodePadding} from './padding';
import {MatTreeNodeToggle} from './toggle';
import {MatTree} from './tree';

const MAT_TREE_DIRECTIVES = [
  MatNestedTreeNode, MatTreeNodeDef, MatTreeNodePadding, MatTreeNodeToggle, MatTree, MatTreeNode,
  MatTreeNodeOutlet
];

@NgModule({
  imports: [CdkTreeModule, MatCommonModule],
  exports: [MatCommonModule, MAT_TREE_DIRECTIVES],
  declarations: MAT_TREE_DIRECTIVES,
})
export class MatTreeModule {
}
