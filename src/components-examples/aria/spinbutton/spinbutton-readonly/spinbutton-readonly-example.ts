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
 * @title Readonly spinbutton
 */
@Component({
  selector: 'spinbutton-readonly-example',
  templateUrl: 'spinbutton-readonly-example.html',
  styleUrl: '../spinbutton-examples.css',
  imports: [SpinButtonGroup, SpinButton, SpinButtonInput, SpinButtonIncrement, SpinButtonDecrement],
})
export class SpinbuttonReadonlyExample {
  count = signal(5);
}
