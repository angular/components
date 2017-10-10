import {FocusMonitor} from '@angular/cdk/a11y';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {CdkNodePadding} from './padding';
import {CdkNodeTrigger} from './trigger';
import {CdkTree} from './tree';
import {CdkNodeDef, CdkTreeNode} from './node';
import {CdkNestedNode} from './nested-node';
import {CdkNodePlaceholder} from './placeholder';

const EXPORTED_DECLARATIONS = [
  CdkNestedNode,
  CdkNodeDef,
  CdkNodePadding,
  CdkNodePlaceholder,
  CdkNodeTrigger,
  CdkTree,
  CdkTreeNode,
];

@NgModule({
  imports: [CommonModule],
  exports: EXPORTED_DECLARATIONS,
  declarations: EXPORTED_DECLARATIONS,
  providers: [FocusMonitor]
})
export class CdkTreeModule {}
