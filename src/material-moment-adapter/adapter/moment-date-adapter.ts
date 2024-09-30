/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injectable, InjectionToken, inject} from '@angular/core';
import {DateAdapter, MAT_DATE_LOCALE} from '@angular/material/core';
// Depending on whether rollup is used, moment needs to be imported differently.
// Since Moment.js doesn't have a default export, we normally need to import using the `* as`
// syntax. However, rollup creates a synthetic default module and we thus need to import it using
// the `default as` syntax.
// TODO(mmalerba): See if we can clean this up at some point.
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import {default as _rollupMoment, Moment, MomentFormatSpecification, MomentInput} from 'moment';

const moment = _rollupMoment || _moment;

/** Configurable options for MomentDateAdapter. */
export interface MatMomentDateAdapterOptions {
  /**
   * When enabled, the dates have to match the format exactly.
   * See https://momentjs.com/guides/#/parsing/strict-mode/.
   */
  strict?: boolean;

  /**
   * Turns the use of utc dates on or off.
   * Changing this will change how Angular Material components like DatePicker output dates.
   * Defaults to `false`.
   */
  useUtc?: boolean;
}

/** InjectionToken for moment date adapter to configure options. */
export const MAT_MOMENT_DATE_ADAPTER_OPTIONS = new InjectionToken<MatMomentDateAdapterOptions>(
  'MAT_MOMENT_DATE_ADAPTER_OPTIONS',
  {
    providedIn: 'root',
    factory: MAT_MOMENT_DATE_ADAPTER_OPTIONS_FACTORY,
  },
);

/** @docs-private */
export function MAT_MOMENT_DATE_ADAPTER_OPTIONS_FACTORY(): MatMomentDateAdapterOptions {
  return {
    useUtc: false,
  };
}

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
export class MomentDateAdapter extends DateAdapter<Moment> {
  private _options = inject<MatMomentDateAdapterOptions>(MAT_MOMENT_DATE_ADAPTER_OPTIONS, {
    optional: true,
  });

  // Note: all of the methods that accept a `Moment` input parameter immediately call `this.clone`
  // on it. This is to ensure that we're working with a `Moment` that has the correct locale setting
  // while avoiding mutating the original object passed to us. Just calling `.locale(...)` on the
  // input would mutate the object.

  private _localeData: {
    firstDayOfWeek: number;
    longMonths: string[];
    shortMonths: string[];
    dates: string[];
    longDaysOfWeek: string[];
    shortDaysOfWeek: string[];
    narrowDaysOfWeek: string[];
  };

  constructor(...args: unknown[]);

  constructor() {
    super();
    const dateLocale = inject<string>(MAT_DATE_LOCALE, {optional: true});
    this.setLocale(dateLocale || moment.locale());
  }

  override setLocale(locale: string) {
    super.setLocale(locale);

    let momentLocaleData = moment.localeData(locale);
    this._localeData = {
      firstDayOfWeek: momentLocaleData.firstDayOfWeek(),
      longMonths: momentLocaleData.months(),
      shortMonths: momentLocaleData.monthsShort(),
      dates: range(31, i => this.createDate(2017, 0, i + 1).format('D')),
      longDaysOfWeek: momentLocaleData.weekdays(),
      shortDaysOfWeek: momentLocaleData.weekdaysShort(),
      narrowDaysOfWeek: momentLocaleData.weekdaysMin(),
    };
  }

  getYear(date: Moment): number {
    return this.clone(date).year();
  }

  getMonth(date: Moment): number {
    return this.clone(date).month();
  }

  getDate(date: Moment): number {
    return this.clone(date).date();
  }

  getDayOfWeek(date: Moment): number {
    return this.clone(date).day();
  }

  getMonthNames(style: 'long' | 'short' | 'narrow'): string[] {
    // Moment.js doesn't support narrow month names, so we just use short if narrow is requested.
    return style == 'long' ? this._localeData.longMonths : this._localeData.shortMonths;
  }

  getDateNames(): string[] {
    return this._localeData.dates;
  }

  getDayOfWeekNames(style: 'long' | 'short' | 'narrow'): string[] {
    if (style == 'long') {
      return this._localeData.longDaysOfWeek;
    }
    if (style == 'short') {
      return this._localeData.shortDaysOfWeek;
    }
    return this._localeData.narrowDaysOfWeek;
  }

