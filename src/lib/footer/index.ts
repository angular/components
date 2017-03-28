import { NgModule, ModuleWithProviders } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CompatibilityModule } from '../core';
import { MdFooter, MdFooterUL, MdFooterLeft, MdFooterRight, MdFooterTop, MdFooterMiddle, MdFooterDropDown, MdFooterBottom, MdFooterLogo } from './footer';


@NgModule({
  imports: [CompatibilityModule, BrowserModule],
  exports: [MdFooter, MdFooterUL, MdFooterLeft, MdFooterRight, MdFooterTop, MdFooterMiddle, MdFooterDropDown, MdFooterBottom, MdFooterLogo, CompatibilityModule],
  declarations: [MdFooter, MdFooterUL, MdFooterLeft, MdFooterRight, MdFooterTop, MdFooterMiddle, MdFooterDropDown, MdFooterBottom, MdFooterLogo],
})
export class MdFooterModule {
  /** @deprecated */
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdFooterModule,
      providers: []
    };
  }
}


export * from './footer';
