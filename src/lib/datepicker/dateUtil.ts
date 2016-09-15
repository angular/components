import {Injectable} from "@angular/core";

@Injectable()
export class MdDateUtil {
  /**
   * Gets the first day of the month for the given date's month.
   * @param {Date} date
   * @returns {Date}
   */
  getFirstDateOfMonth(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), 1, date.getHours(), date.getMinutes());
  }

  /**
   * Gets the number of days in the month for the given date's month.
   * @param date
   * @returns {number}
   */
  getNumberOfDaysInMonth(date: Date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }

  /**
   * Get an arbitrary date in the month after the given date's month.
   * @param date
   * @returns {Date}
   */
  getDateInNextMonth(date: Date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 1, date.getHours(), date.getMinutes());
  }

  /**
   * Get an arbitrary date in the month before the given date's month.
   * @param date
   * @returns {Date}
   */
  getDateInPreviousMonth(date: Date) {
    return new Date(date.getFullYear(), date.getMonth() - 1, 1, date.getHours(), date.getMinutes());
  }

  /**
   * Gets whether two dates have the same month and year.
   * @param {Date} d1
   * @param {Date} d2
   * @returns {boolean}
   */
  isSameMonthAndYear(d1: Date, d2: Date) {
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth();
  }

  /**
   * Gets whether two dates are the same day (not not necesarily the same time).
   * @param {Date} d1
   * @param {Date} d2
   * @returns {boolean}
   */
  isSameDay(d1: Date, d2: Date) {
    return d1.getDate() == d2.getDate() && this.isSameMonthAndYear(d1, d2);
  }

  /**
   * Gets whether a date is in the month immediately after some date.
   * @param {Date} startDate The date from which to compare.
   * @param {Date} endDate The date to check.
   * @returns {boolean}
   */
  isInNextMonth(startDate: Date, endDate: Date) {
    let nextMonth = this.getDateInNextMonth(startDate);
    return this.isSameMonthAndYear(nextMonth, endDate);
  }

  /**
   * Gets whether a date is in the month immediately before some date.
   * @param {Date} startDate The date from which to compare.
   * @param {Date} endDate The date to check.
   * @returns {boolean}
   */
  isInPreviousMonth(startDate: Date, endDate: Date) {
    let previousMonth = this.getDateInPreviousMonth(startDate);
    return this.isSameMonthAndYear(endDate, previousMonth);
  }

  /**
   * Gets the midpoint between two dates.
   * @param {Date} d1
   * @param {Date} d2
   * @returns {Date}
   */
  getDateMidpoint(d1: Date, d2: Date) {
    return this.createDateAtMidnight((d1.getTime() + d2.getTime()) / 2);
  }

  /**
   * Gets the week of the month that a given date occurs in.
   * @param {Date} date
   * @returns {number} Index of the week of the month (zero-based).
   */
  getWeekOfMonth(date: Date) {
    let firstDayOfMonth = this.getFirstDateOfMonth(date);
    return Math.floor((firstDayOfMonth.getDay() + date.getDate() - 1) / 7);
  }

  /**
   * Gets a new date incremented by the given number of days. Number of days can be negative.
   * @param {Date} date
   * @param {number} numberOfDays
   * @returns {Date}
   */
  incrementDays(date: Date, numberOfDays: number) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + numberOfDays, date.getHours(), date.getMinutes());
  }

  /**
   * Gets a new date incremented by the given number of months. Number of months can be negative.
   * If the date of the given month does not match the target month, the date will be set to the
   * last day of the month.
   * @param {Date} date
   * @param {number} numberOfMonths
   * @returns {Date}
   */
  incrementMonths(date: Date, numberOfMonths: number) {
    // If the same date in the target month does not actually exist, the Date object will
    // automatically advance *another* month by the number of missing days.
    // For example, if you try to go from Jan. 30 to Feb. 30, you'll end up on March 2.
    // So, we check if the month overflowed and go to the last day of the target month instead.
    let dateInTargetMonth = new Date(date.getFullYear(), date.getMonth() + numberOfMonths, 1, date.getHours(), date.getMinutes());
    let numberOfDaysInMonth = this.getNumberOfDaysInMonth(dateInTargetMonth);
    if (numberOfDaysInMonth < date.getDate()) {
      dateInTargetMonth.setDate(numberOfDaysInMonth);
    } else {
      dateInTargetMonth.setDate(date.getDate());
    }

    return dateInTargetMonth;
  }

  /**
   * Get the integer distance between two months. This *only* considers the month and year
   * portion of the Date instances.
   *
   * @param {Date} start
   * @param {Date} end
   * @returns {number} Number of months between `start` and `end`. If `end` is before `start`
   *     chronologically, this number will be negative.
   */
  getMonthDistance(start: Date, end: Date) {
    return (12 * (end.getFullYear() - start.getFullYear())) + (end.getMonth() - start.getMonth());
  }

  /**
   * Gets the last day of the month for the given date.
   * @param {Date} date
   * @returns {Date}
   */
  getLastDateOfMonth(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), this.getNumberOfDaysInMonth(date), date.getHours(), date.getMinutes());
  }

  /**
   * Checks whether a date is valid.
   * @param {Date} date
   * @return {boolean} Whether the date is a valid Date.
   */
  isValidDate(date: Date) {
    return date != null && date.getTime && !isNaN(date.getTime());
  }

  /**
   * Sets a date's time to midnight.
   * @param {Date} date
   */
  setDateTimeToMidnight(date: Date) {
    if (this.isValidDate(date)) {
      date.setHours(0, 0, 0, 0);
    }
  }

  /**
   * Creates a date with the time set to midnight.
   * Drop-in replacement for two forms of the Date constructor:
   * 1. No argument for Date representing now.
   * 2. Single-argument value representing number of seconds since Unix Epoch
   * or a Date object.
   * @param {number|Date=} opt_value
   * @return {Date} New date with time set to midnight.
   */
  createDateAtMidnight(opt_value: any) {
    let date: Date;
    if (!opt_value) {
      date = new Date();
    } else {
      date = new Date(opt_value);
    }
    this.setDateTimeToMidnight(date);
    return date;
  }

  /**
   * Checks if a date is within a min and max range, ignoring the time component.
   * If minDate or maxDate are not dates, they are ignored.
   * @param {Date} date
   * @param {Date} minDate
   * @param {Date} maxDate
   */
  isDateWithinRange(date: Date, minDate: Date, maxDate: Date) {
    let dateAtMidnight = this.createDateAtMidnight(date);
    let minDateAtMidnight = this.isValidDate(minDate) ? this.createDateAtMidnight(minDate) : null;
    let maxDateAtMidnight = this.isValidDate(maxDate) ? this.createDateAtMidnight(maxDate) : null;
    return (!minDateAtMidnight || minDateAtMidnight <= dateAtMidnight) &&
      (!maxDateAtMidnight || maxDateAtMidnight >= dateAtMidnight);
  }

  /**
   * Gets a new date incremented by the given number of years. Number of years can be negative.
   * See `incrementMonths` for notes on overflow for specific dates.
   * @param {Date} date
   * @param {number} numberOfYears
   * @returns {Date}
   */
  incrementYears(date: Date, numberOfYears: number) {
    return this.incrementMonths(date, numberOfYears * 12);
  }

  /**
   * Get the integer distance between two years. This *only* considers the year portion of the
   * Date instances.
   *
   * @param {Date} start
   * @param {Date} end
   * @returns {number} Number of months between `start` and `end`. If `end` is before `start`
   *     chronologically, this number will be negative.
   */
  getYearDistance(start: Date, end: Date) {
    return end.getFullYear() - start.getFullYear();
  }

  /**
   * Clamps a date between a minimum and a maximum date.
   * @param {Date} date Date to be clamped
   * @param {Date=} minDate Minimum date
   * @param {Date=} maxDate Maximum date
   * @return {Date}
   */
  clampDate(date: Date, minDate: Date, maxDate: Date) {
    let boundDate = date;
    if (minDate && date < minDate) {
      boundDate = new Date(minDate.getTime());
    }
    if (maxDate && date > maxDate) {
      boundDate = new Date(maxDate.getTime());
    }
    return boundDate;
  }

  /**
   * Extracts and parses the timestamp from a DOM node.
   * @param  {HTMLElement} node Node from which the timestamp will be extracted.
   * @return {number} Time since epoch.
   */
  getTimestampFromNode(node: any) {
    if (node && node.hasAttribute('data-timestamp')) {
      return Number(node.getAttribute('data-timestamp'));
    }
  }

  /**
   * Checks if a month is within a min and max range, ignoring the date and time components.
   * If minDate or maxDate are not dates, they are ignored.
   * @param {Date} date
   * @param {Date} minDate
   * @param {Date} maxDate
   */
  isMonthWithinRange(date: Date, minDate: Date, maxDate: Date) {
    let month = date.getMonth();
    let year = date.getFullYear();

    return (!minDate || minDate.getFullYear() < year || minDate.getMonth() <= month) &&
      (!maxDate || maxDate.getFullYear() > year || maxDate.getMonth() >= month);
  }
}