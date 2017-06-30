
/* tslint:disable */
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {ExampleMaterialModule} from './material-module';

export interface LiveExample {
  title: string;
  component: any;
  additionalFiles?: string[];
  selectorName?: string;
}

import {AutocompleteOverviewExample} from './autocomplete-overview/autocomplete-overview-example';
import {ButtonOverviewExample} from './button-overview/button-overview-example';
import {ButtonToggleExclusiveExample} from './button-toggle-exclusive/button-toggle-exclusive-example';
import {ButtonToggleOverviewExample} from './button-toggle-overview/button-toggle-overview-example';
import {ButtonTypesExample} from './button-types/button-types-example';
import {CardFancyExample} from './card-fancy/card-fancy-example';
import {CardOverviewExample} from './card-overview/card-overview-example';
import {CheckboxConfigurableExample} from './checkbox-configurable/checkbox-configurable-example';
import {CheckboxOverviewExample} from './checkbox-overview/checkbox-overview-example';
import {ChipsOverviewExample} from './chips-overview/chips-overview-example';
import {ChipsStackedExample} from './chips-stacked/chips-stacked-example';
import {DatepickerOverviewExample} from './datepicker-overview/datepicker-overview-example';
import {DialogElementsExample,DialogElementsExampleDialog} from './dialog-elements/dialog-elements-example';
import {DialogOverviewExample,DialogOverviewExampleDialog} from './dialog-overview/dialog-overview-example';
import {DialogResultExample,DialogResultExampleDialog} from './dialog-result/dialog-result-example';
import {GridListDynamicExample} from './grid-list-dynamic/grid-list-dynamic-example';
import {GridListOverviewExample} from './grid-list-overview/grid-list-overview-example';
import {IconOverviewExample} from './icon-overview/icon-overview-example';
import {IconSvgExample} from './icon-svg-example/icon-svg-example';
import {InputErrorsExample} from './input-errors/input-errors-example';
import {InputFormExample} from './input-form/input-form-example';
import {InputHintExample} from './input-hint/input-hint-example';
import {InputOverviewExample} from './input-overview/input-overview-example';
import {InputPrefixSuffixExample} from './input-prefix-suffix/input-prefix-suffix-example';
import {ListOverviewExample} from './list-overview/list-overview-example';
import {ListSectionsExample} from './list-sections/list-sections-example';
import {MenuIconsExample} from './menu-icons/menu-icons-example';
import {MenuOverviewExample} from './menu-overview/menu-overview-example';
import {PaginatorConfigurableExample} from './paginator-configurable/paginator-configurable-example';
import {PaginatorOverviewExample} from './paginator-overview/paginator-overview-example';
import {ProgressBarConfigurableExample} from './progress-bar-configurable/progress-bar-configurable-example';
import {ProgressBarOverviewExample} from './progress-bar-overview/progress-bar-overview-example';
import {ProgressSpinnerConfigurableExample} from './progress-spinner-configurable/progress-spinner-configurable-example';
import {ProgressSpinnerOverviewExample} from './progress-spinner-overview/progress-spinner-overview-example';
import {RadioNgModelExample} from './radio-ng-model/radio-ng-model-example';
import {RadioOverviewExample} from './radio-overview/radio-overview-example';
import {SelectFormExample} from './select-form/select-form-example';
import {SelectOverviewExample} from './select-overview/select-overview-example';
import {SidenavFabExample} from './sidenav-fab/sidenav-fab-example';
import {SidenavOverviewExample} from './sidenav-overview/sidenav-overview-example';
import {SlideToggleConfigurableExample} from './slide-toggle-configurable/slide-toggle-configurable-example';
import {SlideToggleFormsExample} from './slide-toggle-forms/slide-toggle-forms-example';
import {SlideToggleOverviewExample} from './slide-toggle-overview/slide-toggle-overview-example';
import {SliderConfigurableExample} from './slider-configurable/slider-configurable-example';
import {SliderOverviewExample} from './slider-overview/slider-overview-example';
import {SnackBarComponentExample,PizzaPartyComponent} from './snack-bar-component/snack-bar-component-example';
import {SnackBarOverviewExample} from './snack-bar-overview/snack-bar-overview-example';
import {TabsOverviewExample} from './tabs-overview/tabs-overview-example';
import {TabsTemplateLabelExample} from './tabs-template-label/tabs-template-label-example';
import {ToolbarMultirowExample} from './toolbar-multirow/toolbar-multirow-example';
import {ToolbarOverviewExample} from './toolbar-overview/toolbar-overview-example';
import {TooltipOverviewExample} from './tooltip-overview/tooltip-overview-example';
import {TooltipPositionExample} from './tooltip-position/tooltip-position-example';

