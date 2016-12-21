import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {MaterialModule} from '@angular/material';
import {MaterialDocsExample} from './material-docs-example';

@NgModule({

  imports: [
    BrowserModule,
    MaterialModule.forRoot(),
  ],

  declarations: [MaterialDocsExample],
  bootstrap: [MaterialDocsExample],
  providers: []
})
export class PlunkerAppModule {}

platformBrowserDynamic().bootstrapModule(PlunkerAppModule);
