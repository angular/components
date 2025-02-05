/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {inject, Injectable} from '@angular/core';
import {DateAdapter, MAT_DATE_LOCALE} from './date-adapter';

/**
 * Matches strings that have the form of a valid RFC 3339 string
 * (https://tools.ietf.org/html/rfc3339). Note that the string may not actually be a valid date
 * because the regex will match strings with an out of bounds month, date, etc.
 */
const ISO_8601_REGEX =
  /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|(?:(?:\+|-)\d{2}:\d{2}))?)?$/;

/**
 * Matches a time string. Supported formats:
 * - {{hours}}:{{minutes}}
 * - {{hours}}:{{minutes}}:{{seconds}}
 * - {{hours}}:{{minutes}} AM/PM
 * - {{hours}}:{{minutes}}:{{seconds}} AM/PM
 * - {{hours}}.{{minutes}}
 * - {{hours}}.{{minutes}}.{{seconds}}
 * - {{hours}}.{{minutes}} AM/PM
 * - {{hours}}.{{minutes}}.{{seconds}} AM/PM
 */
const TIME_REGEX = /^(\d?\d)[:.](\d?\d)(?:[:.](\d?\d))?\s*(AM|PM)?$/i;

const DATE_COMPONENT_SEPARATOR_REGEX = /[ \/.:,'"|\\_-]+/;

/** Creates an array and fills it with values. */
function range<T>(length: number, valueFunction: (index: number) => T): T[] {
  const valuesArray = Array(length);
  for (let i = 0; i < length; i++) {
    valuesArray[i] = valueFunction(i);
  }
  return valuesArray;
}

/** Adapts the native JS Date for use with cdk-based components that work with dates. */
@Injectable()
export class NativeDateAdapter extends DateAdapter<Date> {
  /**
   * @deprecated No longer being used. To be removed.
   * @breaking-change 14.0.0
   */
  useUtcForDisplay: boolean = false;

  /** The injected locale. */
  private readonly _matDateLocale = inject(MAT_DATE_LOCALE, {optional: true});

  constructor(...args: unknown[]);

  constructor() {
    super();

    const matDateLocale = inject(MAT_DATE_LOCALE, {optional: true});

    if (matDateLocale !== undefined) {
      this._matDateLocale = matDateLocale;
    }

    super.setLocale(this._matDateLocale);
  }

  getYear(date: Date): number {
    return date.getFullYear();
  }

  getMonth(date: Date): number {
    return date.getMonth();
  }

  getDate(date: Date): number {
    return date.getDate();
  }

  getDayOfWeek(date: Date): number {
    return date.getDay();
  }

  getMonthNames(style: 'long' | 'short' | 'narrow'): string[] {
    const dtf = new Intl.DateTimeFormat(this.locale, {month: style, timeZone: 'utc'});
    return range(12, i => this._format(dtf, new Date(2017, i, 1)));
  }

  getDateNames(): string[] {
    const dtf = new Intl.DateTimeFormat(this.locale, {day: 'numeric', timeZone: 'utc'});
    return range(31, i => this._format(dtf, new Date(2017, 0, i + 1)));
  }

  getDayOfWeekNames(style: 'long' | 'short' | 'narrow'): string[] {
    const dtf = new Intl.DateTimeFormat(this.locale, {weekday: style, timeZone: 'utc'});
    return range(7, i => this._format(dtf, new Date(2017, 0, i + 1)));
  }

  getYearName(date: Date): string {
    const dtf = new Intl.DateTimeFormat(this.locale, {year: 'numeric', timeZone: 'utc'});
    return this._format(dtf, date);
  }

  getFirstDayOfWeek(): number {
    // At the time of writing `Intl.Locale` isn't available
    // in the internal types so we need to cast to `any`.
    if (typeof Intl !== 'undefined' && (Intl as any).Locale) {
      const locale = new (Intl as any).Locale(this.locale) as {
        getWeekInfo?: () => {firstDay: number};
        weekInfo?: {firstDay: number};
      };

      // Some browsers implement a `getWeekInfo` method while others have a `weekInfo` getter.
      // Note that this isn't supported in all browsers so we need to null check it.
      const firstDay = (locale.getWeekInfo?.() || locale.weekInfo)?.firstDay ?? 0;

      // `weekInfo.firstDay` is a number between 1 and 7 where, starting from Monday,
      // whereas our representation is 0 to 6 where 0 is Sunday so we need to normalize it.
      return firstDay === 7 ? 0 : firstDay;
    }

    // Default to Sunday if the browser doesn't provide the week information.
    return 0;
  }

  getNumDaysInMonth(date: Date): number {
    return this.getDate(
      this._createDateWithOverflow(this.getYear(date), this.getMonth(date) + 1, 0),
    );
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

    let result = this._createDateWithOverflow(year, month, date);
    // Check that the date wasn't above the upper bound for the month, causing the month to overflow
    if (result.getMonth() !== month && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      throw Error(`Invalid date "${date}" for month with index "${month}".`);
    }

    return result;
  }

  today(): Date {
    return new Date();
  }

  parse(value: any, parseFormat?: any): Date | null {
    // We have no way using the native JS Date to set the parse format or locale, so we ignore these
    // parameters.
    if (typeof value == 'number') {
      return new Date(value);
    }

    if (!value) {
      return null;
    }

    if (typeof value !== 'string') {
      return new Date(value);
    }

    const dateParts = value
      .trim()
      .split(DATE_COMPONENT_SEPARATOR_REGEX)
      .map(part => parseInt(part, 10))
      .filter(part => !isNaN(part));

    if (dateParts.length < 2) {
      return this.invalid();
    }

    const localeFormatParts = Intl.DateTimeFormat(this.locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts();

    let year: number | null = null;
    let month: number | null = null;
    let day: number | null = null;

    const valueHasYear = dateParts.length > 2;

    if (!valueHasYear) {
      // Year is implied to be current year if only 2 date components are given.
      year = new Date().getFullYear();
    }

    let parsedPartIndex = 0;

    for (const part of localeFormatParts) {
      switch (part.type) {
        case 'year':
          if (valueHasYear) {
            year = dateParts[parsedPartIndex++];
          }
          break;
        case 'month':
          month = dateParts[parsedPartIndex++] - 1;
          break;
        case 'day':
          day = dateParts[parsedPartIndex++];
          break;
      }
    }

    if (year !== null && month !== null && day !== null) {
      const date = this.createDate(year, month, day);

      if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
        return date;
      }

      return this.invalid();
    }

    return this._nativeParseFallback(value);
  }

  format(date: Date, displayFormat: Object): string {
    if (!this.isValid(date)) {
      throw Error('NativeDateAdapter: Cannot format invalid date.');
    }

    const dtf = new Intl.DateTimeFormat(this.locale, {...displayFormat, timeZone: 'utc'});
    return this._format(dtf, date);
  }

  addCalendarYears(date: Date, years: number): Date {
    return this.addCalendarMonths(date, years * 12);
  }

  addCalendarMonths(date: Date, months: number): Date {
    let newDate = this._createDateWithOverflow(
      this.getYear(date),
      this.getMonth(date) + months,
      this.getDate(date),
    );

    // It's possible to wind up in the wrong month if the original month has more days than the new
    // month. In this case we want to go to the last day of the desired month.
    // Note: the additional + 12 % 12 ensures we end up with a positive number, since JS % doesn't
    // guarantee this.
    if (this.getMonth(newDate) != (((this.getMonth(date) + months) % 12) + 12) % 12) {
      newDate = this._createDateWithOverflow(this.getYear(newDate), this.getMonth(newDate), 0);
    }

    return newDate;
  }

  addCalendarDays(date: Date, days: number): Date {
    return this._createDateWithOverflow(
      this.getYear(date),
      this.getMonth(date),
      this.getDate(date) + days,
    );
  }

  toIso8601(date: Date): string {
    return [
      date.getUTCFullYear(),
      this._2digit(date.getUTCMonth() + 1),
      this._2digit(date.getUTCDate()),
    ].join('-');
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
      // The `Date` constructor accepts formats other than ISO 8601, so we need to make sure the
      // string is the right format first.
      if (ISO_8601_REGEX.test(value)) {
        let date = new Date(value);
        if (this.isValid(date)) {
          return date;
        }
      }
    }
    return super.deserialize(value);
  }

  isDateInstance(obj: any) {
    return obj instanceof Date;
  }

  isValid(date: Date) {
    return !isNaN(date.getTime());
  }

  invalid(): Date {
    return new Date(NaN);
  }

  override setTime(target: Date, hours: number, minutes: number, seconds: number): Date {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      if (!inRange(hours, 0, 23)) {
        throw Error(`Invalid hours "${hours}". Hours value must be between 0 and 23.`);
      }

      if (!inRange(minutes, 0, 59)) {
        throw Error(`Invalid minutes "${minutes}". Minutes value must be between 0 and 59.`);
      }

      if (!inRange(seconds, 0, 59)) {
        throw Error(`Invalid seconds "${seconds}". Seconds value must be between 0 and 59.`);
      }
    }

    const clone = this.clone(target);
    clone.setHours(hours, minutes, seconds, 0);
    return clone;
  }

  override getHours(date: Date): number {
    return date.getHours();
  }

  override getMinutes(date: Date): number {
    return date.getMinutes();
  }

  override getSeconds(date: Date): number {
    return date.getSeconds();
  }

  override parseTime(userValue: any, parseFormat?: any): Date | null {
    if (typeof userValue !== 'string') {
      return userValue instanceof Date ? new Date(userValue.getTime()) : null;
    }

    const value = userValue.trim();

    if (value.length === 0) {
      return null;
    }

    // Attempt to parse the value directly.
    let result = this._parseTimeString(value);

    // Some locales add extra characters around the time, but are otherwise parseable
    // (e.g. `00:05 ч.` in bg-BG). Try replacing all non-number and non-colon characters.
    if (result === null) {
      const withoutExtras = value.replace(/[^0-9:(AM|PM)]/gi, '').trim();

      if (withoutExtras.length > 0) {
        result = this._parseTimeString(withoutExtras);
      }
    }

    return result || this.invalid();
  }

  override addSeconds(date: Date, amount: number): Date {
    return new Date(date.getTime() + amount * 1000);
  }

  /** Creates a date but allows the month and date to overflow. */
  private _createDateWithOverflow(year: number, month: number, date: number) {
    // Passing the year to the constructor causes year numbers <100 to be converted to 19xx.
    // To work around this we use `setFullYear` and `setHours` instead.
    const d = new Date();
    d.setFullYear(year, month, date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  /**
   * Pads a number to make it two digits.
   * @param n The number to pad.
   * @returns The padded number.
   */
  private _2digit(n: number) {
    return ('00' + n).slice(-2);
  }

  /**
   * When converting Date object to string, javascript built-in functions may return wrong
   * results because it applies its internal DST rules. The DST rules around the world change
   * very frequently, and the current valid rule is not always valid in previous years though.
   * We work around this problem building a new Date object which has its internal UTC
   * representation with the local date and time.
   * @param dtf Intl.DateTimeFormat object, containing the desired string format. It must have
   *    timeZone set to 'utc' to work fine.
   * @param date Date from which we want to get the string representation according to dtf
   * @returns A Date object with its UTC representation based on the passed in date info
   */
  private _format(dtf: Intl.DateTimeFormat, date: Date) {
    // Passing the year to the constructor causes year numbers <100 to be converted to 19xx.
    // To work around this we use `setUTCFullYear` and `setUTCHours` instead.
    const d = new Date();
    d.setUTCFullYear(date.getFullYear(), date.getMonth(), date.getDate());
    d.setUTCHours(date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
    return dtf.format(d);
  }

  private _nativeParseFallback(value: string): Date {
    const date = new Date(Date.parse(value));
    if (!this.isValid(date)) {
      return date;
    }

    // Native parsing sometimes assumes UTC, sometimes does not.
    // We have to remove the difference between the two in order to get the date as a local date.

    const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
    const difference = date.getTime() - compareDate.getTime();
    if (difference === 0) {
      return date;
    }

    return new Date(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
      date.getUTCMilliseconds(),
    );
  }

  /**
   * Attempts to parse a time string into a date object. Returns null if it cannot be parsed.
   * @param value Time string to parse.
   */
  private _parseTimeString(value: string): Date | null {
    // Note: we can technically rely on the browser for the time parsing by generating
    // an ISO string and appending the string to the end of it. We don't do it, because
    // browsers aren't consistent in what they support. Some examples:
    // - Safari doesn't support AM/PM.
    // - Firefox produces a valid date object if the time string has overflows (e.g. 12:75) while
    //   other browsers produce an invalid date.
    // - Safari doesn't allow padded numbers.
    const parsed = value.toUpperCase().match(TIME_REGEX);

    if (parsed) {
      let hours = parseInt(parsed[1]);
      const minutes = parseInt(parsed[2]);
      let seconds: number | undefined = parsed[3] == null ? undefined : parseInt(parsed[3]);
      const amPm = parsed[4] as 'AM' | 'PM' | undefined;

      if (hours === 12) {
        hours = amPm === 'AM' ? 0 : hours;
      } else if (amPm === 'PM') {
        hours += 12;
      }

      if (
        inRange(hours, 0, 23) &&
        inRange(minutes, 0, 59) &&
        (seconds == null || inRange(seconds, 0, 59))
      ) {
        return this.setTime(this.today(), hours, minutes, seconds || 0);
      }
    }

    return null;
  }
}

/** Checks whether a number is within a certain range. */
function inRange(value: number, min: number, max: number): boolean {
  return !isNaN(value) && value >= min && value <= max;
}
