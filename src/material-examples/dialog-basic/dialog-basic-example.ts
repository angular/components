import {Component} from '@angular/core';
import {MdDialog} from '@angular/material';

/**
 * @title Basic Dialog
 */
@Component({
  selector: 'dialog-basic-example',
  templateUrl: 'dialog-basic-example.html',
})
export class DialogBasicExample {
  constructor(private dialog: MdDialog) {}

  openDialog() {
    this.dialog.open(DialogBasicExampleDialog);
  }
}

@Component({
  selector: 'dialog-basic-example-dialog',
  templateUrl: 'dialog-basic-example-dialog.html',
})
export class DialogBasicExampleDialog {}