  getYearName(date: Moment): string {
    return this.clone(date).format('YYYY');
  }

  getFirstDayOfWeek(): number {
    return this._localeData.firstDayOfWeek;
  }

  getNumDaysInMonth(date: Moment): number {
    return this.clone(date).daysInMonth();
  }

  clone(date: Moment): Moment {
    return date.clone().locale(this.locale);
  }

  createDate(year: number, month: number, date: number): Moment {
    // Moment.js will create an invalid date if any of the components are out of bounds, but we
    // explicitly check each case so we can throw more descriptive errors.
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      if (month < 0 || month > 11) {
        throw Error(`Invalid month index "${month}". Month index has to be between 0 and 11.`);
      }

      if (date < 1) {
        throw Error(`Invalid date "${date}". Date has to be greater than 0.`);
      }
    }

    const result = this._createMoment({year, month, date}).locale(this.locale);

    // If the result isn't valid, the date must have been out of bounds for this month.
    if (!result.isValid() && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      throw Error(`Invalid date "${date}" for month with index "${month}".`);
    }

    return result;
  }

  today(): Moment {
    return this._createMoment().locale(this.locale);
  }

  parse(value: any, parseFormat: string | string[]): Moment | null {
    if (value && typeof value == 'string') {
      return this._createMoment(value, parseFormat, this.locale);
    }
    return value ? this._createMoment(value).locale(this.locale) : null;
  }

  format(date: Moment, displayFormat: string): string {
    date = this.clone(date);
    if (!this.isValid(date) && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      throw Error('MomentDateAdapter: Cannot format invalid date.');
    }
    return date.format(displayFormat);
  }

  addCalendarYears(date: Moment, years: number): Moment {
    return this.clone(date).add({years});
  }

  addCalendarMonths(date: Moment, months: number): Moment {
    return this.clone(date).add({months});
  }

  addCalendarDays(date: Moment, days: number): Moment {
    return this.clone(date).add({days});
  }

  toIso8601(date: Moment): string {
    return this.clone(date).format();
  }

  /**
   * Returns the given value if given a valid Moment or null. Deserializes valid ISO 8601 strings
   * (https://www.ietf.org/rfc/rfc3339.txt) and valid Date objects into valid Moments and empty
   * string into null. Returns an invalid date for all other values.
   */
  override deserialize(value: any): Moment | null {
    let date;
    if (value instanceof Date) {
      date = this._createMoment(value).locale(this.locale);
    } else if (this.isDateInstance(value)) {
      // Note: assumes that cloning also sets the correct locale.
      return this.clone(value);
    }
    if (typeof value === 'string') {
      if (!value) {
        return null;
      }
      date = this._createMoment(value, moment.ISO_8601).locale(this.locale);
    }
    if (date && this.isValid(date)) {
      return this._createMoment(date).locale(this.locale);
    }
    return super.deserialize(value);
  }

  isDateInstance(obj: any): boolean {
    return moment.isMoment(obj);
  }

  isValid(date: Moment): boolean {
    return this.clone(date).isValid();
  }

  invalid(): Moment {
    return moment.invalid();
  }

  override setTime(target: Moment, hours: number, minutes: number, seconds: number): Moment {
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

    return this.clone(target).set({hours, minutes, seconds, milliseconds: 0});
  }

  override getHours(date: Moment): number {
    return date.hours();
  }

  override getMinutes(date: Moment): number {
    return date.minutes();
  }

  override getSeconds(date: Moment): number {
    return date.seconds();
  }

  override parseTime(value: any, parseFormat: string | string[]): Moment | null {
    return this.parse(value, parseFormat);
  }

  override addSeconds(date: Moment, amount: number): Moment {
    return this.clone(date).add({seconds: amount});
  }

  /** Creates a Moment instance while respecting the current UTC settings. */
  private _createMoment(
    date?: MomentInput,
    format?: MomentFormatSpecification,
    locale?: string,
  ): Moment {
    const {strict, useUtc}: MatMomentDateAdapterOptions = this._options || {};

    return useUtc ? moment.utc(date, format, locale, strict) : moment(date, format, locale, strict);
  }
}
