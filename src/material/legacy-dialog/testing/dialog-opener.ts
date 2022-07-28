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
  Directive,
  NgModule,
  OnDestroy,
  ViewEncapsulation,
} from '@angular/core';
import {
  MatLegacyDialog,
  MatLegacyDialogContainer,
  MatLegacyDialogModule,
  MatLegacyDialogRef,
  _MatLegacyDialogBase,
  _MatLegacyDialogContainerBase,
  MatLegacyDialogConfig,
} from '@angular/material/legacy-dialog';
import {Subscription} from 'rxjs';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

/** Base class for a component that immediately opens a dialog when created. */
@Directive()
export class _MatTestLegacyDialogOpenerBase<C extends _MatLegacyDialogContainerBase, T, R>
  implements OnDestroy
{
  /** Component that should be opened with the MatDialog `open` method. */
  protected static component: ComponentType<unknown> | undefined;

  /** Config that should be provided to the MatDialog `open` method. */
  protected static config: MatLegacyDialogConfig | undefined;

  /** MatDialogRef returned from the MatDialog `open` method. */
  dialogRef: MatLegacyDialogRef<T, R>;

  /** Data passed to the `MatDialog` close method. */
  closedResult: R | undefined;

  private readonly _afterClosedSubscription: Subscription;

  constructor(public dialog: _MatLegacyDialogBase<C>) {
    if (!_MatTestLegacyDialogOpenerBase.component) {
      throw new Error(`MatTestDialogOpener does not have a component provided.`);
    }

    this.dialogRef = this.dialog.open<T, R>(
      _MatTestLegacyDialogOpenerBase.component as ComponentType<T>,
      _MatTestLegacyDialogOpenerBase.config || {},
    );
    this._afterClosedSubscription = this.dialogRef.afterClosed().subscribe(result => {
      this.closedResult = result;
    });
  }

  ngOnDestroy() {
    this._afterClosedSubscription.unsubscribe();
    _MatTestLegacyDialogOpenerBase.component = undefined;
    _MatTestLegacyDialogOpenerBase.config = undefined;
  }
}

/** Test component that immediately opens a dialog when created. */
@Component({
  selector: 'mat-test-dialog-opener',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MatTestLegacyDialogOpener<
  T = unknown,
  R = unknown,
> extends _MatTestLegacyDialogOpenerBase<MatLegacyDialogContainer, T, R> {
  constructor(dialog: MatLegacyDialog) {
    super(dialog);
  }

  /** Static method that prepares this class to open the provided component. */
  static withComponent<T = unknown, R = unknown>(
    component: ComponentType<T>,
    config?: MatLegacyDialogConfig,
  ) {
    _MatTestLegacyDialogOpenerBase.component = component;
    _MatTestLegacyDialogOpenerBase.config = config;
    return MatTestLegacyDialogOpener as ComponentType<MatTestLegacyDialogOpener<T, R>>;
  }
}

@NgModule({
  declarations: [MatTestLegacyDialogOpener],
  imports: [MatLegacyDialogModule, NoopAnimationsModule],
})
export class MatTestLegacyDialogOpenerModule {}
