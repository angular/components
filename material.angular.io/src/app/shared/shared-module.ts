import {NgModule} from '@angular/core';
import {HttpModule} from '@angular/http';
import {BrowserModule} from '@angular/platform-browser';
import {RouterModule} from '@angular/router';

import {ExampleViewer} from './example-viewer/example-viewer';
import {DocViewer} from './doc-viewer/doc-viewer';
import {DocumentationItems} from './documentation-items/documentation-items';
import {PlunkerButton} from './plunker';
import {GuideItems} from './guide-items/guide-items';
import {ThemeStorage} from './theme-picker/theme-storage/theme-storage';
import {ThemePicker} from './theme-picker/theme-picker';
import {NavBar} from './navbar/navbar';
import {SvgViewer} from './svg-viewer/svg-viewer';
import {DocsMaterialModule} from '../app-module';


@NgModule({
  imports: [
    HttpModule,
    RouterModule,
    BrowserModule,
    DocsMaterialModule,
  ],
  declarations: [DocViewer, ExampleViewer, NavBar, PlunkerButton, ThemePicker, SvgViewer],
  exports: [DocViewer, ExampleViewer, NavBar, PlunkerButton, ThemePicker, SvgViewer],
  providers: [DocumentationItems, GuideItems, ThemeStorage],
  entryComponents: [
    ExampleViewer,
  ],
})
export class SharedModule {}
