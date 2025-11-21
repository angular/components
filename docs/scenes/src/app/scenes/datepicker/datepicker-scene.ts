/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, ViewEncapsulation} from '@angular/core';
import {MatDatepickerModule} from '@angular/material/datepicker';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-datepicker-scene',
  templateUrl: './datepicker-scene.html',
  styleUrls: ['./datepicker-scene.scss'],
  imports: [MatDatepickerModule],
})
export class DatepickerScene {
  minDate = new Date(2024, 3, 2);
  selectedDate = new Date(2024, 3, 3);
  maxDate = new Date(2024, 3, 5);
}
