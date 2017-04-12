import {Component} from '@angular/core';
import {MdSnackBar, MdSnackBarRef} from '@angular/material';


@Component({
  selector: 'snack-bar-multiple-actions-example',
  templateUrl: './snack-bar-multiple-actions-example.html',
})
export class SnackBarMultipleActionsExample {
  constructor(public snackBar: MdSnackBar) {}

  openSnackBar() {
    let snackBarRef = this.snackBar.openFromComponent(MultipleActionsComponent, {
      duration: 1000,
    });

    snackBarRef.instance.actions = ['Action One', 'Action Two'];
    snackBarRef.instance.snackBarRef = snackBarRef;

    snackBarRef.onAction().subscribe(result => {
      this.snackBar.open(`User picked ${result}!`);
    });
  }
}


@Component({
  selector: 'snack-bar-multiple-actions-example-snack',
  template: `
    <span class="snack-message">Pick one!</span>
    <span *ngFor="let action of actions" (click)="dismiss(action)">{{action}}</span>
  `,
  styleUrls: ['./snack-bar-multiple-actions-example-snack.css'],
})
export class MultipleActionsComponent {
  actions: string[];

  snackBarRef: MdSnackBarRef<MultipleActionsComponent>;

  dismiss(action: string): void {
    this.snackBarRef._action(action);
  }
}
