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
    ScrollingModule
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
