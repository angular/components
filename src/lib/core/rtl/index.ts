import {ModuleWithProviders, NgModule} from '@angular/core';
import {Dir} from './dir';
import {GlobalDirAccessor} from './global-dir-accessor';

export {Dir, LayoutDirection} from './dir';
export {GlobalDirAccessor} from './global-dir-accessor';

@NgModule({
  exports: [Dir],
  declarations: [Dir]
})
export class RtlModule {
  /** @deprecated */
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: RtlModule,
      providers: [GlobalDirAccessor]
    };
  }
}
