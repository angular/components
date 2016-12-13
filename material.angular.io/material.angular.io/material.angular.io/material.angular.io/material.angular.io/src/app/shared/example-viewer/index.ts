import {NgModule} from '@angular/core';
import {ExampleViewer} from './example-viewer';

export * from './example-viewer';


@NgModule({
  declarations: [ExampleViewer],
  exports: [ExampleViewer],
})
export class ExampleViewerModule {}
