/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy, Component, Directive} from '@angular/core';
import {FormControl} from '@angular/forms';
import {MatDatepicker, MatDatepickerInputEvent} from '@angular/material';
import {MomentDateAdapter} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';

import * as _moment from 'moment';
import {default as _rollupMoment, Moment} from 'moment';
const moment = _rollupMoment || _moment;

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

  monthYearDateControl = new FormControl(moment([2017, 10, 25]));
  yearDateControl = new FormControl(moment([2017, 10, 25]));

  dateCtrl = new FormControl();

  dateFilter =
      (date: Date) => !(date.getFullYear() % 2) && (date.getMonth() % 2) && !(date.getDate() % 2)

  onDateInput = (e: MatDatepickerInputEvent<Date>) => this.lastDateInput = e.value;
  onDateChange = (e: MatDatepickerInputEvent<Date>) => this.lastDateChange = e.value;

  chosenYearHandler(normalizedYear: Moment, datepicker: MatDatepicker<Moment>) {
    const actualDate = this.yearDateControl.value;
    actualDate.year(normalizedYear.year());
    this.yearDateControl.setValue(actualDate);
    datepicker.close();
  }

  chosenYearFromYearMonthHandler(normalizedYear: Moment) {
    const actualDate = this.monthYearDateControl.value;
    actualDate.year(normalizedYear.year());
    this.monthYearDateControl.setValue(actualDate);
  }

  chosenMonthFromYearMonthHandler(normalizedMonth: Moment, datepicker: MatDatepicker<Moment>) {
    const actualDate = this.monthYearDateControl.value;
    actualDate.month(normalizedMonth.month());
    this.monthYearDateControl.setValue(actualDate);
    datepicker.close();
  }
}

export const DEMO_MOMENT_MONTH_YEAR_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Directive({
  selector: '[demo-moment-month-year]',
  providers: [
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: DEMO_MOMENT_MONTH_YEAR_FORMATS},
  ]
})
export class DemoMomentMonthYearDirective { }

export const DEMO_MOMENT_YEAR_FORMATS = {
  parse: {
    dateInput: 'YYYY',
  },
  display: {
    dateInput: 'YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Directive({
  selector: '[demo-moment-year]',
  providers: [
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: DEMO_MOMENT_YEAR_FORMATS},
  ]
})
export class DemoMomentYearDirective { }
