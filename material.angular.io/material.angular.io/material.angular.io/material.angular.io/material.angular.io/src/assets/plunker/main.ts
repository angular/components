import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MaterialModule} from '@angular/material';
import {MaterialDocsExample} from './material-docs-example';

@NgModule({

  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
  ],

  declarations: [MaterialDocsExample],
  bootstrap: [MaterialDocsExample],
  providers: []
})
export class PlunkerAppModule {}

platformBrowserDynamic().bootstrapModule(PlunkerAppModule);
