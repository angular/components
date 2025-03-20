/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgModule} from '@angular/core';
import {OverlayModule} from '../overlay';
import {PortalModule} from '../portal';
import {A11yModule} from '../a11y';
import {Dialog} from './dialog';
import {CdkDialogContainer} from './dialog-container';

@NgModule({
  imports: [OverlayModule, PortalModule, A11yModule, CdkDialogContainer],
  exports: [
    // Re-export the PortalModule so that people extending the `CdkDialogContainer`
    // don't have to remember to import it or be faced with an unhelpful error.
    PortalModule,
    CdkDialogContainer,
  ],
  providers: [Dialog],
})
export class DialogModule {}

// Re-export needed by the Angular compiler.
// See: https://github.com/angular/components/issues/30663.
// Note: These exports need to be stable and shouldn't be renamed unnecessarily because
// consuming libraries might have references to them in their own partial compilation output.
export {
  CdkPortal as ɵɵCdkPortal,
  CdkPortalOutlet as ɵɵCdkPortalOutlet,
  TemplatePortalDirective as ɵɵTemplatePortalDirective,
  PortalHostDirective as ɵɵPortalHostDirective,
} from '../portal';
