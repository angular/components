/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, computed, signal} from '@angular/core';
import {
  SpinButton,
  SpinButtonDecrement,
  SpinButtonGroup,
  SpinButtonIncrement,
  SpinButtonInput,
} from '@angular/aria/spinbutton';

/**
 * @title APG quantity picker
 */
@Component({
  selector: 'spinbutton-apg-quantity-example',
  templateUrl: 'spinbutton-apg-quantity-example.html',
  styleUrl: '../spinbutton-examples.css',
  imports: [SpinButtonGroup, SpinButton, SpinButtonInput, SpinButtonIncrement, SpinButtonDecrement],
})
export class SpinbuttonApgQuantityExample {
  adultCount = signal(1);
  kidCount = signal(0);
  animalCount = signal(0);

  summary = computed(() => {
    const adults = this.adultCount();
    const kids = this.kidCount();
    const animals = this.animalCount();
    return `${adults} adult${adults !== 1 ? 's' : ''}, ${kids} kid${kids !== 1 ? 's' : ''}, ${animals} animal${animals !== 1 ? 's' : ''}`;
  });

  onBeforeInput(event: InputEvent): void {
    if (event.data && !/^\d$/.test(event.data)) {
      event.preventDefault();
    }
  }
}
