import {Component, inject} from '@angular/core';
import {Dialog, DialogModule, DialogRef} from '@angular/cdk/dialog';

/**
 * @title CDK Dialog Styling
 */
@Component({
  selector: 'cdk-dialog-styling-example',
  templateUrl: 'cdk-dialog-styling-example.html',
  standalone: true,
  imports: [DialogModule],
})
export class CdkDialogStylingExample {
  dialog = inject(Dialog);

  openDialog(): void {
    this.dialog.open<string>(CdkDialogStylingExampleDialog);
  }
}

@Component({
  selector: 'cdk-dialog-styling-example-dialog',
  templateUrl: 'cdk-dialog-styling-example-dialog.html',
  styleUrl: 'cdk-dialog-styling-example-dialog.css',
  standalone: true,
})
export class CdkDialogStylingExampleDialog {
  dialogRef = inject(DialogRef);
}
