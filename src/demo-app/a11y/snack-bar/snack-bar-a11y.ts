import {Component} from '@angular/core';
import {MdSnackBar} from '@angular/material';

@Component({
  moduleId: module.id,
  selector: 'snack-bar-a11y',
  templateUrl: 'snack-bar-a11y.html',
})
export class SnackBarAccessibilityDemo {
  constructor(private snackBar: MdSnackBar) {}

  openDiscoPartySnackBar() {
    this.snackBar.open('Disco party!', 'Dismiss', {duration: 5000});
  }

  openPizzaPartySnackBar() {
    this.snackBar.openFromComponent(SnackBarPizzaPartyDemo, {duration: 5000});
  }

  openNotificationSnackBar() {
    this.snackBar.open('Thank you for your support!', '', {duration: 2000});
  }
}

@Component({
  selector: 'snack-bar-component-example-snack',
  template: `<span class="example-pizza-party">
               🍕 Pizza party!!! 
             </span>`,
  styles: [`.example-pizza-party { color: pink; }`]
})
export class SnackBarPizzaPartyDemo {}
