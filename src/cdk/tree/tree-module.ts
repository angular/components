/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FocusMonitor} from '@angular/cdk/a11y';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {CdkTreeNodeOutlet} from './outlet';
import {CdkTreeNodePadding} from './padding';
import {CdkTreeNodeTrigger} from './trigger';
import {CdkTree} from './tree';
import {CdkTreeNodeDef, CdkTreeNode} from './node';
import {CdkNestedTreeNode} from './nested-node';

const EXPORTED_DECLARATIONS = [
  CdkNestedTreeNode,
  CdkTreeNodeDef,
  CdkTreeNodePadding,
  CdkTreeNodeTrigger,
  CdkTree,
  CdkTreeNode,
  CdkTreeNodeOutlet,
];

@NgModule({
  imports: [CommonModule],
  exports: EXPORTED_DECLARATIONS,
  declarations: EXPORTED_DECLARATIONS,
  providers: [FocusMonitor, CdkTreeNodeDef]
})
export class CdkTreeModule {}
