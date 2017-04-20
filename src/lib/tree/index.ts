import {MdTree, MdNodeContext} from './tree';
import {MdTreeNode} from './tree-node';
import {MdTreeDataSource, MdTreeNodes} from './data-source';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TreeModel, TreeNodeModel, TreeData} from './tree-model';
import {FocusOriginMonitor, MdRippleModule} from '../core';

export * from './data-source';
export * from './tree-model';

@NgModule({
  imports: [CommonModule, MdRippleModule],
  exports: [MdTreeNode, MdTree, MdNodeContext, MdTreeNode],
  declarations: [MdTreeNode, MdTree, MdNodeContext, MdTreeNode],
  providers: [FocusOriginMonitor]
})
export class MdTreeModule {}
