import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  MdRippleModule,
  MdCommonModule,
  UNIQUE_SELECTION_DISPATCHER_PROVIDER,
  FocusOriginMonitor,
  _VIEWPORT_RULER_PROVIDER
} from '@angular/material/core';
import {MdRadioGroup, MdRadioButton} from './radio';


@NgModule({
  imports: [CommonModule, MdRippleModule, MdCommonModule],
  exports: [MdRadioGroup, MdRadioButton, MdCommonModule],
  providers: [UNIQUE_SELECTION_DISPATCHER_PROVIDER, _VIEWPORT_RULER_PROVIDER, FocusOriginMonitor],
  declarations: [MdRadioGroup, MdRadioButton],
})
export class MdRadioModule {}


export * from './radio';
