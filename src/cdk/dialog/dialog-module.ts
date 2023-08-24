/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {OverlayModule} from '@angular/cdk/overlay';
import {PortalModule} from '@angular/cdk/portal';
import {A11yModule} from '@angular/cdk/a11y';
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
