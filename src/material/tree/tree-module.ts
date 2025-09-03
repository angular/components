/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {BidiModule} from '@angular/cdk/bidi';
import {NgModule} from '@angular/core';

import {CdkTreeModule} from '@angular/cdk/tree';
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
  imports: [CdkTreeModule, ...MAT_TREE_DIRECTIVES],
  exports: [BidiModule, MAT_TREE_DIRECTIVES],
})
export class MatTreeModule {}
