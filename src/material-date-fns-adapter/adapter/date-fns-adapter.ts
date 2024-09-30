/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injectable, inject} from '@angular/core';
import {DateAdapter, MAT_DATE_LOCALE} from '@angular/material/core';
import {
  Locale,
  getMonth,
  getYear,
  getDate,
  getDay,
  getHours,
  getMinutes,
  getSeconds,
  set,
  getDaysInMonth,
  formatISO,
  addYears,
  addMonths,
  addDays,
  addSeconds,
  isValid,
  isDate,
  format,
  parseISO,
  parse,
} from 'date-fns';

/** Creates an array and fills it with values. */
function range<T>(length: number, valueFunction: (index: number) => T): T[] {
  const valuesArray = Array(length);
  for (let i = 0; i < length; i++) {
    valuesArray[i] = valueFunction(i);
  }
  return valuesArray;
}

// date-fns doesn't have a way to read/print month names or days of the week directly,
// so we get them by formatting a date with a format that produces the desired month/day.
const MONTH_FORMATS = {
  long: 'LLLL',
  short: 'LLL',
  narrow: 'LLLLL',
};

const DAY_OF_WEEK_FORMATS = {
  long: 'EEEE',
  short: 'EEE',
  narrow: 'EEEEE',
};

/** Adds date-fns support to Angular Material. */
@Injectable()
export class DateFnsAdapter extends DateAdapter<Date, Locale> {
  constructor(...args: unknown[]);

  constructor() {
    super();
    const matDateLocale = inject(MAT_DATE_LOCALE, {optional: true});
    this.setLocale(matDateLocale as Locale);
  }

  getYear(date: Date): number {
    return getYear(date);
  }

  getMonth(date: Date): number {
    return getMonth(date);
  }

  getDate(date: Date): number {
    return getDate(date);
  }

  getDayOfWeek(date: Date): number {
    return getDay(date);
  }

  getMonthNames(style: 'long' | 'short' | 'narrow'): string[] {
    const pattern = MONTH_FORMATS[style];
    return range(12, i => this.format(new Date(2017, i, 1), pattern));
  }

  getDateNames(): string[] {
    const dtf =
      typeof Intl !== 'undefined'
        ? new Intl.DateTimeFormat(this.locale.code, {
            day: 'numeric',
            timeZone: 'utc',
          })
        : null;

    return range(31, i => {
      if (dtf) {
        // date-fns doesn't appear to support this functionality.
        // Fall back to `Intl` on supported browsers.
        const date = new Date();
        date.setUTCFullYear(2017, 0, i + 1);
        date.setUTCHours(0, 0, 0, 0);
        return dtf.format(date).replace(/[\u200e\u200f]/g, '');
      }

      return i + '';
    });
  }

  getDayOfWeekNames(style: 'long' | 'short' | 'narrow'): string[] {
    const pattern = DAY_OF_WEEK_FORMATS[style];
    return range(7, i => this.format(new Date(2017, 0, i + 1), pattern));
  }

  getYearName(date: Date): string {
    return this.format(date, 'y');
  }

  getFirstDayOfWeek(): number {
    return this.locale.options?.weekStartsOn ?? 0;
  }

  getNumDaysInMonth(date: Date): number {
    return getDaysInMonth(date);
  }

  clone(date: Date): Date {
    return new Date(date.getTime());
  }

  createDate(year: number, month: number, date: number): Date {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      // Check for invalid month and date (except upper bound on date which we have to check after
      // creating the Date).
      if (month < 0 || month > 11) {
        throw Error(`Invalid month index "${month}". Month index has to be between 0 and 11.`);
      }

      if (date < 1) {
        throw Error(`Invalid date "${date}". Date has to be greater than 0.`);
      }
    }

    // Passing the year to the constructor causes year numbers <100 to be converted to 19xx.
    // To work around this we use `setFullYear` and `setHours` instead.
    const result = new Date();
    result.setFullYear(year, month, date);
    result.setHours(0, 0, 0, 0);

    // Check that the date wasn't above the upper bound for the month, causing the month to overflow
    if (result.getMonth() != month && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      throw Error(`Invalid date "${date}" for month with index "${month}".`);
    }

    return result;
  }

  today(): Date {
    return new Date();
  }

  parse(value: any, parseFormat: string | string[]): Date | null {
    if (typeof value == 'string' && value.length > 0) {
      const iso8601Date = parseISO(value);

      if (this.isValid(iso8601Date)) {
        return iso8601Date;
      }

      const formats = Array.isArray(parseFormat) ? parseFormat : [parseFormat];

      if (!parseFormat.length) {
        throw Error('Formats array must not be empty.');
      }

      for (const currentFormat of formats) {
        const fromFormat = parse(value, currentFormat, new Date(), {locale: this.locale});

        if (this.isValid(fromFormat)) {
          return fromFormat;
        }
      }

      return this.invalid();
    } else if (typeof value === 'number') {
      return new Date(value);
    } else if (value instanceof Date) {
      return this.clone(value);
    }

    return null;
  }

  format(date: Date, displayFormat: string): string {
    if (!this.isValid(date)) {
      throw Error('DateFnsAdapter: Cannot format invalid date.');
    }

    return format(date, displayFormat, {locale: this.locale});
  }

  addCalendarYears(date: Date, years: number): Date {
    return addYears(date, years);
  }

  addCalendarMonths(date: Date, months: number): Date {
    return addMonths(date, months);
  }

  addCalendarDays(date: Date, days: number): Date {
    return addDays(date, days);
  }

  toIso8601(date: Date): string {
    return formatISO(date, {representation: 'date'});
  }

  /**
   * Returns the given value if given a valid Date or null. Deserializes valid ISO 8601 strings
   * (https://www.ietf.org/rfc/rfc3339.txt) into valid Dates and empty string into null. Returns an
   * invalid date for all other values.
   */
  override deserialize(value: any): Date | null {
    if (typeof value === 'string') {
      if (!value) {
        return null;
      }
      const date = parseISO(value);
      if (this.isValid(date)) {
        return date;
      }
    }
    return super.deserialize(value);
  }

  isDateInstance(obj: any): boolean {
    return isDate(obj);
  }

  isValid(date: Date): boolean {
    return isValid(date);
  }

  invalid(): Date {
    return new Date(NaN);
  }

  override setTime(target: Date, hours: number, minutes: number, seconds: number): Date {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      if (hours < 0 || hours > 23) {
        throw Error(`Invalid hours "${hours}". Hours value must be between 0 and 23.`);
      }

      if (minutes < 0 || minutes > 59) {
        throw Error(`Invalid minutes "${minutes}". Minutes value must be between 0 and 59.`);
      }

      if (seconds < 0 || seconds > 59) {
        throw Error(`Invalid seconds "${seconds}". Seconds value must be between 0 and 59.`);
      }
    }

    return set(this.clone(target), {hours, minutes, seconds, milliseconds: 0});
  }

  override getHours(date: Date): number {
    return getHours(date);
  }

  override getMinutes(date: Date): number {
    return getMinutes(date);
  }

  override getSeconds(date: Date): number {
    return getSeconds(date);
  }

  override parseTime(value: any, parseFormat: string | string[]): Date | null {
    return this.parse(value, parseFormat);
  }

  override addSeconds(date: Date, amount: number): Date {
    return addSeconds(date, amount);
  }
}
