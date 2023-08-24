/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {inject, Inject, Injectable, Optional} from '@angular/core';
import {DateAdapter, MAT_DATE_LOCALE} from './date-adapter';

/**
 * Matches strings that have the form of a valid RFC 3339 string
 * (https://tools.ietf.org/html/rfc3339). Note that the string may not actually be a valid date
 * because the regex will match strings an with out of bounds month, date, etc.
 */
const ISO_8601_REGEX =
  /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|(?:(?:\+|-)\d{2}:\d{2}))?)?$/;

const DATE_COMPONENT_SEPARATOR_REGEX = /[ \/.:,'"|\\_-]+/;

const FULLY_NUMERIC_DATE_FORMAT_REGEX = /^\d{4}(\d\d){0,2}$/;

/** Creates an array and fills it with values. */
function range<T>(length: number, valueFunction: (index: number) => T): T[] {
  const valuesArray = Array(length);
  for (let i = 0; i < length; i++) {
    valuesArray[i] = valueFunction(i);
  }
  return valuesArray;
}

type DateComponent = 'year' | 'month' | 'day';

const defaultFormatOrder: DateComponent[] = ['month', 'day', 'year'];

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

  constructor(
    /**
     * @deprecated Now injected via inject(), param to be removed.
     * @breaking-change 18.0.0
     */
    @Optional() @Inject(MAT_DATE_LOCALE) matDateLocale?: string,
  ) {
    super();
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
    // We can't tell using native JS Date what the first day of the week is, we default to Sunday.
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
    if (result.getMonth() != month && (typeof ngDevMode === 'undefined' || ngDevMode)) {
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
    if (typeof value === 'number') {
      return new Date(value);
    }

    if (!value) {
      return null;
    }

    if (typeof value !== 'string') {
      return new Date(value);
    }

    let dateParts = (value as string)
      .trim()
      .split(DATE_COMPONENT_SEPARATOR_REGEX, 4)
      .filter(part => !!part);

    if (dateParts.length === 4) {
      const weekday = dateParts[0].toLocaleLowerCase(this.locale);

      let foundWeekday = false;

      for (const weekdayFormat of ['long', 'short']) {
        let index = this.getDayOfWeekNames(weekdayFormat as 'long' | 'short').findIndex(
          d =>
            d.toLocaleLowerCase(this.locale).replace(DATE_COMPONENT_SEPARATOR_REGEX, '') ===
            weekday,
        );

        if (index !== -1) {
          foundWeekday = true;
          break;
        }
      }

      if (foundWeekday) {
        // We ignore the weekday
        dateParts = dateParts.slice(1);
      } else {
        // First component isn't a weekday, so we assume the first 3 components are the date
        dateParts = dateParts.slice(0, 3);
      }
    }

    if (dateParts.length === 1) {
      // No separator found, assuming the format is only digits

      const numericFormat = dateParts[0];
      // Check if the format is either 4, 6, or 8 digits.
      if (!FULLY_NUMERIC_DATE_FORMAT_REGEX.test(numericFormat)) {
        return this.invalid();
      }

      if (numericFormat.length === 4) {
        // If the format is of 4 characters, assume <mmdd> / <ddmm>.
        dateParts = [numericFormat.substring(0, 2), numericFormat.substring(2, 4)];
      } else if (numericFormat.length === 6) {
        // If the format is of 6 characters, assume <yymmdd> / <ddmmyy>.
        dateParts = [
          numericFormat.substring(0, 2),
          numericFormat.substring(2, 4),
          numericFormat.substring(4, 6),
        ];
      } else {
        // If the format is of 8 characters, assume the year is in front or at the end.
        const localeFormatOrder = this._getLocaleShortFormatOrder();
        const formatOrders =
          localeFormatOrder === defaultFormatOrder
            ? [localeFormatOrder]
            : [localeFormatOrder, defaultFormatOrder];

        for (const formatOrder of formatOrders) {
          const yearIndex = formatOrder.findIndex(part => part === 'year');
          const monthIndex = formatOrder.findIndex(part => part === 'month');
          if (yearIndex === 0) {
            const year = parseInt(numericFormat.substring(0, 4), 10);
            const part1Int = parseInt(numericFormat.substring(4, 6), 10);
            const part2Int = parseInt(numericFormat.substring(6, 8), 10);

            if (monthIndex === 1 && this._dateComponentsAreValid(year, part1Int - 1, part2Int)) {
              return this.createDate(year, part1Int - 1, part2Int);
            }

            if (monthIndex === 2 && this._dateComponentsAreValid(year, part2Int - 1, part1Int)) {
              return this.createDate(year, part2Int - 1, part1Int);
            }
          } else if (yearIndex === 1) {
            const year = parseInt(numericFormat.substring(2, 6), 10);
            const part0Int = parseInt(numericFormat.substring(0, 2), 10);
            const part2Int = parseInt(numericFormat.substring(6, 8), 10);

            if (monthIndex === 0 && this._dateComponentsAreValid(year, part0Int - 1, part2Int)) {
              return this.createDate(year, part0Int - 1, part2Int);
            }

            if (monthIndex === 2 && this._dateComponentsAreValid(year, part2Int - 1, part0Int)) {
              return this.createDate(year, part2Int - 1, part0Int);
            }
          } else {
            const year = parseInt(numericFormat.substring(4, 8), 10);
            const part0Int = parseInt(numericFormat.substring(0, 2), 10);
            const part1Int = parseInt(numericFormat.substring(2, 4), 10);

            if (monthIndex === 0 && this._dateComponentsAreValid(year, part0Int - 1, part1Int)) {
              return this.createDate(year, part0Int - 1, part1Int);
            }

            if (monthIndex === 1 && this._dateComponentsAreValid(year, part1Int - 1, part0Int)) {
              return this.createDate(year, part1Int - 1, part0Int);
            }
          }
        }
      }
    }

    if (dateParts.length === 2) {
      // Two parts imply a missing year component, we will set it to the current year.

      const date = new Date();
      const part0Int = parseInt(dateParts[0], 10);
      const part1Int = parseInt(dateParts[1], 10);

      if (isNaN(part0Int) && isNaN(part1Int)) {
        return null;
      }

      const year = date.getFullYear();

      if (isNaN(part0Int)) {
        const month = this._getMonthByName(dateParts[0]);
        return month !== undefined && this._dateComponentsAreValid(year, month, part1Int)
          ? this.createDate(year, month, part1Int)
          : this.invalid();
      }

      if (isNaN(part1Int)) {
        const month = this._getMonthByName(dateParts[1]);
        return month !== undefined && this._dateComponentsAreValid(year, month, part0Int)
          ? this.createDate(year, month, part0Int)
          : this.invalid();
      }

      const mdFormatIsValid = this._dateComponentsAreValid(year, part0Int - 1, part1Int);
      const dmFormatIsValid = this._dateComponentsAreValid(year, part1Int - 1, part0Int);

      if (mdFormatIsValid && dmFormatIsValid) {
        const formatOrder = this._getLocaleShortFormatOrder();
        const monthIndex = formatOrder.indexOf('month');
        const dayIndex = formatOrder.indexOf('day');
        if (monthIndex < dayIndex) {
          return this.createDate(year, part0Int - 1, part1Int);
        }
        return this.createDate(year, part1Int - 1, part0Int);
      } else if (mdFormatIsValid) {
        return this.createDate(year, part0Int - 1, part1Int);
      } else if (dmFormatIsValid) {
        return this.createDate(year, part1Int - 1, part0Int);
      } else {
        return this.invalid();
      }
    } else {
      const part0Int = parseInt(dateParts[0], 10);
      const part1Int = parseInt(dateParts[1], 10);
      const part2Int = parseInt(dateParts[2], 10);

      if (
        (isNaN(part0Int) && isNaN(part1Int)) ||
        (isNaN(part0Int) && isNaN(part2Int)) ||
        (isNaN(part1Int) && isNaN(part2Int))
      ) {
        return this.invalid();
      }

      if (isNaN(part0Int) || isNaN(part1Int) || isNaN(part2Int)) {
        // One of the date components is assumed to be the month written out.
        if (isNaN(part0Int)) {
          // Format is <M d y>
          const month = this._getMonthByName(dateParts[0]);
          if (month === undefined) {
            return this.invalid();
          }

          const year = part2Int < 100 ? part2Int + 2000 : part2Int;

          return this._dateComponentsAreValid(year, month, part1Int)
            ? this.createDate(year, month, part1Int)
            : this.invalid();
        } else if (isNaN(part1Int)) {
          // Format is <y M d> or <d M y>
          const month = this._getMonthByName(dateParts[1]);
          if (month === undefined) {
            return this.invalid();
          }

          if (part0Int > 99) {
            return this._dateComponentsAreValid(part0Int, month, part2Int)
              ? this.createDate(part0Int, month, part2Int)
              : this.invalid();
          } else if (part2Int > 99) {
            return this._dateComponentsAreValid(part2Int, month, part0Int)
              ? this.createDate(part2Int, month, part0Int)
              : this.invalid();
          }

          const ymdFormatIsValid = this._dateComponentsAreValid(part0Int + 2000, month, part2Int);
          const dmyFormatIsValid = this._dateComponentsAreValid(part2Int + 2000, month, part0Int);

          if (ymdFormatIsValid && dmyFormatIsValid) {
            const formatOrder = this._getLocaleLongFormatOrder();
            const dayIndex = formatOrder.indexOf('day');
            const yearIndex = formatOrder.indexOf('year');
            if (dayIndex < yearIndex) {
              return this.createDate(part0Int + 2000, month, part2Int);
            }
            return this.createDate(part2Int + 2000, month, part0Int);
          } else if (ymdFormatIsValid) {
            return this.createDate(part0Int + 2000, month, part2Int);
          } else if (dmyFormatIsValid) {
            return this.createDate(part2Int + 2000, month, part0Int);
          }
          return this.invalid();
        } else {
          // Format is <y d M>
          const month = this._getMonthByName(dateParts[2]);
          if (month === undefined) {
            return this.invalid();
          }

          const year = part0Int < 100 ? part0Int + 2000 : part0Int;

          return this._dateComponentsAreValid(year, month, part1Int)
            ? this.createDate(year, month, part1Int)
            : this.invalid();
        }
      }

      // We are dealing with a set of 3 numbers.

      if (
        (part0Int > 31 && part1Int > 31) ||
        (part0Int > 31 && part2Int > 31) ||
        (part1Int > 31 && part2Int > 31)
      ) {
        // Eliminate a date that looks like it has at least two years.
        return this.invalid();
      }

      if (part0Int > 31) {
        // Format is <y m d> or <y d m>
        if (part1Int > 12) {
          return this._dateComponentsAreValid(part0Int, part2Int - 1, part1Int)
            ? this.createDate(part0Int, part2Int - 1, part1Int)
            : this.invalid();
        } else if (part2Int > 12) {
          return this._dateComponentsAreValid(part0Int, part1Int - 1, part2Int)
            ? this.createDate(part0Int, part1Int - 1, part2Int)
            : this.invalid();
        } else {
          const ymdFormatIsValid = this._dateComponentsAreValid(part0Int, part1Int - 1, part2Int);
          const dmyFormatIsValid = this._dateComponentsAreValid(part0Int, part2Int - 1, part1Int);

          if (ymdFormatIsValid && dmyFormatIsValid) {
            const formatOrder = this._getLocaleShortFormatOrder();
            const monthIndex = formatOrder.indexOf('month');
            const dayIndex = formatOrder.indexOf('day');
            if (monthIndex < dayIndex) {
              return this.createDate(part0Int, part1Int - 1, part2Int);
            }
            return this.createDate(part0Int, part2Int - 1, part1Int);
          } else if (ymdFormatIsValid) {
            return this.createDate(part0Int, part1Int - 1, part2Int);
          } else if (dmyFormatIsValid) {
            return this.createDate(part0Int, part2Int - 1, part1Int);
          }
          return this.invalid();
        }
      } else if (part1Int > 31) {
        // Format is <m y d>, as the format <d y m> does not seem to be used anywhere.
        return this._dateComponentsAreValid(part1Int, part0Int - 1, part2Int)
          ? this.createDate(part1Int, part0Int - 1, part2Int)
          : this.invalid();
      } else if (part2Int > 31) {
        // Format is <m d y> or <d m y>
        if (part0Int > 12) {
          return this._dateComponentsAreValid(part2Int, part1Int - 1, part0Int)
            ? this.createDate(part2Int, part1Int - 1, part0Int)
            : this.invalid();
        } else if (part1Int > 12) {
          return this._dateComponentsAreValid(part2Int, part0Int - 1, part1Int)
            ? this.createDate(part2Int, part0Int - 1, part1Int)
            : this.invalid();
        } else {
          const mdyFormatIsValid = this._dateComponentsAreValid(part2Int, part0Int - 1, part1Int);
          const dmyFormatIsValid = this._dateComponentsAreValid(part2Int, part1Int - 1, part0Int);

          if (mdyFormatIsValid && dmyFormatIsValid) {
            const formatOrder = this._getLocaleShortFormatOrder();
            const monthIndex = formatOrder.indexOf('month');
            const dayIndex = formatOrder.indexOf('day');
            if (monthIndex < dayIndex) {
              return this.createDate(part2Int, part0Int - 1, part1Int);
            }
            return this.createDate(part2Int, part1Int - 1, part0Int);
          } else if (mdyFormatIsValid) {
            return this.createDate(part2Int, part0Int - 1, part1Int);
          } else if (dmyFormatIsValid) {
            return this.createDate(part2Int, part1Int - 1, part0Int);
          }
        }
        return this.invalid();
      } else {
        // We are dealing with a set of 3 numbers that are all less than 32.
        // Use locale format to determine the order of the date components.

        const localeFormatOrder = this._getLocaleShortFormatOrder();
        const formatOrders =
          localeFormatOrder === defaultFormatOrder
            ? [localeFormatOrder]
            : [localeFormatOrder, defaultFormatOrder];

        for (const formatOrder of formatOrders) {
          let year: number;
          let month: number;
          let day: number;

          if (formatOrder[0] === 'year') {
            year = part0Int;
          } else if (formatOrder[0] === 'month') {
            month = part0Int;
          } else {
            day = part0Int;
          }

          if (formatOrder[1] === 'year') {
            year = part1Int;
          } else if (formatOrder[1] === 'month') {
            month = part1Int;
          } else {
            day = part1Int;
          }

          if (formatOrder[2] === 'year') {
            year = part2Int;
          } else if (formatOrder[2] === 'month') {
            month = part2Int;
          } else {
            day = part2Int;
          }

          if (year! < 100) {
            year = year! + 2000;
          }

          if (this._dateComponentsAreValid(year!, month! - 1, day!)) {
            return this.createDate(year!, month! - 1, day!);
          }
        }

        return this.invalid();
      }
    }
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

  private _dateComponentsAreValid(year: number, month: number, day: number) {
    if (year < 0 || year > 9999 || month < 0 || month > 11 || day < 1 || day > 31) {
      return false;
    }

    if (month === 1) {
      const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
      return isLeapYear ? day <= 29 : day <= 28;
    }

    if (month === 3 || month === 5 || month === 8 || month === 10) {
      return day <= 30;
    }

    return true;
  }

  private _getLocaleShortFormatOrder(): DateComponent[] {
    try {
      const formatParts = Intl.DateTimeFormat(this.locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).formatToParts();

      const formatOrder: DateComponent[] = [];

      for (let formatPart of formatParts) {
        const type = formatPart.type;
        if (type === 'year' || type === 'month' || type === 'day') {
          formatOrder.push(type);
        }
      }

      return formatOrder;
    } catch (e) {
      return defaultFormatOrder;
    }
  }

  private _getLocaleLongFormatOrder(): DateComponent[] {
    try {
      const formatParts = Intl.DateTimeFormat(this.locale, {
        year: 'numeric',
        month: 'long',
        day: '2-digit',
      }).formatToParts();

      const formatOrder: DateComponent[] = [];

      for (let formatPart of formatParts) {
        const type = formatPart.type;
        if (type === 'year' || type === 'month' || type === 'day') {
          formatOrder.push(type);
        }
      }

      return formatOrder;
    } catch (e) {
      return defaultFormatOrder;
    }
  }

  private _getMonthByName(monthName: string): number | undefined {
    monthName = monthName.toLocaleLowerCase(this.locale);
    monthName = monthName.toLocaleLowerCase(this.locale);
    let index = this.getMonthNames('long').findIndex(
      m =>
        m.toLocaleLowerCase(this.locale).replace(DATE_COMPONENT_SEPARATOR_REGEX, '') === monthName,
    );
    if (index !== -1) {
      return index;
    }
    index = this.getMonthNames('short').findIndex(
      m =>
        m.toLocaleLowerCase(this.locale).replace(DATE_COMPONENT_SEPARATOR_REGEX, '') === monthName,
    );
    return index === -1 ? undefined : index;
  }
}
