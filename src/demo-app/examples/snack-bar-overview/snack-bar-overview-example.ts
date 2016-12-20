import {Component} from '@angular/core';
import {MdSnackBar} from '@angular/material';


@Component({
  moduleId: module.id,
  selector: 'snack-bar-overview-example',
  template: '',
})
export class SnackBarOverviewExample {
  constructor(snackBar: MdSnackBar) {
    snackBar.open('Here\'s a tasty snack!', 'Nom');
  }
}
