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
//import {MdButtonToggleModule} from 'md2/button-toggle/button-toggle';
//import {MdButtonModule} from 'md2/button/button';
//import {MdCheckboxModule} from 'md2/checkbox/checkbox';
//import {MdRadioModule} from 'md2/radio/radio';
//import {MdSlideToggleModule} from 'md2/slide-toggle/slide-toggle';
//import {MdSliderModule} from 'md2/slider/slider';
//import {MdSidenavModule} from 'md2/sidenav/sidenav';
//import {MdListModule} from 'md2/list/list';
//import {MdGridListModule} from 'md2/grid-list/grid-list';
//import {MdCardModule} from 'md2/card/card';
//import {MdIconModule} from 'md2/icon/icon';
//import {MdProgressCircleModule} from 'md2/progress-circle/progress-circle';
//import {MdProgressBarModule} from 'md2/progress-bar/progress-bar';
//import {MdInputModule} from 'md2/input/input';
//import {MdTabsModule} from 'md2/tabs/tabs';
//import {MdToolbarModule} from 'md2/toolbar/toolbar';
//import {MdTooltipModule} from 'md2/tooltip/tooltip';
//import {MdRippleModule} from 'md2/core/ripple/ripple';
//import {PortalModule} from 'md2/core/portal/portal-directives';
//import {OverlayModule} from 'md2/core/overlay/overlay-directives';
//import {MdMenuModule} from 'md2/menu/menu';
//import {MdDialogModule} from 'md2/dialog/dialog';
//import {RtlModule} from 'md2/core/rtl/dir';
//import {MdLiveAnnouncer} from 'md2/core/a11y/live-announcer';


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
  //MdButtonModule,
  //MdButtonToggleModule,
  //MdCardModule,
  //MdCheckboxModule,
  //MdDialogModule,
  //MdGridListModule,
  //MdIconModule,
  //MdInputModule,
  //MdListModule,
  //MdMenuModule,
  //MdProgressBarModule,
  //MdProgressCircleModule,
  //MdRadioModule,
  //MdRippleModule,
  //MdSidenavModule,
  //MdSliderModule,
  //MdSlideToggleModule,
  //MdTabsModule,
  //MdToolbarModule,
  //MdTooltipModule,
  //OverlayModule,
  //PortalModule,
  //RtlModule,
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
    //MdButtonModule,
    //MdCardModule,
    //MdCheckboxModule,
    //MdGridListModule,
    //MdInputModule,
    //MdListModule,
    //MdProgressBarModule,
    //MdProgressCircleModule,
    //MdRippleModule,
    //MdSidenavModule,
    //MdSliderModule,
    //MdSlideToggleModule,
    //MdTabsModule,
    //MdToolbarModule,
    //PortalModule,
    //RtlModule,

    // These modules include providers.
    //MdButtonToggleModule.forRoot(),
    //MdDialogModule.forRoot(),
    //MdIconModule.forRoot(),
    //MdMenuModule.forRoot(),
    //MdRadioModule.forRoot(),
    //MdTooltipModule.forRoot(),
    //OverlayModule.forRoot(),
  ],
  exports: MATERIAL_MODULES,
  //providers: [MdLiveAnnouncer]
})
export class MaterialRootModule { }


@NgModule({
  imports: MATERIAL_MODULES,
  exports: MATERIAL_MODULES,
})
export class MaterialModule {
  static forRoot(): ModuleWithProviders {
    return { ngModule: MaterialRootModule };
  }
}
