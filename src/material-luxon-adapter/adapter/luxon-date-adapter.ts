/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injectable, InjectionToken, inject} from '@angular/core';
import {DateAdapter, MAT_DATE_LOCALE} from '@angular/material/core';
import {
  DateTime as LuxonDateTime,
  Info as LuxonInfo,
  DateTimeOptions as LuxonDateTimeOptions,
  CalendarSystem as LuxonCalendarSystem,
} from 'luxon';

/** Configurable options for the `LuxonDateAdapter`. */
export interface MatLuxonDateAdapterOptions {
  /**
   * Turns the use of utc dates on or off.
   * Changing this will change how Angular Material components like DatePicker output dates.
   */
  useUtc: boolean;

  /**
   * Sets the first day of week.
   * Changing this will change how Angular Material components like DatePicker shows start of week.
   */
  firstDayOfWeek?: number;

  /**
   * Sets the output Calendar.
   * Changing this will change how Angular Material components like DatePicker output dates.
   */
  defaultOutputCalendar: LuxonCalendarSystem;
}

/** InjectionToken for LuxonDateAdapter to configure options. */
export const MAT_LUXON_DATE_ADAPTER_OPTIONS = new InjectionToken<MatLuxonDateAdapterOptions>(
  'MAT_LUXON_DATE_ADAPTER_OPTIONS',
  {
    providedIn: 'root',
    factory: MAT_LUXON_DATE_ADAPTER_OPTIONS_FACTORY,
  },
);

