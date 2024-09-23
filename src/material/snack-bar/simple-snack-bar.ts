/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, ViewEncapsulation, inject} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {MatSnackBarRef} from './snack-bar-ref';
import {MAT_SNACK_BAR_DATA} from './snack-bar-config';
import {MatSnackBarAction, MatSnackBarActions, MatSnackBarLabel} from './snack-bar-content';

/**
 * Interface for a simple snack bar component that has a message and a single action.
 */
export interface TextOnlySnackBar {
  data: {message: string; action: string};
  snackBarRef: MatSnackBarRef<TextOnlySnackBar>;
  action: () => void;
  hasAction: boolean;
}

@Component({
  selector: 'simple-snack-bar',
  templateUrl: 'simple-snack-bar.html',
  styleUrl: 'simple-snack-bar.css',
  exportAs: 'matSnackBar',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButton, MatSnackBarLabel, MatSnackBarActions, MatSnackBarAction],
  standalone: true,
  host: {
    'class': 'mat-mdc-simple-snack-bar',
  },
})
export class SimpleSnackBar implements TextOnlySnackBar {
  snackBarRef = inject<MatSnackBarRef<SimpleSnackBar>>(MatSnackBarRef);
  data = inject(MAT_SNACK_BAR_DATA);

  constructor(...args: unknown[]);
  constructor() {}

  /** Performs the action on the snack bar. */
  action(): void {
    this.snackBarRef.dismissWithAction();
  }

  /** If the action button should be shown. */
  get hasAction(): boolean {
    return !!this.data.action;
  }
}
