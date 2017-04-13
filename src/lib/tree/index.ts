import {MdTree, MdNodeContext, MdTreeNode, NgForTreeContext} from './tree';
import {MdTreeDataSource, MdTreeNodes} from './data-source';
import {NgModule} from '@angular/core';

export * from './data-source';
export {NgForTreeContext} from './tree';

@NgModule({
  imports: [],
  exports: [MdTreeNode, MdTree],
  declarations: [MdTreeNode, MdTree],
})
export class MdTreeModule {}
