///<reference path="progress-bar/progress-bar-demo.ts"/>
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {NgModule, ApplicationRef} from '@angular/core';
import {HAMMER_GESTURE_CONFIG, BrowserModule} from '@angular/platform-browser';
import {HttpModule} from '@angular/http';
import {FormsModule} from '@angular/forms';
import {MdLiveAnnouncer} from '@angular2-material/core/a11y/live-announcer';
import {MdGestureConfig} from '@angular2-material/core/gestures/MdGestureConfig';
import {MdIconRegistry} from '@angular2-material/icon/icon-registry';
import {OverlayContainer} from '@angular2-material/core/overlay/overlay-container';
import {DemoApp, Home} from './demo-app/demo-app';
import {DEMO_APP_ROUTE_PROVIDER} from './demo-app/routes';
import {RouterModule} from '@angular/router';

// component modules
import {MdButtonToggleModule} from '@angular2-material/button-toggle/button-toggle';
import {MdButtonModule} from '@angular2-material/button/button';
import {MdCheckboxModule} from '@angular2-material/checkbox/checkbox';
import {MdRadioModule} from '@angular2-material/radio/radio';
import {MdSlideToggleModule} from '@angular2-material/slide-toggle/slide-toggle';
import {MdSliderModule} from '@angular2-material/slider/slider';
import {MdSidenavModule} from '@angular2-material/sidenav/sidenav';
import {MdListModule} from '@angular2-material/list/list';
import {MdGridListModule} from '@angular2-material/grid-list/grid-list';
import {MdCardModule} from '@angular2-material/card/card';
import {MdIconModule} from '@angular2-material/icon/icon';
import {MdProgressCircleModule} from '@angular2-material/progress-circle/progress-circle';
import {MdProgressBarModule} from '@angular2-material/progress-bar/progress-bar';
import {MdInputModule} from '@angular2-material/input/input';
import {MdTabsModule} from '@angular2-material/tabs/tabs';
import {MdToolbarModule} from '@angular2-material/toolbar/toolbar';
import {MdTooltipModule} from '@angular2-material/tooltip/tooltip';
import {MdRippleModule} from '@angular2-material/core/ripple/ripple';
import {PortalModule} from '@angular2-material/core/portal/portal-directives';
import {OverlayModule} from '@angular2-material/core/overlay/overlay-directives';
import {MdMenuModule} from '@angular2-material/menu/menu';
import {MdDialogModule} from '@angular2-material/dialog/dialog';
import {RtlModule} from '@angular2-material/core/rtl/dir';




// demo components
import {ProgressBarDemo} from './progress-bar/progress-bar-demo';
import {JazzDialog, DialogDemo} from './dialog/dialog-demo';
import {RippleDemo} from './ripple/ripple-demo';
import {IconDemo} from './icon/icon-demo';
import {GesturesDemo} from './gestures/gestures-demo';
import {InputDemo} from './input/input-demo';
import {CardDemo} from './card/card-demo';
import {RadioDemo} from './radio/radio-demo';
import {ButtonToggleDemo} from './button-toggle/button-toggle-demo';
import {ProgressCircleDemo} from './progress-circle/progress-circle-demo';
import {TooltipDemo} from './tooltip/tooltip-demo';
import {ListDemo} from './list/list-demo';
import {BaselineDemo} from './baseline/baseline-demo';
import {GridListDemo} from './grid-list/grid-list-demo';
import {LiveAnnouncerDemo} from './live-announcer/live-announcer-demo';
import {OverlayDemo, SpagettiPanel, RotiniPanel} from './overlay/overlay-demo';
import {SlideToggleDemo} from './slide-toggle/slide-toggle-demo';
import {ToolbarDemo} from './toolbar/toolbar-demo';
import {ButtonDemo} from './button/button-demo';
import {MdCheckboxDemoNestedChecklist, CheckboxDemo} from './checkbox/checkbox-demo';
import {SliderDemo} from './slider/slider-demo';
import {SidenavDemo} from './sidenav/sidenav-demo';
import {PortalDemo, ScienceJoke} from './portal/portal-demo';
import {MenuDemo} from './menu/menu-demo';
import {TabsDemo} from './tabs/tab-group-demo';



const MATERIAL_COMPONENTS = [
  PortalModule,
  OverlayModule,
  RtlModule,
  MdButtonModule,
  MdButtonToggleModule,
  MdCheckboxModule,
  MdRadioModule,
  MdSlideToggleModule,
  MdSliderModule,
  MdSidenavModule,
  MdListModule,
  MdGridListModule,
  MdCardModule,
  MdIconModule,
  MdProgressCircleModule,
  MdProgressBarModule,
  MdInputModule,
  MdTabsModule,
  MdToolbarModule,
  MdTooltipModule,
  MdRippleModule,
  MdMenuModule,
  MdDialogModule,
];

@NgModule(({
  imports: MATERIAL_COMPONENTS,
  exports: MATERIAL_COMPONENTS,
}))
export class MaterialModule { }

@NgModule({
  imports: [BrowserModule, RouterModule, FormsModule, HttpModule, MaterialModule],
  providers: [
    DEMO_APP_ROUTE_PROVIDER,
    MdLiveAnnouncer,
    {provide: HAMMER_GESTURE_CONFIG, useClass: MdGestureConfig},
    MdIconRegistry,
    OverlayContainer,
  ],
  declarations: [
    DemoApp,
    ListDemo,
    TooltipDemo,
    ProgressCircleDemo,
    ButtonToggleDemo,
    RadioDemo,
    CardDemo,
    InputDemo,
    GesturesDemo,
    IconDemo,
    RippleDemo,
    DialogDemo,
    JazzDialog,
    Home,
    ProgressBarDemo,
    BaselineDemo,
    GridListDemo,
    LiveAnnouncerDemo,
    OverlayDemo,
    SlideToggleDemo,
    ToolbarDemo,
    ButtonDemo,
    MdCheckboxDemoNestedChecklist,
    CheckboxDemo,
    SliderDemo,
    SidenavDemo,
    PortalDemo,
    ScienceJoke,
    MenuDemo,
    TabsDemo,
    SpagettiPanel,
    RotiniPanel,
  ],
  entryComponents: [DemoApp, SpagettiPanel, RotiniPanel, JazzDialog, ScienceJoke],
})
export class DemoAppModule {
  constructor(appRef: ApplicationRef) {
    appRef.bootstrap(DemoApp);
  }
}


platformBrowserDynamic().bootstrapModule(DemoAppModule);

// bootstrap(DemoApp, [
//   DEMO_APP_ROUTE_PROVIDER,
//   disableDeprecatedForms(),
//   provideForms(),
//   MdLiveAnnouncer,
//   HTTP_PROVIDERS,
//   OverlayContainer,
//   MdIconRegistry,
//   {provide: HAMMER_GESTURE_CONFIG, useClass: MdGestureConfig},
// ]);
