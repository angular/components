import {NgModule} from '@angular/core';
import {HttpModule} from '@angular/http';
import {DocViewer} from './doc-viewer';
import {ExampleViewer} from '../example-viewer/example-viewer';
import {ExampleViewerModule} from '../example-viewer/index';

export * from './doc-viewer';

@NgModule({
  imports: [
    ExampleViewerModule,
    HttpModule,
  ],
  declarations: [DocViewer],
  exports: [DocViewer],
  entryComponents: [
    ExampleViewer,
  ],
})
export class DocViewerModule {}
