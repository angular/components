import {CdkTree, CdkNode, CdkNodeDef, CdkNodePlaceholder, MdNodeSelectTrigger, CdkNodeTrigger, CdkNodePadding} from './tree';
import {TreeDataSource, FlatTreeControl} from './data-source';
import {NgModule, ModuleWithProviders} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FocusOriginMonitor, MdRippleModule} from '../core';


export * from './data-source';
export * from './tree';
export * from './tree-node';

@NgModule({
  imports: [CommonModule, MdRippleModule],
  exports: [CdkTree, CdkNodeDef, CdkNode, CdkNodePlaceholder, MdNodeSelectTrigger, CdkNodeTrigger, CdkNodePadding],
  declarations: [CdkTree, CdkNodeDef, CdkNode, CdkNodePlaceholder, MdNodeSelectTrigger, CdkNodeTrigger, CdkNodePadding],
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
