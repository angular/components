import {Component} from '@angular/core';
import {MdDialog} from '@angular/material';


@Component({
  moduleId: module.id,
  selector: 'dialog-overview-example',
  template: '',
})
export class DialogOverviewExample {
  constructor(dialog: MdDialog) {
    dialog.open(DialogOverviewExampleDialog);
  }
}


@Component({
  moduleId: module.id,
  selector: 'dialog-overview-example-dialog',
  templateUrl: 'dialog-overview-example-dialog.html',
})
export class DialogOverviewExampleDialog {}
