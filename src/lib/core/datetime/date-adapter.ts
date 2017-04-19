/** Adapts type `D` to be usable as a date by material components that work with dates. */
export abstract class DateAdapter<D> {
  /**
   * Gets the year component of the given date.
   * @param date The date to extract the year from.
   * @returns The year component.
   */
  abstract getYear(date: D): number;

  /**
   * Gets the month component of the given date.
   * @param date The date to extract the month from.
   * @returns The month component (0-indexed, 0 = January).
   */
  abstract getMonth(date: D): number;

  /**
   * Gets the date of the month component of the given date.
   * @param date The date to extract the date of the month from.
   * @returns The month component (1-indexed, 1 = first of month).
   */
  abstract getDate(date: D): number;

  /**
   * Gets the day of the week component of the given date.
   * @param date The date to extract the day of the week from.
   * @returns The month component (0-indexed, 0 = Sunday).
   */
  abstract getDay(date: D): number;

  /**
   * Gets a list of names for the months.
   * @param style The naming style (e.g. long = 'January', short = 'Jan', narrow = 'J').
   * @param locale The locale to use.
   * @returns An ordered list of all month names, starting with January.
   */
  abstract getMonthNames(style: 'long' | 'short' | 'narrow', locale?: any): string[];

  /**
   * Gets a list of names for the dates of the month.
   * @param locale The locale to use.
   * @returns An ordered list of all date of the month names, starting with '1'.
   */
  abstract getDateNames(locale?: any): string[];

  /**
   * Gets a list of names for the weekdays.
   * @param style The naming style (e.g. long = 'Sunday', short = 'Sun', narrow = 'S').
   * @param locale The locale to use.
   * @returns An ordered list of all weekday names, starting with Sunday.
   */
  abstract getDayNames(style: 'long' | 'short' | 'narrow', locale?: any): string[];

  /**
   * Gets the name for the year of the given date.
   * @param date The date to get the year name for.
   * @param locale The locale to use.
   * @returns The name of the given year (e.g. '2017').
   */
  abstract getYearName(date: D, locale?: any): string;

  /**
   * Gets the name for the month and year of the given date.
   * @param date The date to get the month and year name for.
   * @param monthStyle The naming style for the month
   *     (e.g. long = 'January', short = 'Jan', narrow = 'J').
   * @param locale The locale to use.
   * @returns The name of the month and year of the given date (e.g. 'Jan 2017').
   */
  abstract getMonthYearName(date: D, monthStyle: 'long' | 'short' | 'narrow', locale?: any): string;

  /**
   * Gets the first day of the week.
   * @param locale The locale to use.
   * @returns The first day of the week (0-indexed, 0 = Sunday).
   */
  abstract getFirstDayOfWeek(locale?: any): number;

  /**
   * Creates a date with the given year, month, and date.
   * @param year The full year of the date. (e.g. 89 means the year 89, not the year 1989).
   * @param month The month of the date (0-indexed, 0 = January). If `month` is less than 0 or
   *     greater than 11, it should roll into the previous / next year.
   * @param date The date of month of the date. If `date` is less than 1 or greater than the number
   *     of days in the `month`, it should roll into the previous / next month.
   * @returns The new date.
   */
  abstract create(year: number, month: number, date: number): D;

  /**
   * Gets today's date.
   * @returns Today's date.
   */
  abstract today(): D;

  /**
   * Parses a date from a value.
   * @param value The value to parse.
   * @param fmt The format of the value.
   * @param locale The locale of the value.
   * @returns The parsed date, or null if date could not be parsed.
   */
  abstract parse(value: any, fmt?: any, locale?: any): D | null;

  /**
   * Formats a date as a string.
   * @param date The value to parse.
   * @param fmt The format to use for the result string.
   * @param locale The locale to use for the result string.
   * @returns The parsed date, or null if date could not be parsed.
   */
  abstract format(date: D, fmt?: any, locale?: any): string;

  /**
   * Adds the given number of years, months, and days to the given date.
   * @param date The date to add to.
   * @param amount The number of years, months, and days to add (may be negative).
   * @returns A new date equal to the original with the given amount of time added.
   */
  abstract add(date: D, amount: {years?: number, months?: number, days?: number}): D;

  /**
   * Clones the given date.
   * @param date The date to clone
   * @returns A new date equal to the given date.
   */
  clone(date: D): D {
    return this.create(this.getYear(date), this.getMonth(date), this.getDate(date));
  }

  /**
   * Compares two dates.
   * @param first The first date to compare.
   * @param second The second date to compare.
   * @returns 0 if the dates are equal, a number less than 0 if the first date is earlier,
   *     a number greater than 0 if the first date is later.
   */
  compare(first: D, second: D): number {
    return this.getYear(first) - this.getYear(second) ||
        this.getMonth(first) - this.getMonth(second) ||
        this.getDate(first) - this.getDate(second);
  }

  /**
   * Checks if two dates are equal.
   * @param first The first date to check.
   * @param second The second date to check.
   * @returns {boolean} Whether the two dates are equal.
   *     Null dates are considered equal to other null dates.
   */
  equals(first: D | null, second: D | null): boolean {
    return first && second ? !this.compare(first, second) : first == second;
  }

  /**
   * Clamp the given date between min and max dates.
   * @param date The date to clamp.
   * @param min The minimum value to allow. If null or omitted no min is enforced.
   * @param max The maximum value to allow. If null or omitted no max is enforced.
   * @returns `min` if `date` is less than `min`, `max` if date is greater than `max`,
   *     otherwise `date`.
   */
  clamp(date: D, min?: D | null, max?: D | null): D {
    if (min && this.compare(date, min) < 0) {
      return min;
    }
    if (max && this.compare(date, max) > 0) {
      return max;
    }
    return date;
  }
}
