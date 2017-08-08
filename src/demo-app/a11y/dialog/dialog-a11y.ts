import {Component} from '@angular/core';
import {MdDialog, MdDialogRef, MD_DIALOG_DATA} from '@angular/material';


@Component({
  moduleId: module.id,
  selector: 'dialog-a11y',
  templateUrl: 'dialog-a11y.html',
  styleUrls: ['dialog-a11y.css'],
})
export class DialogAccessibilityDemo {
  fruitSelectedOption: string = '';

  constructor(public dialog: MdDialog) {}

  openFruitDialog() {
    let dialogRef = this.dialog.open(DialogFruitExampleDialog);
    dialogRef.afterClosed().subscribe(result => {
      this.fruitSelectedOption = result;
    });
  }

  openWelcomeDialog() {
    this.dialog.open(DialogWelcomeExampleDialog);
  }

  openNeptuneDialog() {
    this.dialog.open(DialogNeptuneExampleDialog);
  }
}

@Component({
  moduleId: module.id,
  selector: 'dialog-fruit-a11y',
  templateUrl: 'dialog-fruit-a11y.html'
})
export class DialogFruitExampleDialog {}

@Component({
  moduleId: module.id,
  selector: 'dialog-welcome-a11y',
  template: `Welcome to Angular Material dialog demo page!
  <md-dialog-actions>
    <button md-raised-button color="primary" md-dialog-close>Close</button>
  </md-dialog-actions>`
})
export class DialogWelcomeExampleDialog {}

@Component({
  moduleId: module.id,
  selector: 'dialog-neptune-a11y-dialog',
  templateUrl: './dialog-neptune-a11y.html'
})
export class DialogNeptuneExampleDialog {
  constructor(public dialog: MdDialog) { }

  showInStackedDialog() {
    this.dialog.open(DialogNeptuneIFrameDialog);
  }
}

@Component({
  moduleId: module.id,
  selector: 'dialog-neptune-iframe-dialog',
  styles: [
    `iframe {
      width: 800px;
    }`
  ],
  templateUrl: './dialog-neptune-iframe-a11y.html'
})
export class DialogNeptuneIFrameDialog {
}
