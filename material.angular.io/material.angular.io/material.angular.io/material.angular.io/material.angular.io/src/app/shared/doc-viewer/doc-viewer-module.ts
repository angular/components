import {DocViewer} from './doc-viewer';
import {ExampleViewer} from '../example-viewer/example-viewer';
import {PlunkerButtonModule} from '../plunker/plunker-button';
import {
  MdButtonModule,
  MdIconModule,
  MdTabsModule,
  MdTooltipModule,
  MdSnackBarModule,
  PortalModule
} from '@angular/material';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {HeaderLink} from './header-link';
import {CopierService} from '../copier/copier.service';


// ExampleViewer is included in the DocViewerModule because they have a circular dependency.
@NgModule({
  imports: [
    MdButtonModule,
    MdIconModule,
    MdTooltipModule,
    MdSnackBarModule,
    MdTabsModule,
    CommonModule,
    PortalModule,
    PlunkerButtonModule
  ],
  providers: [CopierService],
  declarations: [DocViewer, ExampleViewer, HeaderLink],
  entryComponents: [ExampleViewer, HeaderLink],
  exports: [DocViewer, ExampleViewer, HeaderLink],
})
export class DocViewerModule { }
