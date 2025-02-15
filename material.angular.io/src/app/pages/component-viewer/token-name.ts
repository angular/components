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
  private clipboard = inject(Clipboard);
  private snackbar = inject(MatSnackBar);

  name = input.required<string>();

  protected copy(name: string): void {
    const message = this.clipboard.copy(name) ? 'Copied token name' : 'Failed to copy token name';
    this.snackbar.open(message, undefined, {duration: 2500});
  }
}
