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
  Directive,
  Component,
  NgModule,
  OnDestroy,
  ViewEncapsulation,
} from '@angular/core';
import {
  _MatDialogBase,
  _MatDialogContainerBase,
  MatDialog,
  MatDialogConfig,
  MatDialogContainer,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import {Subscription} from 'rxjs';
import {NoopAnimationsModule} from "@angular/platform-browser/animations";

/** Base class for a component that immediately opens a dialog when created. */
@Directive()
export class _MatTestDialogOpenerBase<C extends _MatDialogContainerBase> implements OnDestroy {
  /** Component that should be opened with the MatDialog `open` method. */
  protected static component: ComponentType<unknown> | undefined;

  /** Config that should be provided to the MatDialog `open` method. */
  protected static config: MatDialogConfig | undefined;

  /** MatDialogRef returned from the MatDialog `open` method. */
  dialogRef: MatDialogRef<unknown>;

  /** Data passed to the `MatDialog` close method. */
  closedResult: unknown;

  private readonly _afterClosedSubscription: Subscription;

  constructor(public dialog: _MatDialogBase<C>) {
    if (!_MatTestDialogOpenerBase.component) {
      throw new Error(`MatTestDialogOpener does not have a component provided.`);
    }

    this.dialogRef = this.dialog.open(
      _MatTestDialogOpenerBase.component,
      _MatTestDialogOpenerBase.config || {},
    );
    this._afterClosedSubscription = this.dialogRef.afterClosed().subscribe((result: unknown) => {
      this.closedResult = result;
    });
  }

  ngOnDestroy() {
    this._afterClosedSubscription.unsubscribe();
    _MatTestDialogOpenerBase.component = undefined;
    _MatTestDialogOpenerBase.config = undefined;
  }
}

/** Test component that immediately opens a dialog when created. */
@Component({
  selector: 'mat-test-dialog-opener',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MatTestDialogOpener extends _MatTestDialogOpenerBase<MatDialogContainer> {
  constructor(dialog: MatDialog) {
    super(dialog);
  }

  /** Static method that prepares this class to open the provided component. */
  static withComponent(component: ComponentType<unknown>, config?: MatDialogConfig) {
    _MatTestDialogOpenerBase.component = component;
    _MatTestDialogOpenerBase.config = config;
    return MatTestDialogOpener;
  }
}

@NgModule({
  declarations: [MatTestDialogOpener],
  imports: [MatDialogModule, NoopAnimationsModule],
})
export class MatTestDialogOpenerModule {}
