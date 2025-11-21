/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, inject} from '@angular/core';
import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatTooltip} from '@angular/material/tooltip';
import {Clipboard} from '@angular/cdk/clipboard';

/**
 * Shows up an icon button which will allow users to copy the module import
 */
@Component({
  selector: 'module-import-copy-button',
  template: `
    <button mat-icon-button matTooltip="Copy import to the clipboard" (click)="copy()">
      <mat-icon>content_copy</mat-icon>
    </button>
  `,
  imports: [MatIconButton, MatIcon, MatTooltip],
})
export class ModuleImportCopyButton {
  private _clipboard = inject(Clipboard);
  private _snackbar = inject(MatSnackBar);
  /** Import path for the module that will be copied */
  import = '';

  copy(): void {
    const message = this._clipboard.copy(this.import)
      ? 'Copied module import'
      : 'Failed to copy module import';
    this._snackbar.open(message, undefined, {duration: 2500});
  }
}
