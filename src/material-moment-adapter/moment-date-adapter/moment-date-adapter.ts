/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Inject, Injectable, LOCALE_ID, Optional} from '@angular/core';
import {DateAdapter} from '@angular/material';
import * as moment from 'moment';


/** Creates an array and fills it with values. */
function range<T>(length: number, valueFunction: (index: number) => T): T[] {
  const valuesArray = Array(length);
  for (let i = 0; i < length; i++) {
    valuesArray[i] = valueFunction(i);
  }
  return valuesArray;
}


/** Adapts Moment.js Dates for use with Angular Material. */
@Injectable()
export class MomentDateAdapter extends DateAdapter<moment.Moment> {
  private _localeNames: {
    longMonths: string[],
    shortMonths: string[],
    dates: string[],
    longDaysOfWeek: string[],
    shortDaysOfWeek: string[],
    narrowDaysOfWeek: string[]
  };

  constructor(@Optional() @Inject(LOCALE_ID) localeId: any) {
    super();
    this.setLocale(localeId || moment.locale());
  }

  setLocale(locale: any) {
    super.setLocale(locale);

    // Temporarily change the global locale to get the data we need, then change it back.
    let globalLocale = moment.locale();
    moment.locale(locale);
    this._localeNames = {
      longMonths: moment.months(),
      shortMonths: moment.months(),
      dates: range(31, (i) => this.createDate(2017, 0, i).format('DD')),
      longDaysOfWeek: moment.weekdays(true),
      shortDaysOfWeek: moment.weekdaysShort(true),
      narrowDaysOfWeek: moment.weekdaysMin(true),
    };
    moment.locale(globalLocale);
  }

  getYear(date: moment.Moment): number {
    return date.year();
  }

  getMonth(date: moment.Moment): number {
    return date.month();
  }

  getDate(date: moment.Moment): number {
    return date.date();
  }

  getDayOfWeek(date: moment.Moment): number {
    return date.weekday();
  }

  getMonthNames(style: 'long' | 'short' | 'narrow'): string[] {
    return style == 'long' ? this._localeNames.longMonths : this._localeNames.shortMonths;
  }

  getDateNames(): string[] {
    return this._localeNames.dates;
  }

  getDayOfWeekNames(style: 'long' | 'short' | 'narrow'): string[] {
    if (style == 'long') {
      return this._localeNames.longDaysOfWeek;
    }
    if (style == 'short') {
      return this._localeNames.shortDaysOfWeek;
    }
    return this._localeNames.narrowDaysOfWeek;
  }

  getYearName(date: moment.Moment): string {
    return date.format('YYYY');
  }

  getFirstDayOfWeek(): number {
    // Moment's `weekday` method uses the current locale's ordering, so this will always be 0.
    return 0;
  }

  getNumDaysInMonth(date: moment.Moment): number {
    return date.daysInMonth();
  }

  clone(date: moment.Moment): moment.Moment {
    return date.clone();
  }

  createDate(year: number, month: number, date: number): moment.Moment {
    return moment({year, month, date});
  }

  today(): moment.Moment {
    return moment();
  }

  parse(value: any, parseFormat: string | string[]): moment.Moment | null {
    if (typeof value == 'string') {
      return moment(value, parseFormat, this.locale);
    }
    return value ? moment(value) : null;
  }

  format(date: moment.Moment, displayFormat: string): string {
    if (!this.isValid(date)) {
      throw Error('MomentDateAdapter: Cannot format invalid date.');
    }
    return date.format(displayFormat);
  }

  addCalendarYears(date: moment.Moment, years: number): moment.Moment {
    return date.clone().add({years});
  }

  addCalendarMonths(date: moment.Moment, months: number): moment.Moment {
    return date.clone().add({months});
  }

  addCalendarDays(date: moment.Moment, days: number): moment.Moment {
    return date.clone().add({days});
  }

  getISODateString(date: moment.Moment): string {
    return date.format();
  }

  isDateInstance(obj: any): boolean {
    return moment.isMoment(obj);
  }

  isValid(date: moment.Moment): boolean {
    return date.isValid();
  }
}
