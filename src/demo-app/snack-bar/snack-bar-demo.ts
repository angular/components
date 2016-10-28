import {Component, ViewContainerRef} from '@angular/core';
import {MdSnackBar, MdSnackBarConfig} from '@angular/material';

@Component({
  moduleId: module.id,
  selector: 'snack-bar-demo',
  templateUrl: 'snack-bar-demo.html',
})
export class SnackBarDemo {
  message: string = 'Snack Bar opened.';
  actionButtonLabel: string = 'Retry';
  action: boolean = false;
  autoHide: boolean = false;
  autoHideMs: number | boolean;

  constructor(
      public snackBar: MdSnackBar,
      public viewContainerRef: ViewContainerRef) { }

  open() {
    let autoHide: number | boolean = false;
    if(this.autoHide) {
      autoHide = this.autoHideMs
    }
    let config = new MdSnackBarConfig(this.viewContainerRef, autoHide);
    this.snackBar.open(this.message, this.action && this.actionButtonLabel, config);
  }
}
