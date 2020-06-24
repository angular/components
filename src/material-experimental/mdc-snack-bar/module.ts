/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {OverlayModule} from '@angular/cdk/overlay';
import {PortalModule} from '@angular/cdk/portal';
import {CommonModule} from '@angular/common';
import {Directive, NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCommonModule} from '@angular/material/core';

import {MatSimpleSnackBar} from './simple-snack-bar';
import {MatSnackBarContainer} from './snack-bar-container';

/** Directive that should be applied to the text element to be rendered in the snack bar. */
@Directive({
  selector: `[matSnackBarLabel]`,
  host: {
    'class': 'mat-mdc-snack-bar-label mdc-snackbar__label',
  }
})
export class MatSnackBarLabel {}

/** Directive that should be applied to the element containing the snack bar's action buttons. */
@Directive({
  selector: `[matSnackBarActions]`,
  host: {
    'class': 'mat-mdc-snack-bar-actions mdc-snackbar__actions',
  }
})
export class MatSnackBarActions {}

/** Directive that should be applied to each of the snack bar's action buttons. */
@Directive({
  selector: `[matSnackBarAction]`,
  host: {
    'class': 'mat-mdc-snack-bar-action mdc-snackbar__action',
  }
})
export class MatSnackBarAction {}

@NgModule({
  imports: [
    OverlayModule,
    PortalModule,
    CommonModule,
    MatButtonModule,
    MatCommonModule,
  ],
  exports: [
    MatCommonModule,
    MatSnackBarContainer,
    MatSnackBarLabel,
    MatSnackBarActions,
    MatSnackBarAction,
  ],
  declarations: [
    MatSimpleSnackBar,
    MatSnackBarContainer,
    MatSnackBarLabel,
    MatSnackBarActions,
    MatSnackBarAction,
  ],
  entryComponents: [
    MatSimpleSnackBar,
    MatSnackBarContainer,
  ],
})
export class MatSnackBarModule {
}
