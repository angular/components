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
import {IconOverviewExample} from './icon-overview/icon-overview-example';
import {IconSvgExample} from './icon-svg-example/icon-svg-example';
import {ProgressCircleOverviewExample} from './progress-circle-overview/progress-circle-overview-example';
import {ProgressCircleConfigurableExample} from './progress-circle-configurable/progress-circle-configurable-example';
import {ProgressBarOverviewExample} from './progress-bar-overview/progress-bar-overview-example';
import {ProgressBarConfigurableExample} from './progress-bar-configurable/progress-bar-configurable-example';
import {TabsOverviewExample} from './tabs-overview/tabs-overview-example';
import {TabsTemplateLabelExample} from './tabs-template-label/tabs-template-label-example';
import {SlideToggleOverviewExample} from './slide-toggle-overview/slide-toggle-overview-example';
import {SlideToggleConfigurableExample} from './slide-toggle-configurable/slide-toggle-configurable-example';
import {MenuOverviewExample} from './menu-overview/menu-overview-example';
import {MenuIconsExample} from './menu-icons/menu-icons-example';
import {TooltipOverviewExample} from './tooltip-overview/tooltip-overview-example';
import {TooltipPositionExample} from './tooltip-position/tooltip-position-example';
import {
  DialogOverviewExample,
  DialogOverviewExampleDialog
} from './dialog-overview/dialog-overview-example';
import {
  DialogResultExample,
  DialogResultExampleDialog
} from './dialog-result/dialog-result-example';


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
    IconOverviewExample,
    IconSvgExample,
    ProgressCircleOverviewExample,
    ProgressCircleConfigurableExample,
    ProgressBarOverviewExample,
    ProgressBarConfigurableExample,
    TabsOverviewExample,
    TabsTemplateLabelExample,
    SlideToggleOverviewExample,
    SlideToggleConfigurableExample,
    MenuOverviewExample,
    MenuIconsExample,
    TooltipOverviewExample,
    TooltipPositionExample,
    DialogOverviewExample,
    DialogOverviewExampleDialog,
    DialogResultExample,
    DialogResultExampleDialog,
  ],
  entryComponents: [
    DialogOverviewExampleDialog,
    DialogResultExampleDialog,
  ],
})
export class ExamplesModule {}
