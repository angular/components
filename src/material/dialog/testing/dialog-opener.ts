/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentType} from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  Component,
  NgModule,
  OnDestroy,
  ViewEncapsulation,
} from '@angular/core';
import {MatDialog, MatDialogConfig, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {Subscription} from 'rxjs';

/** Test component that immediately opens a dialog when bootstrapped. */
@Component({
  selector: 'mat-test-dialog-opener',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MatTestDialogOpener<T = unknown, R = unknown> implements OnDestroy {
  /** Component that should be opened with the MatDialog `open` method. */
  protected static component: ComponentType<unknown> | undefined;

  /** Config that should be provided to the MatDialog `open` method. */
  protected static config: MatDialogConfig | undefined;

  /** MatDialogRef returned from the MatDialog `open` method. */
  dialogRef: MatDialogRef<T, R>;

  /** Data passed to the `MatDialog` close method. */
  closedResult: R | undefined;

  private readonly _afterClosedSubscription: Subscription;

  /** Static method that prepares this class to open the provided component. */
  static withComponent<T = unknown, R = unknown>(
    component: ComponentType<T>,
    config?: MatDialogConfig,
  ) {
    MatTestDialogOpener.component = component;
    MatTestDialogOpener.config = config;
    return MatTestDialogOpener as ComponentType<MatTestDialogOpener<T, R>>;
  }

  constructor(public dialog: MatDialog) {
    if (!MatTestDialogOpener.component) {
      throw new Error(`MatTestDialogOpener does not have a component provided.`);
    }

    this.dialogRef = this.dialog.open<T, R>(
      MatTestDialogOpener.component as ComponentType<T>,
      MatTestDialogOpener.config || {},
    );
    this._afterClosedSubscription = this.dialogRef.afterClosed().subscribe(result => {
      this.closedResult = result;
    });
  }

  ngOnDestroy() {
    this._afterClosedSubscription.unsubscribe();
    MatTestDialogOpener.component = undefined;
    MatTestDialogOpener.config = undefined;
  }
}

@NgModule({
  declarations: [MatTestDialogOpener],
  imports: [MatDialogModule, NoopAnimationsModule],
})
export class MatTestDialogOpenerModule {}
