import {ChangeDetectionStrategy, Component, TemplateRef, inject, viewChild} from '@angular/core';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';

/**
 * @title Testing with MatDialogHarness
 */
@Component({
  selector: 'dialog-harness-example',
  templateUrl: 'dialog-harness-example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogHarnessExample {
  readonly dialogTemplate = viewChild.required(TemplateRef);

  readonly dialog = inject(MatDialog);

  open(config?: MatDialogConfig) {
    return this.dialog.open(this.dialogTemplate(), config);
  }
}