export const EXAMPLE_COMPONENTS = {
  'autocomplete-overview': {
    title: 'Basic autocomplete',
    component: AutocompleteOverviewExample,
    additionalFiles: [],
    selectorName: ''
  },
  'button-overview': {
    title: 'Basic buttons',
    component: ButtonOverviewExample,
    additionalFiles: [],
    selectorName: ''
  },
  'button-toggle-exclusive': {
    title: 'Exclusive selection',
    component: ButtonToggleExclusiveExample,
    additionalFiles: [],
    selectorName: ''
  },
  'button-toggle-overview': {
    title: 'Basic button-toggles',
    component: ButtonToggleOverviewExample,
    additionalFiles: [],
    selectorName: ''
  },
  'button-types': {
    title: 'Button varieties',
    component: ButtonTypesExample,
    additionalFiles: [],
    selectorName: ''
  },
  'card-fancy': {
    title: 'Card with multiple sections',
    component: CardFancyExample,
    additionalFiles: [],
    selectorName: ''
  },
  'card-overview': {
    title: 'Basic cards',
    component: CardOverviewExample,
    additionalFiles: [],
    selectorName: ''
  },
  'checkbox-configurable': {
    title: 'Configurable checkbox',
    component: CheckboxConfigurableExample,
    additionalFiles: [],
    selectorName: ''
  },
  'checkbox-overview': {
    title: 'Basic checkboxes',
    component: CheckboxOverviewExample,
    additionalFiles: [],
    selectorName: ''
  },
  'chips-overview': {
    title: 'Basic chips',
    component: ChipsOverviewExample,
    additionalFiles: [],
    selectorName: ''
  },
  'chips-stacked': {
    title: 'Stacked chips',
    component: ChipsStackedExample,
    additionalFiles: [],
    selectorName: ''
  },
  'datepicker-overview': {
    title: 'Basic datepicker',
    component: DatepickerOverviewExample,
    additionalFiles: [],
    selectorName: ''
  },
  'dialog-elements': {
    title: 'Dialog elements',
    component: DialogElementsExample,
    additionalFiles: ["dialog-elements-example-dialog.html"],
    selectorName: 'DialogElementsExample, DialogElementsExampleDialog'
  },
  'dialog-overview': {
    title: 'Dialog Overview',
    component: DialogOverviewExample,
    additionalFiles: ["dialog-overview-example-dialog.html"],
    selectorName: 'DialogOverviewExample, DialogOverviewExampleDialog'
  },
  'dialog-result': {
    title: 'Dialog with a result',
    component: DialogResultExample,
    additionalFiles: ["dialog-result-example-dialog.html"],
    selectorName: 'DialogResultExample, DialogResultExampleDialog'
  },
  'grid-list-dynamic': {
    title: 'Dynamic grid-list',
    component: GridListDynamicExample,
    additionalFiles: [],
    selectorName: ''
  },
  'grid-list-overview': {
    title: 'Basic grid-list',
    component: GridListOverviewExample,
    additionalFiles: [],
    selectorName: ''
  },
  'icon-overview': {
    title: 'Basic icons',
    component: IconOverviewExample,
    additionalFiles: [],
    selectorName: ''
  },
  'icon-svg': {
    title: 'SVG icons',
    component: IconSvgExample,
    additionalFiles: [],
    selectorName: ''
  },
  'input-errors': {
    title: 'Input Errors',
    component: InputErrorsExample,
    additionalFiles: [],
    selectorName: ''
  },
  'input-form': {
    title: 'Inputs in a form',
    component: InputFormExample,
    additionalFiles: [],
    selectorName: ''
  },
  'input-hint': {
    title: 'Input hints',
    component: InputHintExample,
    additionalFiles: [],
    selectorName: ''
  },
  'input-overview': {
    title: 'Basic Inputs',
    component: InputOverviewExample,
    additionalFiles: [],
    selectorName: ''
  },
  'input-prefix-suffix': {
    title: 'Input Prefixes and Suffixes',
    component: InputPrefixSuffixExample,
    additionalFiles: [],
    selectorName: ''
  },
  'list-overview': {
    title: 'Basic list',
    component: ListOverviewExample,
    additionalFiles: [],
    selectorName: ''
  },
  'list-sections': {
    title: 'List with sections',
    component: ListSectionsExample,
    additionalFiles: [],
    selectorName: ''
  },
  'menu-icons': {
    title: 'Menu with icons',
    component: MenuIconsExample,
    additionalFiles: [],
    selectorName: ''
  },
  'menu-overview': {
    title: 'Basic menu',
    component: MenuOverviewExample,
    additionalFiles: [],
    selectorName: ''
  },
  'paginator-configurable': {
    title: 'Configurable paginator',
    component: PaginatorConfigurableExample,
    additionalFiles: [],
    selectorName: ''
  },
  'paginator-overview': {
    title: 'Paginator',
    component: PaginatorOverviewExample,
    additionalFiles: [],
    selectorName: ''
  },
  'progress-bar-configurable': {
    title: 'Configurable progress-bar',
    component: ProgressBarConfigurableExample,
    additionalFiles: [],
    selectorName: ''
  },
  'progress-bar-overview': {
    title: 'Basic progress-bar',
    component: ProgressBarOverviewExample,
    additionalFiles: [],
    selectorName: ''
  },
  'progress-spinner-configurable': {
    title: 'Configurable progress spinner',
    component: ProgressSpinnerConfigurableExample,
    additionalFiles: [],
    selectorName: ''
  },
  'progress-spinner-overview': {
    title: 'Basic progress-spinner',
    component: ProgressSpinnerOverviewExample,
    additionalFiles: [],
    selectorName: ''
  },
  'radio-ng-model': {
    title: 'Radios with ngModel',
    component: RadioNgModelExample,
    additionalFiles: [],
    selectorName: ''
  },
  'radio-overview': {
    title: 'Basic radios',
    component: RadioOverviewExample,
    additionalFiles: [],
    selectorName: ''
  },
  'select-form': {
    title: 'Select in a form',
    component: SelectFormExample,
    additionalFiles: [],
    selectorName: ''
  },
  'select-overview': {
    title: 'Basic select',
    component: SelectOverviewExample,
    additionalFiles: [],
    selectorName: ''
  },
  'sidenav-fab': {
    title: 'Sidenav with a FAB',
    component: SidenavFabExample,
    additionalFiles: [],
    selectorName: ''
  },
  'sidenav-overview': {
    title: 'Basic sidenav',
    component: SidenavOverviewExample,
    additionalFiles: [],
    selectorName: ''
  },
  'slide-toggle-configurable': {
    title: 'Configurable slide-toggle',
    component: SlideToggleConfigurableExample,
    additionalFiles: [],
    selectorName: ''
  },
  'slide-toggle-forms': {
    title: 'Slide-toggle with forms',
    component: SlideToggleFormsExample,
    additionalFiles: [],
    selectorName: ''
  },
  'slide-toggle-overview': {
    title: 'Basic slide-toggles',
    component: SlideToggleOverviewExample,
    additionalFiles: [],
    selectorName: ''
  },
  'slider-configurable': {
    title: 'Configurable slider',
    component: SliderConfigurableExample,
    additionalFiles: [],
    selectorName: ''
  },
  'slider-overview': {
    title: 'Basic slider',
    component: SliderOverviewExample,
    additionalFiles: [],
    selectorName: ''
  },
  'snack-bar-component': {
    title: 'Snack-bar with a custom component',
    component: SnackBarComponentExample,
    additionalFiles: ["snack-bar-component-example-snack.html"],
    selectorName: 'SnackBarComponentExample, PizzaPartyComponent'
  },
  'snack-bar-overview': {
    title: 'Basic snack-bar',
    component: SnackBarOverviewExample,
    additionalFiles: [],
    selectorName: ''
  },
  'tabs-overview': {
    title: 'Basic tabs',
    component: TabsOverviewExample,
    additionalFiles: [],
    selectorName: ''
  },
  'tabs-template-label': {
    title: 'Coming soon!',
    component: TabsTemplateLabelExample,
    additionalFiles: [],
    selectorName: ''
  },
  'toolbar-multirow': {
    title: 'Multi-row toolbar',
    component: ToolbarMultirowExample,
    additionalFiles: [],
    selectorName: ''
  },
  'toolbar-overview': {
    title: 'Basic toolbar',
    component: ToolbarOverviewExample,
    additionalFiles: [],
    selectorName: ''
  },
  'tooltip-overview': {
    title: 'Basic tooltip',
    component: TooltipOverviewExample,
    additionalFiles: [],
    selectorName: ''
  },
  'tooltip-position': {
    title: 'Tooltip with custom position',
    component: TooltipPositionExample,
    additionalFiles: [],
    selectorName: ''
  },
};

