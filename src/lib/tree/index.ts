import {MdTree, MdNode, MdNodeDef, MdNodePlaceholder, MdNodeExpandTrigger, MdNodePadding, MdNestedNode} from './tree';
import {TreeDataSource, MdTreeViewData} from './data-source';
import {NgModule, ModuleWithProviders} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FocusOriginMonitor, MdRippleModule} from '../core';

export * from './data-source';
export * from './tree';

@NgModule({
  imports: [CommonModule, MdRippleModule],
  exports: [MdTree, MdNodeDef, MdNode, MdNodePlaceholder, MdNodeExpandTrigger, MdNodePadding, MdNestedNode],
  declarations: [MdTree, MdNodeDef, MdNode, MdNodePlaceholder, MdNodeExpandTrigger, MdNodePadding, MdNestedNode],
  providers: [FocusOriginMonitor]
})
export class MdTreeModule {
  /** @deprecated */
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdTreeModule,
    };
  }
}
