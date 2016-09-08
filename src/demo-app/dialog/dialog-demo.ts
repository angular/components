import {Component, ViewContainerRef} from '@angular/core';
import {MatDialog, MatDialogConfig, MatDialogRef} from '@angular2-material/dialog';

@Component({
  moduleId: module.id,
  selector: 'dialog-demo',
  templateUrl: 'dialog-demo.html',
  styleUrls: ['dialog-demo.css'],
})
export class DialogDemo {
  dialogRef: MatDialogRef<JazzDialog>;
  lastCloseResult: string;

  constructor(
      public dialog: MatDialog,
      public viewContainerRef: ViewContainerRef) { }

  open() {
    let config = new MatDialogConfig();
    config.viewContainerRef = this.viewContainerRef;

    this.dialogRef = this.dialog.open(JazzDialog, config);

    this.dialogRef.afterClosed().subscribe(result => {
      this.lastCloseResult = result;
      this.dialogRef = null;
    });
  }
}


@Component({
  selector: 'demo-jazz-dialog',
  template: `
  <p>It's Jazz!</p>
  <p><label>How much? <input #howMuch></label></p>
  <button type="button" (click)="dialogRef.close(howMuch.value)">Close dialog</button>`
})
export class JazzDialog {
  constructor(public dialogRef: MatDialogRef<JazzDialog>) { }
}
