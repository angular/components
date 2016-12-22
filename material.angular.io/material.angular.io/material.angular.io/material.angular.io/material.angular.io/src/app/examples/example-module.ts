import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {MaterialModule} from '@angular/material';
import {ButtonOverviewExample} from './button-overview/button-overview-example';
import {ButtonTypesExample} from './button-types/button-types-example';
import {CheckboxOverviewExample} from './checkbox-overview/checkbox-overview-example';
import {SliderConfigurableExample} from './slider-configurable/slider-configurable-example';
import {TabsOverviewExample} from './tabs-overview/tabs-overview-example';
import {
  SnackBarComponentExampleSnack,
  SnackBarComponentExample
} from './snack-bar-component/snack-bar-component-example';
import {
  ProgressBarConfigurableExample
} from './progress-bar-configurable/progress-bar-configurable-example';
import {
  DialogOverviewExampleDialog,
  DialogOverviewExample
} from './dialog-overview/dialog-overview-example';
import {RadioNgModelExample} from './radio-ngmodel/radio-ngmodel-example';
import {CardFancyExample} from './card-fancy/card-fancy-example';
import {ToolbarOverviewExample} from './toolbar-overview/toolbar-overview-example';
import {ToolbarMultirowExample} from './toolbar-multirow/toolbar-multirow-example';
import {MenuIconsExample} from './menu-icons/menu-icons-example';
import {GridListDynamicExample} from './grid-list-dynamic/grid-list-dynamic-example';
import {IconOverviewExample} from './icon-overview/icon-overview-example';
import {ProgressBarOverviewExample} from './progress-bar-overview/progress-bar-overview-example';
import {SlideToggleOverviewExample} from './slide-toggle-overview/slide-toggle-overview-example';
import {InputOverviewExample} from './input-overview/input-overview-example';
import {MenuOverviewExample} from './menu-overview/menu-overview-example';
import {CheckboxConfigurableExample} from './checkbox-configurable/checkbox-configurable-example';
import {
  ButtonToggleExclusiveExample
} from './button-toggle-exclusive/button-toggle-exclusive-example';
import {ListSectionsExample} from './list-sections/list-sections-example';
import {SnackBarOverviewExample} from './snack-bar-overview/snack-bar-overview-example';
import {
  DialogResultExampleDialog,
  DialogResultExample
} from './dialog-result/dialog-result-example';
import {TooltipOverviewExample} from './tooltip-overview/tooltip-overview-example';
import {ButtonToggleOverviewExample} from './button-toggle-overview/button-toggle-overview-example';
import {GridListOverviewExample} from './grid-list-overview/grid-list-overview-example';
import {TooltipPositionExample} from './tooltip-position/tooltip-position-example';
import {
  ProgressSpinnerConfigurableExample
} from './progress-circle-configurable/progress-circle-configurable-example';
import {InputFormExample} from './input-form/input-form-example';
import {ListOverviewExample} from './list-overview/list-overview-example';
import {SliderOverviewExample} from './slider-overview/slider-overview-example';
import {
  SlideToggleConfigurableExample
} from './slide-toggle-configurable/slide-toggle-configurable-example';
import {IconSvgExample} from './icon-svg-example/icon-svg-example';
import {SidenavFabExample} from './sidenav-fab/sidenav-fab-example';
import {CardOverviewExample} from './card-overview/card-overview-example';
import {
  ProgressSpinnerOverviewExample
} from './progress-circle-overview/progress-circle-overview-example';
import {TabsTemplateLabelExample} from './tabs-template-label/tabs-template-label-example';
import {RadioOverviewExample} from './radio-overview/radio-overview-example';
import {SidenavOverviewExample} from './sidenav-overview/sidenav-overview-example';


/**
 * The list of example components.
 * Key is the example name which will be used in `material-docs-example="key"`.
 * Value is the component.
 */

