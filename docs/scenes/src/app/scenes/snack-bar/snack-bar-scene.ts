/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, ViewEncapsulation, inject} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-snack-bar-scene',
  template: '<div class="docs-scene-snackbar-background"></div>',
  styleUrls: ['./snack-bar-scene.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SnackBarScene {
  constructor() {
    const snackbar = inject(MatSnackBar);

    snackbar.open('Message archived', 'Undo');
  }
}
