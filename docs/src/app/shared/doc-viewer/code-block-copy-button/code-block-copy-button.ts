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

@Component({
  selector: 'code-block-copy-button',
  imports: [MatIconButton, MatIcon, MatTooltip],
  template: `
    <button mat-icon-button matTooltip="Copy code to the clipboard" (click)="copy()">
      <mat-icon>content_copy</mat-icon>
    </button>
  `,
})
export class CodeBlockCopyButton {
  private _clipboard = inject(Clipboard);
  private _snackbar = inject(MatSnackBar);

  /** Code snippet that will be copied */
  code = '';

  copy(): void {
    const message = this._clipboard.copy(this.code)
      ? 'Copied code snippet'
      : 'Failed to copy code snippet';

    this._snackbar.open(message, undefined, {duration: 2500});
  }
}
