import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MaterialModule} from '@angular/material';
import {RouterModule} from '@angular/router';
import {Examples} from './examples';
import {SliderOverviewExample} from './slider/overview/slider-overview-example';


@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule
  ],
  declarations: [
    Examples,
    SliderOverviewExample
  ],
})
export class ExamplesModule {}
