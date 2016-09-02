import {NgModule, ModuleWithProviders} from '@angular/core';
import {Md2AccordionModule} from 'md2/accordion/accordion';
import {Md2AutocompleteModule} from 'md2/autocomplete/autocomplete';
import {Md2CollapseModule} from 'md2/collapse/collapse';
import {Md2ColorpickerModule} from 'md2/colorpicker/colorpicker';
import {Md2DatepickerModule} from 'md2/datepicker/datepicker';
import {Md2DialogModule} from 'md2/md-dialog/dialog';
import {Md2MenuModule} from 'md2/md-menu/menu';
import {Md2MultiselectModule} from 'md2/multiselect/multiselect';
import {Md2SelectModule} from 'md2/select/select';
import {Md2TabsModule} from 'md2/md-tabs/tabs';
import {Md2TagsModule} from 'md2/tags/tags';
import {Md2ToastModule} from 'md2/toast/toast';
import {Md2TooltipModule} from 'md2/md-tooltip/tooltip';

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
