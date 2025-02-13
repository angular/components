import {Component, ViewEncapsulation, inject} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-snack-bar-scene',
  template: '<div class="docs-scene-snackbar-background"></div>',
  styleUrls: ['./snack-bar-scene.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
})
export class SnackBarScene {
  constructor() {
    const snackbar = inject(MatSnackBar);

    snackbar.open('Message archived', 'Undo');
  }
}
