import {Component, inject} from '@angular/core';
import {Dialog, DialogRef, DIALOG_DATA, DialogModule} from '@angular/cdk/dialog';
import {FormsModule} from '@angular/forms';

export interface DialogData {
  animal: string;
  name: string;
}

/**
 * @title CDK Dialog Overview
 */
@Component({
  selector: 'cdk-dialog-overview-example',
  templateUrl: 'cdk-dialog-overview-example.html',
  imports: [FormsModule, DialogModule],
})
export class CdkDialogOverviewExample {
  dialog = inject(Dialog);

  animal: string | undefined;
  name: string;

  openDialog(): void {
    const dialogRef = this.dialog.open<string>(CdkDialogOverviewExampleDialog, {
      width: '250px',
      data: {name: this.name, animal: this.animal},
    });

    dialogRef.closed.subscribe(result => {
      console.log('The dialog was closed');
      this.animal = result;
    });
  }
}

@Component({
  selector: 'cdk-dialog-overview-example-dialog',
  templateUrl: 'cdk-dialog-overview-example-dialog.html',
  styleUrl: 'cdk-dialog-overview-example-dialog.css',
  imports: [FormsModule],
})
export class CdkDialogOverviewExampleDialog {
  dialogRef = inject<DialogRef<string>>(DialogRef<string>);
  data = inject(DIALOG_DATA);
}
