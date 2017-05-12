import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MaterialModule, MdNativeDateModule} from '@angular/material';
import {MaterialDocsExample} from './material-docs-example';
import {HttpModule} from '@angular/http';

@NgModule({

  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpModule,
    MaterialModule,
    MdNativeDateModule,
    ReactiveFormsModule,
  ],

  declarations: [MaterialDocsExample],
  bootstrap: [MaterialDocsExample],
  providers: []
})
export class PlunkerAppModule {}

platformBrowserDynamic().bootstrapModule(PlunkerAppModule);
