import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MaterialModule} from '@angular/material';
import {RouterModule} from '@angular/router';
import {Examples} from './examples';
import {SliderOverviewExample} from './slider/overview/slider-overview-example';
import {SliderConfigurableExample} from './slider/configurable/slider-configurable-example';
import {FormsModule} from '@angular/forms';
import {SidenavOverviewExample} from './sidenav/overview/sidenav-overview-example';
import {SidenavFabExample} from './sidenav/fab/sidenav-fab-example';
import {InputOverviewExample} from './input/overview/input-overview-example';
import {InputFormExample} from './input/form/input-form-example';
import {ButtonOverviewExample} from './button/overview/button-overview-example';
import {ButtonTypesExample} from './button/types/button-types-example';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    RouterModule
  ],
  declarations: [
    Examples,
    SliderOverviewExample,
    SliderConfigurableExample,
    SidenavOverviewExample,
    SidenavFabExample,
    InputOverviewExample,
    InputFormExample,
    ButtonOverviewExample,
    ButtonTypesExample,
  ],
})
export class ExamplesModule {}
