/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, signal} from '@angular/core';
import {
  SpinButton,
  SpinButtonDecrement,
  SpinButtonGroup,
  SpinButtonIncrement,
  SpinButtonInput,
} from '@angular/aria/spinbutton';

/**
 * @title Basic spinbutton
 */
@Component({
  selector: 'spinbutton-basic-example',
  templateUrl: 'spinbutton-basic-example.html',
  styleUrl: '../spinbutton-examples.css',
  imports: [SpinButtonGroup, SpinButton, SpinButtonInput, SpinButtonIncrement, SpinButtonDecrement],
})
export class SpinbuttonBasicExample {
  count = signal(0);

  onBeforeInput(event: InputEvent): void {
    if (event.data && !/^[\d\-.]$/.test(event.data)) {
      event.preventDefault();
    }
  }
}
