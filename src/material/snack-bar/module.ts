/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {OverlayModule} from '@angular/cdk/overlay';
import {PortalModule} from '@angular/cdk/portal';
import {NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCommonModule} from '@angular/material/core';

import {SimpleSnackBar} from './simple-snack-bar';
import {MatSnackBarContainer} from './snack-bar-container';
import {MatSnackBarAction, MatSnackBarActions, MatSnackBarLabel} from './snack-bar-content';
import {MatSnackBar} from './snack-bar';

const DIRECTIVES = [MatSnackBarContainer, MatSnackBarLabel, MatSnackBarActions, MatSnackBarAction];

@NgModule({
  imports: [
    OverlayModule,
    PortalModule,
    MatButtonModule,
    MatCommonModule,
    SimpleSnackBar,
    ...DIRECTIVES,
  ],
  exports: [MatCommonModule, ...DIRECTIVES],
  providers: [MatSnackBar],
})
export class MatSnackBarModule {}
