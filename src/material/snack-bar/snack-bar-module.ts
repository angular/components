/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {OverlayModule} from '@angular/cdk/overlay';
import {PortalModule} from '@angular/cdk/portal';
import {NgModule} from '@angular/core';
import {BidiModule} from '@angular/cdk/bidi';
import {MatButtonModule} from '../button';

import {SimpleSnackBar} from './simple-snack-bar';
import {MatSnackBarContainer} from './snack-bar-container';
import {MatSnackBarAction, MatSnackBarActions, MatSnackBarLabel} from './snack-bar-content';
import {MatSnackBar} from './snack-bar';

const DIRECTIVES = [MatSnackBarContainer, MatSnackBarLabel, MatSnackBarActions, MatSnackBarAction];

@NgModule({
  imports: [OverlayModule, PortalModule, MatButtonModule, SimpleSnackBar, ...DIRECTIVES],
  exports: [BidiModule, ...DIRECTIVES],
  providers: [MatSnackBar],
})
export class MatSnackBarModule {}
