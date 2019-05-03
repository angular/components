import {DocViewer} from './doc-viewer';
import {ExampleViewer} from '../example-viewer/example-viewer';
import {StackblitzButtonModule} from '../stackblitz/stackblitz-button';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatTabsModule} from '@angular/material/tabs';
import {MatTooltipModule} from '@angular/material/tooltip';
import {PortalModule} from '@angular/cdk/portal';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {HeaderLink} from './header-link';
import {CopierService} from '../copier/copier.service';


// ExampleViewer is included in the DocViewerModule because they have a circular dependency.
@NgModule({
  imports: [
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatTabsModule,
    CommonModule,
    PortalModule,
    StackblitzButtonModule
  ],
  providers: [CopierService],
  declarations: [DocViewer, ExampleViewer, HeaderLink],
  entryComponents: [ExampleViewer, HeaderLink],
  exports: [DocViewer, ExampleViewer, HeaderLink],
})
export class DocViewerModule { }
