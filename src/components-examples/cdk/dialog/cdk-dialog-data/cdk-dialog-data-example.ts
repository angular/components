import {Component, inject} from '@angular/core';
import {Dialog, DIALOG_DATA, DialogModule} from '@angular/cdk/dialog';

export interface DialogData {
  animal: 'panda' | 'unicorn' | 'lion';
}

/**
 * @title Injecting data when opening a dialog
 */
@Component({
  selector: 'cdk-dialog-data-example',
  templateUrl: 'cdk-dialog-data-example.html',
  imports: [DialogModule],
})
export class CdkDialogDataExample {
  dialog = inject(Dialog);

  openDialog() {
    this.dialog.open(CdkDialogDataExampleDialog, {
      minWidth: '300px',
      data: {
        animal: 'panda',
      },
    });
  }
}

@Component({
  selector: 'cdk-dialog-data-example-dialog',
  templateUrl: 'cdk-dialog-data-example-dialog.html',
  styleUrl: './cdk-dialog-data-example-dialog.css',
})
export class CdkDialogDataExampleDialog {
  data = inject(DIALOG_DATA);
}
