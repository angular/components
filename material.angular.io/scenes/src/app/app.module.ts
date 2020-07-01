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
import {SnackBarSceneModule} from './scenes/snack-bar/snack-bar-scene';
import {SelectSceneModule} from './scenes/select/select-scene';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {AutocompleteSceneModule} from './scenes/autocomplete/autocomplete-scene';

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
    SnackBarSceneModule,
    SelectSceneModule,
    MatAutocompleteModule,
    AutocompleteSceneModule
  ],
  bootstrap: [AppComponent],
  providers: [{
    provide: OverlayContainer,
    useFactory: (doc: any) => new SceneOverlayContainer(doc),
    deps: [DOCUMENT]
  }]
})
export class AppModule {
}
