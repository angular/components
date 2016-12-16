import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {Location, LocationStrategy, PathLocationStrategy} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {MaterialModule} from '@angular/material';
import {MaterialDocsApp} from './material-docs-app';
import {Homepage} from './pages/homepage/homepage';
import {NavBar} from './shared/navbar/navbar';
import {routing} from './routes';
import {ComponentList} from './pages/component-list/component-list';
import {DocViewerModule} from './shared/doc-viewer/index';
import {ExampleViewerModule} from './shared/example-viewer/index';
import {ComponentViewer} from './pages/component-viewer/component-viewer';


@NgModule({
  declarations: [
    MaterialDocsApp,
    ComponentList,
    ComponentViewer,
    Homepage,
    NavBar,
  ],
  imports: [
    BrowserModule,
    DocViewerModule,
    ExampleViewerModule,
    FormsModule,
    HttpModule,
    MaterialModule.forRoot(),
    routing,
  ],
  providers: [
    Location,
    {provide: LocationStrategy, useClass: PathLocationStrategy},
  ],
  bootstrap: [MaterialDocsApp],
})
export class AppModule {}
