import {Component, inject, signal} from '@angular/core';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import {MatButtonModule} from '@angular/material/button';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';

/**
 * @title Snack-bar with configurable position
 */
@Component({
  selector: 'snack-bar-position-example',
  templateUrl: 'snack-bar-position-example.html',
  styleUrl: 'snack-bar-position-example.css',
  imports: [MatFormFieldModule, MatSelectModule, MatButtonModule],
})
export class SnackBarPositionExample {
  private _snackBar = inject(MatSnackBar);

  horizontalPosition = signal<MatSnackBarHorizontalPosition>('start');
  verticalPosition = signal<MatSnackBarVerticalPosition>('bottom');

  openSnackBar() {
    this._snackBar.open('Cannonball!!', 'Splash', {
      horizontalPosition: this.horizontalPosition(),
      verticalPosition: this.verticalPosition(),
    });
  }
}
