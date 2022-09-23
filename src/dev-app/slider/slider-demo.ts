/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatSliderModule} from '@angular/material/slider';
import {MatTabsModule} from '@angular/material/tabs';
import {MatButtonToggleModule} from '@angular/material/button-toggle';

@Component({
  selector: 'slider-demo',
  templateUrl: 'slider-demo.html',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonToggleModule,
    MatSliderModule,
    MatTabsModule,
    ReactiveFormsModule,
  ],
})
export class SliderDemo {
  colorModel: string = 'primary';

  noop = () => {};
  min: string = '0';
  max: string = '100';
  step: string = '0';
  value: string = '0';
  disabled: boolean = false;

  twoWayValue: string = '0';

  minModel: number = 0;
  maxModel: number = 100;
  valueModel: number = 0;
  stepModel: number = 0;
  disabledModel: boolean = false;

  control = new FormControl('0');

  updateTwoWayValue(input: EventTarget | null): void {
    if (!input) {
      return;
    }
    this.twoWayValue = (input as HTMLInputElement).value;
  }
  updateValue(input: EventTarget | null): void {
    if (!input) {
      return;
    }
    this.value = (input as HTMLInputElement).value;
  }
  updateMin(input: EventTarget | null): void {
    if (!input) {
      return;
    }
    this.min = (input as HTMLInputElement).value;
  }
  updateMax(input: EventTarget | null): void {
    if (!input) {
      return;
    }
    this.max = (input as HTMLInputElement).value;
  }
  updateStep(input: EventTarget | null): void {
    if (!input) {
      return;
    }
    this.step = (input as HTMLInputElement).value;
  }
  updateDisabledState(input: EventTarget | null): void {
    if (!input) {
      return;
    }
    this.disabled = (input as HTMLInputElement).checked;
  }
  updateControlValue(input: EventTarget | null): void {
    if (!input) {
      return;
    }
    this.control.setValue((input as HTMLInputElement).value);
  }
  updateControlDisabledState(input: EventTarget | null): void {
    if (!input) {
      return;
    }
    (input as HTMLInputElement).checked ? this.control.disable() : this.control.enable();
  }
}
