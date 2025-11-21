/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, input, inject} from '@angular/core';
import {MatIconButton} from '@angular/material/button';
import {Clipboard} from '@angular/cdk/clipboard';
import {MatIcon} from '@angular/material/icon';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatTooltip} from '@angular/material/tooltip';

@Component({
  selector: 'token-name',
  template: `
    <code>{{name()}}</code>
    <button
      mat-icon-button
      matTooltip="Copy name to the clipboard"
      (click)="copy(name())">
      <mat-icon>content_copy</mat-icon>
    </button>
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;

      button {
        margin-left: 8px;
      }
    }
  `,
  imports: [MatIconButton, MatIcon, MatTooltip],
})
export class TokenName {
  private _clipboard = inject(Clipboard);
  private _snackbar = inject(MatSnackBar);

  name = input.required<string>();

  protected copy(name: string): void {
    const message = this._clipboard.copy(name) ? 'Copied token name' : 'Failed to copy token name';
    this._snackbar.open(message, undefined, {duration: 2500});
  }
}
