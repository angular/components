import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MaterialModule} from '@angular/material';
import {RouterModule} from '@angular/router';
import {Examples} from './examples';
import {SliderOverviewExample} from './slider-overview/slider-overview-example';
import {SliderConfigurableExample} from './slider-configurable/slider-configurable-example';
import {SidenavOverviewExample} from './sidenav-overview/sidenav-overview-example';
import {SidenavFabExample} from './sidenav-fab/sidenav-fab-example';
import {InputOverviewExample} from './input-overview/input-overview-example';
import {InputFormExample} from './input-form/input-form-example';
import {ButtonOverviewExample} from './button-overview/button-overview-example';
import {ButtonTypesExample} from './button-types/button-types-example';
import {CardOverviewExample} from './card-overview/card-overview-example';
import {CardFancyExample} from './card-fancy/card-fancy-example';
import {CheckboxOverviewExample} from './checkbox-overview/checkbox-overview-example';
import {CheckboxConfigurableExample} from './checkbox-configurable/checkbox-configurable-example';
import {ButtonToggleOverviewExample} from './button-toggle-overview/button-toggle-overview-example';
import {ButtonToggleExclusiveExample} from './button-toggle-exclusive/button-toggle-exclusive-example';
import {RadioOverviewExample} from './radio-overview/radio-overview-example';
import {RadioNgModelExample} from './radio-ngmodel/radio-ngmodel-example';
import {ToolbarOverviewExample} from './toolbar-overview/toolbar-overview-example';
import {ToolbarMultirowExample} from './toolbar-multirow/toolbar-multirow-example';
import {ListOverviewExample} from './list-overview/list-overview-example';
import {ListSectionsExample} from './list-sections/list-sections-example';
import {GridListOverviewExample} from './grid-list-overview/grid-list-overview-example';
import {GridListDynamicExample} from './grid-list-dynamic/grid-list-dynamic-example';


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
    CardOverviewExample,
    CardFancyExample,
    CheckboxOverviewExample,
    CheckboxConfigurableExample,
    ButtonToggleOverviewExample,
    ButtonToggleExclusiveExample,
    RadioOverviewExample,
    RadioNgModelExample,
    ToolbarOverviewExample,
    ToolbarMultirowExample,
    ListOverviewExample,
    ListSectionsExample,
    GridListOverviewExample,
    GridListDynamicExample,
  ],
})
export class ExamplesModule {}