export const EXAMPLE_LIST = [
  AutocompleteOverviewExample,
  ButtonOverviewExample,
  ButtonToggleExclusiveExample,
  ButtonToggleOverviewExample,
  ButtonTypesExample,
  CardFancyExample,
  CardOverviewExample,
  CheckboxConfigurableExample,
  CheckboxOverviewExample,
  ChipsOverviewExample,
  ChipsStackedExample,
  DatepickerOverviewExample,
  DialogElementsExample,DialogElementsExampleDialog,
  DialogOverviewExample,DialogOverviewExampleDialog,
  DialogResultExample,DialogResultExampleDialog,
  GridListDynamicExample,
  GridListOverviewExample,
  IconOverviewExample,
  IconSvgExample,
  InputErrorsExample,
  InputFormExample,
  InputHintExample,
  InputOverviewExample,
  InputPrefixSuffixExample,
  ListOverviewExample,
  ListSectionsExample,
  MenuIconsExample,
  MenuOverviewExample,
  PaginatorConfigurableExample,
  PaginatorOverviewExample,
  ProgressBarConfigurableExample,
  ProgressBarOverviewExample,
  ProgressSpinnerConfigurableExample,
  ProgressSpinnerOverviewExample,
  RadioNgModelExample,
  RadioOverviewExample,
  SelectFormExample,
  SelectOverviewExample,
  SidenavFabExample,
  SidenavOverviewExample,
  SlideToggleConfigurableExample,
  SlideToggleFormsExample,
  SlideToggleOverviewExample,
  SliderConfigurableExample,
  SliderOverviewExample,
  SnackBarComponentExample,PizzaPartyComponent,
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
    ExampleMaterialModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule
  ]
})
export class ExampleModule { }
