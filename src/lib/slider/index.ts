import {NgModule} from '@angular/core';
import {HAMMER_GESTURE_CONFIG} from '@angular/platform-browser';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MdCommonModule, GestureConfig, StyleModule, RtlModule} from '@angular/material/core';
import {MdSlider} from './slider';


@NgModule({
  imports: [CommonModule, FormsModule, MdCommonModule, StyleModule, RtlModule],
  exports: [MdSlider, MdCommonModule],
  declarations: [MdSlider],
  providers: [{provide: HAMMER_GESTURE_CONFIG, useClass: GestureConfig}]
})
export class MdSliderModule {}


export * from './slider';
