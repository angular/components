/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Inject} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatSliderModule} from '@angular/material/slider';
import {MatTabsModule} from '@angular/material/tabs';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {ThemePalette} from '@angular/material/core';

interface DialogData {
  color: ThemePalette;
  discrete: boolean;
  showTickMarks: boolean;
}

@Component({
  selector: 'slider-demo',
  templateUrl: 'slider-demo.html',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    MatSliderModule,
    MatTabsModule,
    ReactiveFormsModule,
  ],
  styleUrl: 'slider-demo.css',
})
export class SliderDemo {
  discrete = true;
  showTickMarks = true;
  colorModel: ThemePalette = 'primary';

  noop = () => {};
  min = '0';
  max = '100';
  step = '0';
  value = '0';
  disabled = false;

  twoWayValue = 0;

  minModel = 0;
  maxModel = 100;
  valueModel = 0;
  stepModel = 0;
  disabledModel = false;

  control = new FormControl('0');

  constructor(public dialog: MatDialog) {}

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
  openDialog() {
    this.dialog.open(SliderDialogDemo, {
      data: {
        color: this.colorModel,
        discrete: this.discrete,
        showTickMarks: this.showTickMarks,
      },
    });
  }
}

@Component({
  selector: 'slider-dialog-demo',
  styleUrl: 'slider-demo.css',
  template: `
  <h2 mat-dialog-title>Slider in a dialog</h2>
  <mat-dialog-content class="demo-dialog-content">
  <mat-slider [discrete]="this.data.discrete" [showTickMarks]="this.data.showTickMarks" [color]="this.data.color" step="10">
      <input value="50" matSliderThumb>
    </mat-slider>
    <mat-slider [discrete]="this.data.discrete" [showTickMarks]="this.data.showTickMarks" [color]="this.data.color" step="10">
      <input value="30" matSliderStartThumb>
      <input value="70" matSliderEndThumb>
    </mat-slider>
  </mat-dialog-content>
  `,
  standalone: true,
  imports: [MatSliderModule, MatDialogTitle, MatDialogContent],
})
export class SliderDialogDemo {
  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {}
}
