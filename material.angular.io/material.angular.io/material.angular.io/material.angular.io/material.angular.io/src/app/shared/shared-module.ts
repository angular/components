import {NgModule} from '@angular/core';
import {HttpModule} from '@angular/http';
import {MaterialModule} from '@angular/material';
import {BrowserModule} from '@angular/platform-browser';
import {RouterModule} from '@angular/router';

import {ExampleViewer} from './example-viewer/example-viewer';
import {DocViewer} from './doc-viewer/doc-viewer';
import {DocumentationItems} from './documentation-items/documentation-items';
import {PlunkerButton} from './plunker';
import {GuideItems} from './guide-items/guide-items';
import {ThemeStorage} from './theme-chooser/theme-storage/theme-storage';
import {ThemeChooser} from './theme-chooser/theme-chooser';
import {NavBar} from './navbar/navbar';
import {SvgBuilder} from './svg-viewer/svg-builder';
import {SvgViewer} from './svg-viewer/svg-viewer';


@NgModule({
  imports: [
    HttpModule,
    RouterModule,
    BrowserModule,
    MaterialModule,
  ],
  declarations: [DocViewer, ExampleViewer, NavBar, PlunkerButton, ThemeChooser, SvgViewer],
  exports: [DocViewer, ExampleViewer, NavBar, PlunkerButton, ThemeChooser, SvgViewer],
  providers: [DocumentationItems, GuideItems, ThemeStorage, SvgBuilder],
  entryComponents: [
    ExampleViewer,
  ],
})
export class SharedModule {}
