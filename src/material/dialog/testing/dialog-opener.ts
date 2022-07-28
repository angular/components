/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentType} from '@angular/cdk/overlay';
import {ChangeDetectionStrategy, Component, NgModule, ViewEncapsulation} from '@angular/core';
import {_MatTestLegacyDialogOpenerBase} from '@angular/material/legacy-dialog/testing';
import {
  MatDialog,
  MatDialogContainer,
  MatDialogModule,
  MatDialogConfig,
} from '@angular/material/dialog';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

/** Test component that immediately opens a dialog when bootstrapped. */
@Component({
  selector: 'mat-test-dialog-opener',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MatTestDialogOpener<T = unknown, R = unknown> extends _MatTestLegacyDialogOpenerBase<
  MatDialogContainer,
  T,
  R
> {
  constructor(dialog: MatDialog) {
    super(dialog);
  }

  /** Static method that prepares this class to open the provided component. */
  static withComponent<T = unknown, R = unknown>(
    component: ComponentType<T>,
    config?: MatDialogConfig,
  ) {
    _MatTestLegacyDialogOpenerBase.component = component;
    _MatTestLegacyDialogOpenerBase.config = config;
    return MatTestDialogOpener as ComponentType<MatTestDialogOpener<T, R>>;
  }
}

@NgModule({
  declarations: [MatTestDialogOpener],
  imports: [MatDialogModule, NoopAnimationsModule],
})
export class MatTestDialogOpenerModule {}
