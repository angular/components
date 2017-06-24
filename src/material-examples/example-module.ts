
  import {NgModule} from '@angular/core';
  import {FormsModule, ReactiveFormsModule} from '@angular/forms';
  import {CommonModule} from '@angular/common';
  import {
    MdAutocompleteModule, MdButtonModule, MdButtonToggleModule, MdPaginatorModule,
    MdCardModule, MdCheckboxModule, MdChipsModule, MdDatepickerModule,
    MdDialogModule, MdGridListModule, MdIconModule, MdInputModule,
    MdListModule, MdMenuModule, MdProgressBarModule, MdProgressSpinnerModule,
    MdRadioModule, MdSelectModule, MdSidenavModule, MdSliderModule,
    MdSlideToggleModule, MdSnackBarModule, MdTabsModule, MdToolbarModule, MdTooltipModule
  } from '@angular/material';

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
        additionalFiles: undefined,
        selectorName: undefined
    },
    'button-overview': {
        title: 'Basic buttons',
        component: ButtonOverviewExample,
        additionalFiles: undefined,
        selectorName: undefined
    },
    'button-toggle-exclusive': {
        title: 'Exclusive selection',
        component: ButtonToggleExclusiveExample,
        additionalFiles: undefined,
        selectorName: undefined
    },
    'button-toggle-overview': {
        title: 'Basic button-toggles',
        component: ButtonToggleOverviewExample,
        additionalFiles: undefined,
        selectorName: undefined
    },
    'button-types': {
        title: 'Button varieties',
        component: ButtonTypesExample,
        additionalFiles: undefined,
        selectorName: undefined
    },
    'card-fancy': {
        title: 'Card with multiple sections',
        component: CardFancyExample,
        additionalFiles: undefined,
        selectorName: undefined
    },
    'card-overview': {
        title: 'Basic cards',
        component: CardOverviewExample,
        additionalFiles: undefined,
        selectorName: undefined
    },
    'checkbox-configurable': {
        title: 'Configurable checkbox',
        component: CheckboxConfigurableExample,
        additionalFiles: undefined,
        selectorName: undefined
    },
    'checkbox-overview': {
        title: 'Basic checkboxes',
        component: CheckboxOverviewExample,
        additionalFiles: undefined,
        selectorName: undefined
    },
    'chips-overview': {
        title: 'Basic chips',
        component: ChipsOverviewExample,
        additionalFiles: undefined,
        selectorName: undefined
    },
    'chips-stacked': {
        title: 'Stacked chips',
        component: ChipsStackedExample,
        additionalFiles: undefined,
        selectorName: undefined
    },
    'datepicker-overview': {
        title: 'Basic datepicker',
        component: DatepickerOverviewExample,
        additionalFiles: undefined,
        selectorName: undefined
    },
    'dialog-elements': {
        title: 'Dialog elements',
        component: DialogElementsExample,
        additionalFiles: ['dialog-elements-example-dialog.html'],
        selectorName: 'DialogElementsExample, DialogElementsExampleDialog'
    },
    'dialog-overview': {
        title: 'Dialog Overview',
        component: DialogOverviewExample,
        additionalFiles: ['dialog-overview-example-dialog.html'],
        selectorName: 'DialogOverviewExample, DialogOverviewExampleDialog'
    },
    'dialog-result': {
        title: 'Dialog with a result',
        component: DialogResultExample,
        additionalFiles: ['dialog-result-example-dialog.html'],
        selectorName: 'DialogResultExample, DialogResultExampleDialog'
    },
    'grid-list-dynamic': {
        title: 'Dynamic grid-list',
        component: GridListDynamicExample,
        additionalFiles: undefined,
        selectorName: undefined
    },
    'grid-list-overview': {
        title: 'Basic grid-list',
        component: GridListOverviewExample,
        additionalFiles: undefined,
        selectorName: undefined
    },
    'icon-overview': {
        title: 'Basic icons',
        component: IconOverviewExample,
        additionalFiles: undefined,
        selectorName: undefined
    },
    'icon-svg': {
        title: 'SVG icons',
        component: IconSvgExample,
        additionalFiles: undefined,
        selectorName: undefined
    },
    'input-errors': {
        title: 'Input Errors',
        component: InputErrorsExample,
        additionalFiles: undefined,
        selectorName: undefined
    },
    'input-form': {
        title: 'Inputs in a form',
        component: InputFormExample,
        additionalFiles: undefined,
        selectorName: undefined
    },
    'input-hint': {
        title: 'Input hints',
        component: InputHintExample,
        additionalFiles: undefined,
        selectorName: undefined
    },
    'input-overview': {
        title: 'Basic Inputs',
        component: InputOverviewExample,
        additionalFiles: undefined,
        selectorName: undefined
    },
    'input-prefix-suffix': {
        title: 'Input Prefixes and Suffixes',
        component: InputPrefixSuffixExample,
        additionalFiles: undefined,
        selectorName: undefined
    },
    'list-overview': {
        title: 'Basic list',
        component: ListOverviewExample,
        additionalFiles: undefined,
        selectorName: undefined
    },
    'list-sections': {
        title: 'List with sections',
        component: ListSectionsExample,
        additionalFiles: undefined,
        selectorName: undefined
    },
    'menu-icons': {
        title: 'Menu with icons',
        component: MenuIconsExample,
        additionalFiles: undefined,
        selectorName: undefined
    },
    'menu-overview': {
        title: 'Basic menu',
        component: MenuOverviewExample,
        additionalFiles: undefined,
        selectorName: undefined
    },
    'paginator-configurable': {
        title: 'Configurable paginator',
        component: PaginatorConfigurableExample,
        additionalFiles: undefined,
        selectorName: undefined
    },
    'paginator-overview': {
        title: 'Paginator',
        component: PaginatorOverviewExample,
        additionalFiles: undefined,
        selectorName: undefined
    },
    'progress-bar-configurable': {
        title: 'Configurable progress-bar',
        component: ProgressBarConfigurableExample,
        additionalFiles: undefined,
        selectorName: undefined
    },
    'progress-bar-overview': {
        title: 'Basic progress-bar',
        component: ProgressBarOverviewExample,
        additionalFiles: undefined,
        selectorName: undefined
    },
    'progress-spinner-configurable': {
        title: 'Configurable progress spinner',
        component: ProgressSpinnerConfigurableExample,
        additionalFiles: undefined,
        selectorName: undefined
    },
    'progress-spinner-overview': {
        title: 'Basic progress-spinner',
        component: ProgressSpinnerOverviewExample,
        additionalFiles: undefined,
        selectorName: undefined
    },
    'radio-ng-model': {
        title: 'Radios with ngModel',
        component: RadioNgModelExample,
        additionalFiles: undefined,
        selectorName: undefined
    },
    'radio-overview': {
        title: 'Basic radios',
        component: RadioOverviewExample,
        additionalFiles: undefined,
        selectorName: undefined
    },
    'select-form': {
        title: 'Select in a form',
        component: SelectFormExample,
        additionalFiles: undefined,
        selectorName: undefined
    },
    'select-overview': {
        title: 'Basic select',
        component: SelectOverviewExample,
        additionalFiles: undefined,
        selectorName: undefined
    },
    'sidenav-fab': {
        title: 'Sidenav with a FAB',
        component: SidenavFabExample,
        additionalFiles: undefined,
        selectorName: undefined
    },
    'sidenav-overview': {
        title: 'Basic sidenav',
        component: SidenavOverviewExample,
        additionalFiles: undefined,
        selectorName: undefined
    },
    'slide-toggle-configurable': {
        title: 'Configurable slide-toggle',
        component: SlideToggleConfigurableExample,
        additionalFiles: undefined,
        selectorName: undefined
    },
    'slide-toggle-forms': {
        title: 'Slide-toggle with forms',
        component: SlideToggleFormsExample,
        additionalFiles: undefined,
        selectorName: undefined
    },
    'slide-toggle-overview': {
        title: 'Basic slide-toggles',
        component: SlideToggleOverviewExample,
        additionalFiles: undefined,
        selectorName: undefined
    },
    'slider-configurable': {
        title: 'Configurable slider',
        component: SliderConfigurableExample,
        additionalFiles: undefined,
        selectorName: undefined
    },
    'slider-overview': {
        title: 'Basic slider',
        component: SliderOverviewExample,
        additionalFiles: undefined,
        selectorName: undefined
    },
    'snack-bar-component': {
        title: 'Snack-bar with a custom component',
        component: SnackBarComponentExample,
        additionalFiles: undefined,
        selectorName: undefined
    },
    'snack-bar-overview': {
        title: 'Basic snack-bar',
        component: SnackBarOverviewExample,
        additionalFiles: undefined,
        selectorName: undefined
    },
    'tabs-overview': {
        title: 'Basic tabs',
        component: TabsOverviewExample,
        additionalFiles: undefined,
        selectorName: undefined
    },
    'tabs-template-label': {
        title: 'Coming soon!',
        component: TabsTemplateLabelExample,
        additionalFiles: undefined,
        selectorName: undefined
    },
    'toolbar-multirow': {
        title: 'Multi-row toolbar',
        component: ToolbarMultirowExample,
        additionalFiles: undefined,
        selectorName: undefined
    },
    'toolbar-overview': {
        title: 'Basic toolbar',
        component: ToolbarOverviewExample,
        additionalFiles: undefined,
        selectorName: undefined
    },
    'tooltip-overview': {
        title: 'Basic tooltip',
        component: TooltipOverviewExample,
        additionalFiles: undefined,
        selectorName: undefined
    },
    'tooltip-position': {
        title: 'Tooltip with custom position',
        component: TooltipPositionExample,
        additionalFiles: undefined,
        selectorName: undefined
    },
  };

  @NgModule({
    exports: [
      MdAutocompleteModule,
      MdButtonModule,
      MdButtonToggleModule,
      MdCardModule,
      MdCheckboxModule,
      MdChipsModule,
      MdDatepickerModule,
      MdDialogModule,
      MdGridListModule,
      MdIconModule,
      MdInputModule,
      MdListModule,
      MdMenuModule,
      MdProgressBarModule,
      MdProgressSpinnerModule,
      MdRadioModule,
      MdSelectModule,
      MdSlideToggleModule,
      MdSliderModule,
      MdSidenavModule,
      MdSnackBarModule,
      MdTabsModule,
      MdToolbarModule,
      MdTooltipModule,
      MdPaginatorModule
    ]
  })
  export class ExampleMaterialModule {}

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
      CommonModule,
    ]
  })
  export class ExampleModule { }
