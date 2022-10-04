import {DocViewer} from './doc-viewer';
import {ExampleViewer} from '../example-viewer/example-viewer';
import {StackBlitzButtonModule} from '../stack-blitz';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {MatIconModule} from '@angular/material/icon';
import {MatLegacySnackBarModule as MatSnackBarModule} from '@angular/material/legacy-snack-bar';
import {MatLegacyTabsModule as MatTabsModule} from '@angular/material/legacy-tabs';
import {MatLegacyTooltipModule as MatTooltipModule} from '@angular/material/legacy-tooltip';
import {PortalModule} from '@angular/cdk/portal';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {HeaderLink} from './header-link';
import {CodeSnippet} from '../example-viewer/code-snippet';


// ExampleViewer is included in the DocViewerModule because they have a circular dependency.
@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatTabsModule,
    PortalModule,
    StackBlitzButtonModule
  ],
  declarations: [DocViewer, ExampleViewer, HeaderLink, CodeSnippet],
  exports: [DocViewer, ExampleViewer, HeaderLink]
})
export class DocViewerModule { }
