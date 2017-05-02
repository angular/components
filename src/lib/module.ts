import {NgModule} from '@angular/core';

import {
  MdRippleModule,
  RtlModule,
  ObserveContentModule,
  PortalModule,
  OverlayModule,
  A11yModule,
  MdCommonModule,
} from '@angular/material/core';

import {PlatformModule, StyleModule} from '@angular/material/core';
import {MdButtonToggleModule} from '@angular/material/button-toggle';
import {MdButtonModule} from '@angular/material/button';
import {MdCheckboxModule} from '@angular/material/checkbox';
import {MdRadioModule} from '@angular/material/radio';
import {MdSelectModule} from '@angular/material/select';
import {MdSlideToggleModule} from '@angular/material/slide-toggle';
import {MdSliderModule} from '@angular/material/slider';
import {MdSidenavModule} from '@angular/material/sidenav';
import {MdListModule} from '@angular/material/list';
import {MdGridListModule} from '@angular/material/grid-list';
import {MdCardModule} from '@angular/material/card';
import {MdChipsModule} from '@angular/material/chips';
import {MdIconModule} from '@angular/material/icon';
import {MdProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MdProgressBarModule} from '@angular/material/progress-bar';
import {MdInputModule} from '@angular/material/input';
import {MdSnackBarModule} from '@angular/material/snack-bar';
import {MdTabsModule} from '@angular/material/tabs';
import {MdToolbarModule} from '@angular/material/toolbar';
import {MdTooltipModule} from '@angular/material/tooltip';
import {MdMenuModule} from '@angular/material/menu';
import {MdDialogModule} from '@angular/material/dialog';
import {MdAutocompleteModule} from '@angular/material/autocomplete';

const MATERIAL_MODULES = [
  MdAutocompleteModule,
  MdButtonModule,
  MdButtonToggleModule,
  MdCardModule,
  MdChipsModule,
  MdCheckboxModule,
  MdDialogModule,
  MdGridListModule,
  MdIconModule,
  MdInputModule,
  MdListModule,
  MdMenuModule,
  MdProgressBarModule,
  MdProgressSpinnerModule,
  MdRadioModule,
  MdRippleModule,
  MdSelectModule,
  MdSidenavModule,
  MdSliderModule,
  MdSlideToggleModule,
  MdSnackBarModule,
  MdTabsModule,
  MdToolbarModule,
  MdTooltipModule,
  OverlayModule,
  PortalModule,
  RtlModule,
  StyleModule,
  A11yModule,
  PlatformModule,
  MdCommonModule,
  ObserveContentModule
];

/** @deprecated */
@NgModule({
  imports: MATERIAL_MODULES,
  exports: MATERIAL_MODULES,
})
export class MaterialModule {}
