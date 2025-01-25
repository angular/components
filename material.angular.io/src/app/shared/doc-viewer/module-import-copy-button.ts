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
  template: `<button
  mat-icon-button
  matTooltip="Copy import to the clipboard"
  (click)="copy()">
  <mat-icon>content_copy</mat-icon>
</button>`,
  standalone: true,
  imports: [MatIconButton, MatIcon, MatTooltip],
})
export class ModuleImportCopyButton {
  private clipboard = inject(Clipboard);
  private snackbar = inject(MatSnackBar);
  /** Import path for the module that will be copied */
  import = '';

  copy(): void {
    const message = this.clipboard.copy(this.import)
      ? 'Copied module import'
      : 'Failed to copy module import';
    this.snackbar.open(message, undefined, {duration: 2500});
  }
}
