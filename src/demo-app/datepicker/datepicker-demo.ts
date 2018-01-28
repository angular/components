/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy, Component} from '@angular/core';
import {FormControl} from '@angular/forms';
import {MatDatepicker, MatDatepickerInputEvent} from '@angular/material/datepicker';


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
  minDate: Date;
  maxDate: Date;
  startAt: Date;
  date: Date;
  lastDateInput: Date | null;
  lastDateChange: Date | null;
  year: number;
  yearMonth = '';

  dateFilter =
      (date: Date) => !(date.getFullYear() % 2) && (date.getMonth() % 2) && !(date.getDate() % 2)

  onDateInput = (e: MatDatepickerInputEvent<Date>) => this.lastDateInput = e.value;
  onDateChange = (e: MatDatepickerInputEvent<Date>) => this.lastDateChange = e.value;

  dateCtrl = new FormControl();

  constructor() {
    const date = new Date();
    this.year = date.getFullYear();
    this.yearMonth = (date.getMonth() + 1) + '/' + date.getFullYear();
  }

  chosenYearHandler(year: number, datepicker: MatDatepicker<Date>) {
    this.year = year;
    datepicker.close();
  }

  _open(event: Event, datepicker: MatDatepicker<Date>) {
    datepicker.open();
    event.stopPropagation();
  }

  chosenYearFromYearMonthHandler(year: number) {
    try {
      const month = this.yearMonth.split('/')[0];
      this.yearMonth = month + '/' + year;
    } catch (e) { throw new Error('Date must be in mm/yyyy format'); }
  }

  chosenMonthFromYearMonthHandler(month: number, datepicker: MatDatepicker<Date>) {
    try {
      const year = this.yearMonth.split('/')[1];
      this.yearMonth = (month + 1) + '/' + year;
    } catch (e) { throw new Error('Date must be in mm/yyyy format'); }
    datepicker.close();
  }
}
