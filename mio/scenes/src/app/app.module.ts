import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {MatNativeDateModule} from '@angular/material/core';
import {MatDialogModule} from '@angular/material/dialog';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {OverlayContainer} from '@angular/cdk/overlay';
import {SceneOverlayContainer} from './scene-overlay-container';
import {DOCUMENT} from '@angular/common';
import {MatMenuModule} from '@angular/material/menu';
import {MatPaginatorModule} from '@angular/material/paginator';
import {BottomSheetSceneModule} from './scenes/bottom-sheet/bottom-sheet-scene';
import {GridListSceneModule} from './scenes/grid-list/grid-list-scene';
import {SnackBarSceneModule} from './scenes/snack-bar/snack-bar-scene';
import {SelectSceneModule} from './scenes/select/select-scene';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {AutocompleteSceneModule} from './scenes/autocomplete/autocomplete-scene';
import {DialogSceneModule} from './scenes/dialog/dialog-scene';
import {FormFieldSceneModule} from './scenes/form-field/form-field-scene';
import {ToolbarSceneModule} from './scenes/toolbar/toolbar-scene';
import {SidenavSceneModule} from './scenes/sidenav/sidenav-scene';
import {IconSceneModule} from './scenes/icon/icon-scene';
import { Platform } from '@angular/cdk/platform';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    MatDatepickerModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatNativeDateModule,
    MatDialogModule,
    ScrollingModule,
    MatMenuModule,
    MatPaginatorModule,
    BottomSheetSceneModule,
    GridListSceneModule,
    SnackBarSceneModule,
    SelectSceneModule,
    MatAutocompleteModule,
    AutocompleteSceneModule,
    DialogSceneModule,
    FormFieldSceneModule,
    ToolbarSceneModule,
    SidenavSceneModule,
    IconSceneModule,
  ],
  bootstrap: [AppComponent],
  providers: [
    {
      provide: OverlayContainer,
      useFactory: (doc: any, platform: Platform) => new SceneOverlayContainer(doc, platform),
      deps: [DOCUMENT, Platform]
    }]
})
export class AppModule {
}
