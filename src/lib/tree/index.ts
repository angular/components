import {CdkTree, CdkNode, CdkNodeDef, CdkNodePlaceholder, MdNodeSelectTrigger, CdkNodeTrigger, CdkNodePadding, CdkNestedNode} from './tree';
import {TreeDataSource, MdTreeViewData} from './data-source';
import {NgModule, ModuleWithProviders} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FocusOriginMonitor, MdRippleModule} from '../core';

export * from './data-source';
export * from './tree';

@NgModule({
  imports: [CommonModule, MdRippleModule],
  exports: [CdkTree, CdkNodeDef, CdkNode, CdkNodePlaceholder, MdNodeSelectTrigger, CdkNodeTrigger, CdkNodePadding, CdkNestedNode],
  declarations: [CdkTree, CdkNodeDef, CdkNode, CdkNodePlaceholder, MdNodeSelectTrigger, CdkNodeTrigger, CdkNodePadding, CdkNestedNode],
  providers: [FocusOriginMonitor]
})
export class CdkTreeModule {
  /** @deprecated */
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: CdkTreeModule,
    };
  }
}
