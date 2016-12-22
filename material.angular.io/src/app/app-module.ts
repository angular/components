import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {Location, LocationStrategy, PathLocationStrategy} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {MaterialModule} from '@angular/material';
import {MaterialDocsApp} from './material-docs-app';
import {Homepage} from './pages/homepage/homepage';
import {routing} from './routes';
import {ComponentList} from './pages/component-list/component-list';
import {ComponentViewer} from './pages/component-viewer/component-viewer';
import {GuideList} from './pages/guide-list';
import {GuideViewer} from './pages/guide-viewer';
import {ExampleModule} from './examples/example-module';
import {SharedModule} from './shared/shared-module';
import {ComponentCategoryList} from './pages/component-category-list/component-category-list';
import {ComponentSidenav} from './pages/component-sidenav/component-sidenav';
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
  ],
  imports: [
    BrowserModule,
    ExampleModule,
    SharedModule,
    FormsModule,
    HttpModule,
    MaterialModule.forRoot(),
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
