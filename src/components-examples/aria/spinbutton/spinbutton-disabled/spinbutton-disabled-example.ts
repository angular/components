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
 * @title Disabled spinbutton
 */
@Component({
  selector: 'spinbutton-disabled-example',
  templateUrl: 'spinbutton-disabled-example.html',
  styleUrl: '../spinbutton-examples.css',
  imports: [SpinButtonGroup, SpinButton, SpinButtonInput, SpinButtonIncrement, SpinButtonDecrement],
})
export class SpinbuttonDisabledExample {
  count = signal(5);
}
