import {NgModule, ModuleWithProviders} from '@angular/core';
import {MdButtonToggleModule} from '@angular2-material/button-toggle';
import {Md2AccordionModule} from '@angular2-material/accordion/accordion';
import {Md2AutocompleteModule} from '@angular2-material/autocomplete/autocomplete';
import {Md2CollapseModule} from '@angular2-material/collapse/collapse';
import {Md2ColorpickerModule} from '@angular2-material/colorpicker/colorpicker';
import {Md2DatepickerModule} from '@angular2-material/datepicker/datepicker';
import {Md2DialogModule} from '@angular2-material/md-dialog/dialog';
import {Md2MenuModule} from '@angular2-material/md-menu/menu';
import {Md2MultiselectModule} from '@angular2-material/multiselect/multiselect';
import {Md2SelectModule} from '@angular2-material/select/select';
import {Md2TabsModule} from '@angular2-material/md-tabs/tabs';
import {Md2TagsModule} from '@angular2-material/tags/tags';
import {Md2ToastModule} from '@angular2-material/toast/toast';
import {Md2TooltipModule} from '@angular2-material/md-tooltip/tooltip';


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
  exports: MATERIAL_MODULES
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
