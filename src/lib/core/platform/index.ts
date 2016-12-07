import {NgModule, ModuleWithProviders} from '@angular/core';
import {MdPlatform} from './platform';


@NgModule({})
export class MdPlatformModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdPlatformModule,
      providers: [MdPlatform],
    };
  }
}
