import {SimpleDate} from './simple-date';
import {Injectable} from '@angular/core';


const SUPPORTS_INTL_API = !!(new Date().toLocaleDateString);


@Injectable()
export abstract class CalendarLocale {
  /** Labels to use for the long form of the month. (e.g. 'January') */
  months: string[];

  /** Labels to use for the short form of the month. (e.g. 'Jan') */
  shortMonths: string[];

  /** Labels to use for the narrow form of the month. (e.g. 'J') */
  narrowMonths: string[];

  /** Labels to use for the long form of the week days. (e.g. 'Sunday') */
  days: string[];

  /** Labels to use for the short form of the week days. (e.g. 'Sun') */
  shortDays: string[];

  /** Labels to use for the narrow form of the week days. (e.g. 'S') */
  narrowDays: string[];

  /** Labels to use for the dates of the month. (e.g. '1', '2', '31') */
  dates: string[];

  /** The first day of the week. (e.g. 0 = Sunday, 6 = Saturday). */
  firstDayOfWeek: number;

  /** A label for the calendar popup (used by screen readers). */
  calendarLabel: string;

  /** A label for the button used to open the calendar popup (used by screen readers). */
  openCalendarLabel: string;

  /**
   * Parses a SimpleDate from a string.
   * @param dateString The string to parse.
   */
  parseDate: (dateString: string) => SimpleDate;

  /**
   * Formats a SimpleDate to a string.
   * @param date The date to format.
   */
  formatDate: (date: SimpleDate) => string;

  /**
   * Gets a label to display as the heading for the specified calendar month.
   * @param date A date that falls within the month to be labeled.
   */
  getCalendarMonthHeaderLabel: (date: SimpleDate) => string;

  /**
   * Gets a label to display as the heading for the specified calendar year.
   * @param date A date that falls within the year to be labeled.
   */
  getCalendarYearHeaderLabel: (date: SimpleDate) => string;
}


export class DefaultCalendarLocale implements  CalendarLocale {
  months = SUPPORTS_INTL_API ?  this.createMonthsArray('long') :
      [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
      ];

  shortMonths = SUPPORTS_INTL_API ? this.createMonthsArray('short') :
      ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  narrowMonths = SUPPORTS_INTL_API ? this.createMonthsArray('narrow') :
      ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

  days = SUPPORTS_INTL_API ? this.createDaysArray('long') :
      ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  shortDays = SUPPORTS_INTL_API ? this.createDaysArray('short') :
      ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  narrowDays = SUPPORTS_INTL_API ? this.createDaysArray('narrow') :
      ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  dates = SUPPORTS_INTL_API ?
      this.createArray(31,
          i => new Date(2017, 0, i + 1).toLocaleDateString(undefined, {day: 'numeric'})) :
      this.createArray(31, i => String(i + 1));

  firstDayOfWeek = 0;

  calendarLabel = 'Calendar';

  openCalendarLabel = 'Open calendar';

  parseDate(dateString: string) {
    return SimpleDate.fromNativeDate(new Date(Date.parse(dateString)));
  }

  formatDate(date: SimpleDate) {
    let nativeDate = date.toNativeDate();
    return SUPPORTS_INTL_API ? nativeDate.toLocaleDateString() : nativeDate.toDateString();
  }

  getCalendarMonthHeaderLabel(date: SimpleDate) {
    return SUPPORTS_INTL_API ?
        date.toNativeDate().toLocaleDateString(undefined, {month: 'long', year: 'numeric'}) :
        this.months[date.month] + ' ' + date.year;
  }

  getCalendarYearHeaderLabel(date: SimpleDate) {
    return SUPPORTS_INTL_API ?
        date.toNativeDate().toLocaleDateString(undefined, {year: 'numeric'}) : String(date.year);
  }

  protected createArray<T>(length: number, valueFunction: (index: number) => T): T[] {
    return Array.apply(null, Array(length)).map((v: undefined, i: number) => valueFunction(i));
  }

  protected createMonthsArray(format: string) {
    return this.createArray(12,
        i => new Date(2017, i, 1).toLocaleDateString(undefined, {month: format}));
  }

  protected createDaysArray(format: string) {
    return this.createArray(7,
        i => new Date(2017, 0, i).toLocaleDateString(undefined, {weekday: format}));
  }
}
