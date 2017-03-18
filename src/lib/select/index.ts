import {NgModule, ModuleWithProviders} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MdSelect} from './select';
import {MdOptionModule} from '../core/option/option';
import {CompatibilityModule, OverlayModule} from '../core';


@NgModule({
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    OverlayModule,
    MdOptionModule,
    CompatibilityModule,
  ],
  exports: [MdSelect, MdOptionModule, CompatibilityModule],
  declarations: [MdSelect],
})
export class MdSelectModule {
  /** @deprecated */
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdSelectModule,
      providers: []
    };
  }
}


export * from './select';
export {fadeInContent, transformPanel, transformPlaceholder} from './select-animations';