/** @docs-private */
export function MAT_LUXON_DATE_ADAPTER_OPTIONS_FACTORY(): MatLuxonDateAdapterOptions {
  return {
    useUtc: false,
    defaultOutputCalendar: 'gregory',
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

/** Adapts Luxon Dates for use with Angular Material. */
@Injectable()
export class LuxonDateAdapter extends DateAdapter<LuxonDateTime> {
  private _useUTC: boolean;
  private _firstDayOfWeek: number | undefined;
  private _defaultOutputCalendar: LuxonCalendarSystem;

  constructor(...args: unknown[]);

  constructor() {
    super();

    const dateLocale = inject(MAT_DATE_LOCALE, {optional: true});
    const options = inject<MatLuxonDateAdapterOptions>(MAT_LUXON_DATE_ADAPTER_OPTIONS, {
      optional: true,
    });

    this._useUTC = !!options?.useUtc;
    this._firstDayOfWeek = options?.firstDayOfWeek;
    this._defaultOutputCalendar = options?.defaultOutputCalendar || 'gregory';
    this.setLocale(dateLocale || LuxonDateTime.local().locale);
  }

  getYear(date: LuxonDateTime): number {
    return date.year;
  }

  getMonth(date: LuxonDateTime): number {
    // Luxon works with 1-indexed months whereas our code expects 0-indexed.
    return date.month - 1;
  }

  getDate(date: LuxonDateTime): number {
    return date.day;
  }

  getDayOfWeek(date: LuxonDateTime): number {
    return date.weekday;
  }

  getMonthNames(style: 'long' | 'short' | 'narrow'): string[] {
    // Adding outputCalendar option, because LuxonInfo doesn't get effected by LuxonSettings
    return LuxonInfo.months(style, {
      locale: this.locale,
      outputCalendar: this._defaultOutputCalendar,
    });
  }

  getDateNames(): string[] {
    // At the time of writing, Luxon doesn't offer similar
    // functionality so we have to fall back to the Intl API.
    const dtf = new Intl.DateTimeFormat(this.locale, {day: 'numeric', timeZone: 'utc'});

    // Format a UTC date in order to avoid DST issues.
    return range(31, i => dtf.format(LuxonDateTime.utc(2017, 1, i + 1).toJSDate()));
  }

  getDayOfWeekNames(style: 'long' | 'short' | 'narrow'): string[] {
    // Note that we shift the array once, because Luxon returns Monday as the
    // first day of the week, whereas our logic assumes that it's Sunday. See:
    // https://moment.github.io/luxon/api-docs/index.html#infoweekdays
    const days = LuxonInfo.weekdays(style, {locale: this.locale});
    days.unshift(days.pop()!);
    return days;
  }

  getYearName(date: LuxonDateTime): string {
    return date.toFormat('yyyy', this._getOptions());
  }

  getFirstDayOfWeek(): number {
    return this._firstDayOfWeek ?? LuxonInfo.getStartOfWeek({locale: this.locale});
  }

  getNumDaysInMonth(date: LuxonDateTime): number {
    return date.daysInMonth!;
  }

  clone(date: LuxonDateTime): LuxonDateTime {
    return LuxonDateTime.fromObject(date.toObject(), this._getOptions());
  }

  createDate(year: number, month: number, date: number): LuxonDateTime {
    const options = this._getOptions();

    if (month < 0 || month > 11) {
      throw Error(`Invalid month index "${month}". Month index has to be between 0 and 11.`);
    }

    if (date < 1) {
      throw Error(`Invalid date "${date}". Date has to be greater than 0.`);
    }

    // Luxon uses 1-indexed months so we need to add one to the month.
    const result = this._useUTC
      ? LuxonDateTime.utc(year, month + 1, date, options)
      : LuxonDateTime.local(year, month + 1, date, options);

    if (!this.isValid(result)) {
      throw Error(`Invalid date "${date}". Reason: "${result.invalidReason}".`);
    }

    return result;
  }

  today(): LuxonDateTime {
    const options = this._getOptions();

    return this._useUTC ? LuxonDateTime.utc(options) : LuxonDateTime.local(options);
  }

  parse(value: any, parseFormat: string | string[]): LuxonDateTime | null {
    const options: LuxonDateTimeOptions = this._getOptions();

    if (typeof value == 'string' && value.length > 0) {
      const iso8601Date = LuxonDateTime.fromISO(value, options);

      if (this.isValid(iso8601Date)) {
        return iso8601Date;
      }

      const formats = Array.isArray(parseFormat) ? parseFormat : [parseFormat];

      if (!parseFormat.length) {
        throw Error('Formats array must not be empty.');
      }

      for (const format of formats) {
        const fromFormat = LuxonDateTime.fromFormat(value, format, options);

        if (this.isValid(fromFormat)) {
          return fromFormat;
        }
      }

      return this.invalid();
    } else if (typeof value === 'number') {
      return LuxonDateTime.fromMillis(value, options);
    } else if (value instanceof Date) {
      return LuxonDateTime.fromJSDate(value, options);
    } else if (value instanceof LuxonDateTime) {
      return LuxonDateTime.fromMillis(value.toMillis(), options);
    }

    return null;
  }

  format(date: LuxonDateTime, displayFormat: string): string {
    if (!this.isValid(date)) {
      throw Error('LuxonDateAdapter: Cannot format invalid date.');
    }
    if (this._useUTC) {
      return date.setLocale(this.locale).setZone('utc').toFormat(displayFormat);
    } else {
      return date.setLocale(this.locale).toFormat(displayFormat);
    }
  }

  addCalendarYears(date: LuxonDateTime, years: number): LuxonDateTime {
    return date.reconfigure(this._getOptions()).plus({years});
  }

  addCalendarMonths(date: LuxonDateTime, months: number): LuxonDateTime {
    return date.reconfigure(this._getOptions()).plus({months});
  }

  addCalendarDays(date: LuxonDateTime, days: number): LuxonDateTime {
    return date.reconfigure(this._getOptions()).plus({days});
  }

  toIso8601(date: LuxonDateTime): string {
    return date.toISO()!;
  }

  /**
   * Returns the given value if given a valid Luxon or null. Deserializes valid ISO 8601 strings
   * (https://www.ietf.org/rfc/rfc3339.txt) and valid Date objects into valid DateTime and empty
   * string into null. Returns an invalid date for all other values.
   */
  override deserialize(value: any): LuxonDateTime | null {
    const options = this._getOptions();
    let date: LuxonDateTime | undefined;
    if (value instanceof Date) {
      date = LuxonDateTime.fromJSDate(value, options);
    }
    if (typeof value === 'string') {
      if (!value) {
        return null;
      }
      date = LuxonDateTime.fromISO(value, options);
    }
    if (date && this.isValid(date)) {
      return date;
    }
    return super.deserialize(value);
  }

  isDateInstance(obj: any): boolean {
    return obj instanceof LuxonDateTime;
  }

  isValid(date: LuxonDateTime): boolean {
    return date.isValid;
  }

  invalid(): LuxonDateTime {
    return LuxonDateTime.invalid('Invalid Luxon DateTime object.');
  }

  override setTime(
    target: LuxonDateTime,
    hours: number,
    minutes: number,
    seconds: number,
  ): LuxonDateTime {
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

    return this.clone(target).set({
      hour: hours,
      minute: minutes,
      second: seconds,
      millisecond: 0,
    });
  }

  override getHours(date: LuxonDateTime): number {
    return date.hour;
  }

  override getMinutes(date: LuxonDateTime): number {
    return date.minute;
  }

  override getSeconds(date: LuxonDateTime): number {
    return date.second;
  }

  override parseTime(value: any, parseFormat: string | string[]): LuxonDateTime | null {
    const result = this.parse(value, parseFormat);

    if ((!result || !this.isValid(result)) && typeof value === 'string') {
      // It seems like Luxon doesn't work well cross-browser for strings that have
      // additional characters around the time. Try parsing without those characters.
      return this.parse(value.replace(/[^0-9:(AM|PM)]/gi, ''), parseFormat) || result;
    }

    return result;
  }

  override addSeconds(date: LuxonDateTime, amount: number): LuxonDateTime {
    return date.reconfigure(this._getOptions()).plus({seconds: amount});
  }

  /** Gets the options that should be used when constructing a new `DateTime` object. */
  private _getOptions(): LuxonDateTimeOptions {
    return {
      zone: this._useUTC ? 'utc' : undefined,
      locale: this.locale,
      outputCalendar: this._defaultOutputCalendar,
    };
  }
}
