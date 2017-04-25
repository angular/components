import {MdTree, MdNode, MdNodeDef, MdNodeOutlet, MdNodePlaceholder} from './tree';
import {TreeDataSource, MdTreeViewData} from './data-source';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FocusOriginMonitor, MdRippleModule} from '../core';

export * from './data-source';
export * from './tree';

@NgModule({
  imports: [CommonModule, MdRippleModule],
  exports: [MdTree, MdNodeDef, MdNodeOutlet, MdNode, MdNodePlaceholder],
  declarations: [MdTree, MdNodeDef, MdNodeOutlet, MdNode, MdNodePlaceholder],
  providers: [FocusOriginMonitor]
})
export class MdTreeModule {}
