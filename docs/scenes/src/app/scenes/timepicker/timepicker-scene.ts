/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AfterViewInit, Component, viewChild, ViewEncapsulation} from '@angular/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatTimepickerModule, MatTimepicker} from '@angular/material/timepicker';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-timepicker-scene',
  templateUrl: './timepicker-scene.html',
  styleUrls: ['./timepicker-scene.scss'],
  imports: [MatTimepickerModule, MatFormFieldModule, MatInputModule],
})
export class TimepickerScene implements AfterViewInit {
  value = new Date(2024, 0, 0, 0, 30, 0);
  readonly timepicker = viewChild.required(MatTimepicker);

  ngAfterViewInit() {
    this.timepicker().open();
  }
}
