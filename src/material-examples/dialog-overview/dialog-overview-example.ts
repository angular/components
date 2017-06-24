import {Component} from '@angular/core';
import {MdDialog} from '@angular/material';

/**
 * @title Dialog Overview
 * @component DialogOverviewExample
 * @id dialog-overview
 * @addlComponents DialogOverviewExampleDialog
 * @additionalFiles dialog-overview-example-dialog.html
 * @selectorName DialogOverviewExample, DialogOverviewExampleDialog
 */
@Component({
  selector: 'dialog-overview-example',
  templateUrl: 'dialog-overview-example.html',
})
export class DialogOverviewExample {
  constructor(public dialog: MdDialog) {}

  openDialog() {
    this.dialog.open(DialogOverviewExampleDialog);
  }
}


@Component({
  selector: 'dialog-overview-example-dialog',
  templateUrl: 'dialog-overview-example-dialog.html',
})
export class DialogOverviewExampleDialog {}
