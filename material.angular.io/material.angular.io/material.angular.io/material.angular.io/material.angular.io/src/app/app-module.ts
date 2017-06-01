import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NgModule} from '@angular/core';
import {Location, LocationStrategy, PathLocationStrategy} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {MaterialModule, MdNativeDateModule} from '@angular/material';
import {ExampleModule} from '@angular/material-examples';

import {MaterialDocsApp} from './material-docs-app';
import {Homepage} from './pages/homepage/homepage';
import {routing} from './routes';
import {ComponentList} from './pages/component-list/component-list';
import {ComponentViewer} from './pages/component-viewer/component-viewer';
import {GuideList} from './pages/guide-list';
import {GuideViewer} from './pages/guide-viewer';
import {SharedModule} from './shared/shared-module';
import {ComponentCategoryList} from './pages/component-category-list/component-category-list';
import {ComponentSidenav} from './pages/component-sidenav/component-sidenav';
import {Footer} from './shared/footer/footer';
import {ComponentPageTitle} from './pages/page-title/page-title';
import {ComponentPageHeader} from './pages/component-page-header/component-page-header';


@NgModule({
  declarations: [
    MaterialDocsApp,
    ComponentCategoryList,
    ComponentList,
    ComponentSidenav,
    ComponentViewer,
    ComponentPageHeader,
    GuideList,
    GuideViewer,
    Homepage,
    Footer
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ExampleModule,
    SharedModule,
    FormsModule,
    HttpModule,
    MaterialModule,
    MdNativeDateModule,
    routing,
  ],
  providers: [
    Location,
    ComponentPageTitle,
    {provide: LocationStrategy, useClass: PathLocationStrategy},
  ],
  bootstrap: [MaterialDocsApp],
})
export class AppModule {}
