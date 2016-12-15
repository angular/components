import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MaterialModule} from '@angular/material';
import {RouterModule} from '@angular/router';
import {Examples} from './examples';
import {SimpleSliderExample} from './slider/simple/simple-slider-example';


@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule
  ],
  declarations: [
    Examples,
    SimpleSliderExample
  ],
})
export class ExamplesModule {}
