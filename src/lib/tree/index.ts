import {MdTree, MdNodeContext, MdTreeNode, NgForTreeContext} from './tree';
import {MdTreeDataSource, MdTreeNodes} from './data-source';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

export * from './data-source';
export {NgForTreeContext} from './tree';

@NgModule({
  imports: [CommonModule],
  exports: [MdTreeNode, MdTree, MdNodeContext, MdTreeNode],
  declarations: [MdTreeNode, MdTree, MdNodeContext, MdTreeNode],
})
export class MdTreeModule {}
