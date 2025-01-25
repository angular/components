import {DocViewer} from './doc-viewer';
import {ExampleViewer} from '../example-viewer/example-viewer';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatTabsModule} from '@angular/material/tabs';
import {MatTooltipModule} from '@angular/material/tooltip';
import {PortalModule} from '@angular/cdk/portal';
import {NgModule} from '@angular/core';
import {HeaderLink} from './header-link';
import {CodeSnippet} from '../example-viewer/code-snippet';
import {DeprecatedFieldComponent} from './deprecated-tooltip';
import {ModuleImportCopyButton} from './module-import-copy-button';

// ExampleViewer is included in the DocViewerModule because they have a circular dependency.
@NgModule({
  imports: [
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatTabsModule,
    PortalModule,
    DocViewer,
    ExampleViewer,
    HeaderLink,
    CodeSnippet,
    DeprecatedFieldComponent,
    ModuleImportCopyButton,
  ],
  exports: [DocViewer, ExampleViewer, HeaderLink, DeprecatedFieldComponent, ModuleImportCopyButton],
})
export class DocViewerModule {}
