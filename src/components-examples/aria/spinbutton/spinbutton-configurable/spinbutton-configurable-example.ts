/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, signal} from '@angular/core';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {
  SpinButton,
  SpinButtonDecrement,
  SpinButtonGroup,
  SpinButtonIncrement,
  SpinButtonInput,
} from '@angular/aria/spinbutton';

/**
 * @title Configurable spinbutton
 */
@Component({
  selector: 'spinbutton-configurable-example',
  templateUrl: 'spinbutton-configurable-example.html',
  styleUrl: '../spinbutton-examples.css',
  imports: [
    ReactiveFormsModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    SpinButtonGroup,
    SpinButton,
    SpinButtonInput,
    SpinButtonIncrement,
    SpinButtonDecrement,
  ],
})
export class SpinbuttonConfigurableExample {
  value = signal(50);

  min = new FormControl(0, {nonNullable: true});
  max = new FormControl(100, {nonNullable: true});
  step = new FormControl(1, {nonNullable: true});
  disabled = new FormControl(false, {nonNullable: true});
  readonly = new FormControl(false, {nonNullable: true});
  wrap = new FormControl(false, {nonNullable: true});

  onBeforeInput(event: InputEvent): void {
    if (event.data && !/^[\d\-.]$/.test(event.data)) {
      event.preventDefault();
    }
  }
}
