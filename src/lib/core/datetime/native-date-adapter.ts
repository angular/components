import {DateAdapter} from './date-adapter';


/** Creates an array and fills it with values. */
function range<T>(length: number, valueFunction: (index: number) => T): T[] {
  return Array.apply(null, Array(length)).map((v: undefined, i: number) => valueFunction(i));
}


/** Adapts the native JS Date for use with material components that work with dates. */
export class NativeDateAdapter extends DateAdapter<Date> {
  getYear(date: Date): number {
    return date.getFullYear();
  }

  getMonth(date: Date): number {
    return date.getMonth();
  }

  getDate(date: Date): number {
    return date.getDate();
  }

  getDay(date: Date): number {
    return date.getDay();
  }

  getMonthNames(style: 'long' | 'short' | 'narrow', locale?: any): string[] {
    let dtf = new Intl.DateTimeFormat(locale, {month: style});
    return range(12, i => dtf.format(new Date(2017, i, 1)));
  }

  getDateNames(locale?: any): string[] {
    let dtf = new Intl.DateTimeFormat(locale, {day: 'numeric'});
    return range(31, i => dtf.format(new Date(2017, 0, i + 1)));
  }

  getDayNames(style: 'long' | 'short' | 'narrow', locale?: any): string[] {
    let dtf = new Intl.DateTimeFormat(locale, {weekday: style});
    return range(7, i => dtf.format(new Date(2017, 0, i + 1)));
  }

  getYearName(date: Date, locale?: any): string {
    let dtf = new Intl.DateTimeFormat(locale, {year: 'numeric'});
    return dtf.format(date);
  }

  getMonthYearName(date: Date, monthStyle: 'long' | 'short' | 'narrow', locale?: any): string {
    let dtf = new Intl.DateTimeFormat(locale, {month: monthStyle, year: 'numeric'});
    return dtf.format(date);
  }

  getFirstDayOfWeek(locale?: any): number {
    // We can't tell using native JS Date what the first day of the week is, we default to Sunday.
    return 0;
  }

  create(year: number, month: number, date: number): Date {
    let result = new Date(year, month, date);
    // We need to correct for the fact that JS native Date treats years in range [0, 99] as
    // abbreviations for 19xx.
    if (year >= 0 && year < 100) {
      result.setFullYear(this.getYear(result) - 1900);
    }
    return result;
  }

  today(): Date {
    return new Date();
  }

  parse(value: any, fmt?: any, locale?: any): Date | null {
    // We have no way using the native JS Date to set the parse format or locale, so we ignore these
    // parameters.
    let timestamp = typeof value == 'number' ? value : Date.parse(value);
    return isNaN(timestamp) ? null : new Date(timestamp);
  }

  format(date: Date, fmt?: any, locale?: any): string {
    let dtf = new Intl.DateTimeFormat(locale, fmt);
    return dtf.format(date);
  }

  add(date: Date, amount: { years?: number; months?: number; days?: number }): Date {
    return this.create(
        this.getYear(date) + (amount.years || 0),
        this.getMonth(date) + (amount.months || 0),
        this.getDate(date) + (amount.days || 0));
  }
}
