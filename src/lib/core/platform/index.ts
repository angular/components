import {NgModule, ModuleWithProviders} from '@angular/core';
import {MdPlatform} from './platform';
import {MdFeatureDetector} from './feature-detector';


@NgModule({})
export class MdPlatformModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdPlatformModule,
      providers: [MdFeatureDetector, MdPlatform],
    };
  }
}
