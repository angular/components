/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy, Component} from '@angular/core';
import {FormControl} from '@angular/forms';
import {MatDatepickerInputEvent, MatDatePickerRangeValue} from '@angular/material/datepicker';


@Component({
  moduleId: module.id,
  selector: 'datepicker-demo',
  templateUrl: 'datepicker-demo.html',
  styleUrls: ['datepicker-demo.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatepickerDemo {
  touch: boolean;
  filterOdd: boolean;
  yearView: boolean;
  inputDisabled: boolean;
  datepickerDisabled: boolean;
  rangeEnabled: boolean;
  minDate: Date;
  maxDate: Date;
  startAt: Date;
  date: Date;
  lastDateInput: MatDatePickerRangeValue<Date>|Date | null;
  lastDateChange: MatDatePickerRangeValue<Date>|Date | null;
  dateRange: MatDatePickerRangeValue<Date>;
  dateFilter = (date: Date) => date.getMonth() % 2 == 1 && date.getDate() % 2 == 0;

  onDateInput = (e: MatDatepickerInputEvent<Date>) => this.lastDateInput = <Date>e.value;
  onDateChange = (e: MatDatepickerInputEvent<Date>) => this.lastDateChange = <Date>e.value;

  dateCtrl = new FormControl();
  changeRange(dates: MatDatePickerRangeValue<Date>) {
    this.dateRange = dates;
  }
}
