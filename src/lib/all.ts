import {NgModule, ModuleWithProviders} from '@angular/core';
import {Md2AccordionModule} from './accordion/accordion';
import {Md2AutocompleteModule} from './autocomplete/autocomplete';
import {Md2CollapseModule} from './collapse/collapse';
import {Md2ColorpickerModule} from './colorpicker/colorpicker';
import {Md2DatepickerModule} from './datepicker/datepicker';
import {Md2DialogModule} from './md-dialog/dialog';
import {Md2MenuModule} from './md-menu/menu';
import {Md2MultiselectModule} from './multiselect/multiselect';
import {Md2SelectModule} from './select/select';
import {Md2TabsModule} from './md-tabs/tabs';
import {Md2TagsModule} from './tags/tags';
import {Md2ToastModule} from './toast/toast';
import {Md2TooltipModule} from './md-tooltip/tooltip';

const MATERIAL_MODULES = [
  Md2AccordionModule,
  Md2AutocompleteModule,
  Md2CollapseModule,
  Md2ColorpickerModule,
  Md2DatepickerModule,
  Md2DialogModule,
  Md2MenuModule,
  Md2MultiselectModule,
  Md2SelectModule,
  Md2TabsModule,
  Md2TagsModule,
  Md2ToastModule,
  Md2TooltipModule,
];

@NgModule({
  imports: [
    Md2AccordionModule,
    Md2AutocompleteModule,
    Md2CollapseModule,
    Md2ColorpickerModule,
    Md2DatepickerModule,
    Md2DialogModule,
    Md2MenuModule,
    Md2MultiselectModule,
    Md2SelectModule,
    Md2TabsModule,
    Md2TagsModule,
    Md2ToastModule,
    Md2TooltipModule,
  ],
  exports: MATERIAL_MODULES,
})
export class Md2RootModule { }


@NgModule({
  imports: MATERIAL_MODULES,
  exports: MATERIAL_MODULES,
})
export class Md2Module {
  static forRoot(): ModuleWithProviders {
    return { ngModule: Md2RootModule };
  }
}
