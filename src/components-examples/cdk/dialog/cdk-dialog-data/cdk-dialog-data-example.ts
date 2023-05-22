import {Component, Inject} from '@angular/core';
import {Dialog, DIALOG_DATA, DialogModule} from '@angular/cdk/dialog';
import {NgIf} from '@angular/common';

export interface DialogData {
  animal: 'panda' | 'unicorn' | 'lion';
}

/**
 * @title Injecting data when opening a dialog
 */
@Component({
  selector: 'cdk-dialog-data-example',
  templateUrl: 'cdk-dialog-data-example.html',
  standalone: true,
  imports: [DialogModule],
})
export class CdkDialogDataExample {
  constructor(public dialog: Dialog) {}

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
  styleUrls: ['./cdk-dialog-data-example-dialog.css'],
  standalone: true,
  imports: [NgIf],
})
export class CdkDialogDataExampleDialog {
  constructor(@Inject(DIALOG_DATA) public data: DialogData) {}
}
