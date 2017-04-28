import {ModuleWithProviders, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MdCommonModule, MdRippleModule, StyleModule} from '../core';
import {
  MdAnchor,
  MdButton,
  MdButtonCssMatStyler,
  MdFabCssMatStyler,
  MdIconButtonCssMatStyler,
  MdMiniFabCssMatStyler,
  MdSocialButtonCssMatStyler,
  MdRaisedButtonCssMatStyler
} from './button';


export * from './button';


@NgModule({
  imports: [
    CommonModule,
    MdRippleModule,
    MdCommonModule,
    StyleModule,
  ],
  exports: [
    MdButton,
    MdAnchor,
    MdCommonModule,
    MdButtonCssMatStyler,
    MdRaisedButtonCssMatStyler,
    MdIconButtonCssMatStyler,
    MdFabCssMatStyler,
    MdSocialButtonCssMatStyler,
    MdMiniFabCssMatStyler,
  ],
  declarations: [
    MdButton,
    MdAnchor,
    MdButtonCssMatStyler,
    MdRaisedButtonCssMatStyler,
    MdIconButtonCssMatStyler,
    MdFabCssMatStyler,
    MdSocialButtonCssMatStyler,
    MdMiniFabCssMatStyler,
  ],
})
export class MdButtonModule {
  /** @deprecated */
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdButtonModule,
      providers: []
    };
  }
}
