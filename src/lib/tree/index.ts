import {
  CdkTree,
  CdkNode,
  CdkNodeDef,
  CdkNodePlaceholder,
  MdNodeSelectTrigger,
  CdkNodeTrigger,
  CdkNodePadding,
  CdkNestedNode
} from './tree';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FocusOriginMonitor, MdRippleModule} from '../core';


export * from './data-source';
export * from './tree';
export * from './tree-node';
export * from './tree-control';

let treeComponents = [
  CdkTree,
  CdkNodeDef,
  CdkNode,
  CdkNodePlaceholder,
  MdNodeSelectTrigger,
  CdkNodeTrigger,
  CdkNodePadding,
  CdkNestedNode
];

@NgModule({
  imports: [CommonModule, MdRippleModule],
  exports: treeComponents,
  declarations: treeComponents,
  providers: [FocusOriginMonitor]
})
export class CdkTreeModule {}