export const EXAMPLE_COMPONENTS = {
  'button-overview': ButtonOverviewExample,
  'button-types': ButtonTypesExample,
  'button-toggle-exclusive': ButtonToggleExclusiveExample,
  'button-toggle-overview': ButtonToggleOverviewExample,
  'card-fancy': CardFancyExample,
  'card-overview': CardOverviewExample,
  'checkbox-configurable': CheckboxConfigurableExample,
  'checkbox-overview': CheckboxOverviewExample,
  'dialog-overview': DialogOverviewExample,
  'dialog-result': DialogResultExample,
  'grid-list-dynamic': GridListDynamicExample,
  'grid-list-overview': GridListOverviewExample,
  'icon-overview': IconOverviewExample,
  'icon-svg': IconSvgExample,
  'input-form': InputFormExample,
  'input-overview': InputOverviewExample,
  'list-overview': ListOverviewExample,
  'list-sections': ListSectionsExample,
  'menu-icons': MenuIconsExample,
  'menu-overview': MenuOverviewExample,
  'progress-bar-configurable': ProgressBarConfigurableExample,
  'progress-bar-overview': ProgressBarOverviewExample,
  'progress-spinner-configurable': ProgressSpinnerConfigurableExample,
  'progress-spinner-overview': ProgressSpinnerOverviewExample,
  'radio-ngmodel': RadioNgModelExample,
  'radio-overview': RadioOverviewExample,
  'sidenav-fab': SidenavFabExample,
  'sidenav-overview': SidenavOverviewExample,
  'slider-configurable': SliderConfigurableExample,
  'slider-overview': SliderOverviewExample,
  'slide-toggle-configurable': SlideToggleConfigurableExample,
  'slide-toggle-overview': SlideToggleOverviewExample,
  'snack-bar-component': SnackBarComponentExample,
  'snack-bar-overview': SnackBarOverviewExample,
  'tabs-overview': TabsOverviewExample,
  'tabs-template-label': TabsTemplateLabelExample,
  'toolbar-multirow': ToolbarMultirowExample,
  'toolbar-overview': ToolbarOverviewExample,
  'tooltip-overview': TooltipOverviewExample,
  'tooltip-position': TooltipPositionExample,
};

/**
 * The list of all example components.
 * We need to put them in both `declarations` and `entryComponents` to make them work.
 */
export const EXAMPLE_LIST = [
  ButtonOverviewExample,
  ButtonToggleExclusiveExample,
  ButtonToggleOverviewExample,
  ButtonTypesExample,
  CardFancyExample,
  CardOverviewExample,
  CheckboxConfigurableExample,
  CheckboxOverviewExample,
  DialogOverviewExample,
  DialogOverviewExampleDialog,
  DialogResultExample,
  DialogResultExampleDialog,
  GridListDynamicExample,
  GridListOverviewExample,
  IconOverviewExample,
  IconSvgExample,
  InputFormExample,
  InputOverviewExample,
  ListOverviewExample,
  ListSectionsExample,
  MenuIconsExample,
  MenuOverviewExample,
  ProgressBarConfigurableExample,
  ProgressBarOverviewExample,
  ProgressSpinnerConfigurableExample,
  ProgressSpinnerOverviewExample,
  RadioNgModelExample,
  RadioOverviewExample,
  SidenavFabExample,
  SidenavOverviewExample,
  SliderConfigurableExample,
  SliderOverviewExample,
  SlideToggleConfigurableExample,
  SlideToggleOverviewExample,
  SnackBarComponentExample,
  SnackBarComponentExampleSnack,
  SnackBarOverviewExample,
  TabsOverviewExample,
  TabsTemplateLabelExample,
  ToolbarMultirowExample,
  ToolbarOverviewExample,
  TooltipOverviewExample,
  TooltipPositionExample,
];

@NgModule({
  declarations: EXAMPLE_LIST,
  entryComponents: EXAMPLE_LIST,
  imports: [
    MaterialModule,
    FormsModule,
    CommonModule,
  ]
})
export class ExampleModule { }
