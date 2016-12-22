import {Component, ViewEncapsulation} from '@angular/core';
import {MdSnackBar} from '@angular/material';


@Component({
  selector: 'snack-bar-component-example',
  template: '',
})
export class SnackBarComponentExample {
  constructor(snackBar: MdSnackBar) {
    snackBar.openFromComponent(SnackBarComponentExampleSnack);
  }
}


@Component({
  selector: 'snack-bar-component-example-snack',
  templateUrl: './snack-bar-component-example-snack.html',
  styleUrls: ['./snack-bar-component-example-snack.css'],
  host: {
    'class': 'example-snack',
  },
  encapsulation: ViewEncapsulation.None,
})
export class SnackBarComponentExampleSnack {}
