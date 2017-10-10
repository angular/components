/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';

/**
 * @title Datepicker start date
 */
@Component({
  selector: 'datepicker-start-view-example',
  templateUrl: 'datepicker-start-view-example.html',
  styleUrls: ['datepicker-start-view-example.css'],
})
export class DatepickerStartViewExample {
  startDate = new Date(1990, 0, 1);
}
