/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {BidiModule} from '@angular/cdk/bidi';
import {DialogModule} from '@angular/cdk/dialog';
import {OverlayModule} from '@angular/cdk/overlay';
import {PortalModule} from '@angular/cdk/portal';
import {NgModule} from '@angular/core';
import {MatDialog} from './dialog';
import {MatDialogContainer} from './dialog-container';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from './dialog-content-directives';

const DIRECTIVES = [
  MatDialogContainer,
  MatDialogClose,
  MatDialogTitle,
  MatDialogActions,
  MatDialogContent,
];

@NgModule({
  imports: [DialogModule, OverlayModule, PortalModule, ...DIRECTIVES],
  exports: [BidiModule, ...DIRECTIVES],
  providers: [MatDialog],
})
export class MatDialogModule {}
