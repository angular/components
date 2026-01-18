/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Type declarations for the Temporal API.
 *
 * The Temporal API provides modern date/time handling in JavaScript with support
 * for calendars, time zones, and internationalization.
 *
 * These declarations will be replaced by TypeScript's built-in lib.esnext.temporal
 * once it is released. See: https://github.com/microsoft/TypeScript/pull/62628
 *
 * For browsers that don't yet support Temporal natively, users should include a polyfill.
 * Popular options:
 * - `@js-temporal/polyfill` (reference implementation)
 * - `temporal-polyfill` (lightweight alternative)
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal
 * @see https://tc39.es/proposal-temporal/
 */

declare namespace Temporal {
  /**
   * Represents a date without time or timezone information.
   */
  interface PlainDate {
    readonly year: number;
    readonly month: number;
    readonly monthCode: string;
    readonly day: number;
    readonly calendarId: string;
    readonly dayOfWeek: number;
    readonly dayOfYear: number;
    readonly weekOfYear: number | undefined;
    readonly yearOfWeek: number | undefined;
    readonly daysInWeek: number;
    readonly daysInMonth: number;
    readonly daysInYear: number;
    readonly monthsInYear: number;
    readonly inLeapYear: boolean;
    readonly era: string | undefined;
    readonly eraYear: number | undefined;

    toString(): string;
    toLocaleString(locales?: string | string[], options?: Intl.DateTimeFormatOptions): string;
    toJSON(): string;
    valueOf(): never;
    toPlainDateTime(time?: PlainTimeLike): PlainDateTime;
    toPlainYearMonth(): PlainYearMonth;
    toPlainMonthDay(): PlainMonthDay;
    withCalendar(calendar: string): PlainDate;
    with(dateLike: PlainDateLike, options?: AssignmentOptions): PlainDate;
    add(duration: DurationLike, options?: ArithmeticOptions): PlainDate;
    subtract(duration: DurationLike, options?: ArithmeticOptions): PlainDate;
    until(other: PlainDateLike, options?: DifferenceOptions): Duration;
    since(other: PlainDateLike, options?: DifferenceOptions): Duration;
    equals(other: PlainDateLike): boolean;
  }

  /**
   * Static PlainDate methods and constructor.
   */
  const PlainDate: {
    prototype: PlainDate;
    new (isoYear: number, isoMonth: number, isoDay: number, calendar?: string): PlainDate;
    from(item: PlainDateLike | string, options?: AssignmentOptions): PlainDate;
    compare(one: PlainDateLike, two: PlainDateLike): number;
  };

  /**
   * Input for PlainDate operations.
   */
  interface PlainDateLike {
    year?: number;
    month?: number;
    monthCode?: string;
    day?: number;
    calendar?: string;
    era?: string;
    eraYear?: number;
  }

  /**
   * Represents a time without date or timezone information.
   */
  interface PlainTime {
    readonly hour: number;
    readonly minute: number;
    readonly second: number;
    readonly millisecond: number;
    readonly microsecond: number;
    readonly nanosecond: number;

    toString(): string;
    toJSON(): string;
    valueOf(): never;
    with(timeLike: PlainTimeLike, options?: AssignmentOptions): PlainTime;
    add(duration: DurationLike): PlainTime;
    subtract(duration: DurationLike): PlainTime;
    until(other: PlainTimeLike, options?: DifferenceOptions): Duration;
    since(other: PlainTimeLike, options?: DifferenceOptions): Duration;
    equals(other: PlainTimeLike): boolean;
    round(options: RoundTo): PlainTime;
  }

  /**
   * Static PlainTime methods and constructor.
   */
  const PlainTime: {
    prototype: PlainTime;
    new (
      hour?: number,
      minute?: number,
      second?: number,
      millisecond?: number,
      microsecond?: number,
      nanosecond?: number,
    ): PlainTime;
    from(item: PlainTimeLike | string, options?: AssignmentOptions): PlainTime;
    compare(one: PlainTimeLike, two: PlainTimeLike): number;
  };

  /**
   * Input for PlainTime operations.
   */
  interface PlainTimeLike {
    hour?: number;
    minute?: number;
    second?: number;
    millisecond?: number;
    microsecond?: number;
    nanosecond?: number;
  }

  /**
   * Represents a date and time without timezone information.
   */
  interface PlainDateTime {
    readonly year: number;
    readonly month: number;
    readonly monthCode: string;
    readonly day: number;
    readonly hour: number;
    readonly minute: number;
    readonly second: number;
    readonly millisecond: number;
    readonly microsecond: number;
    readonly nanosecond: number;
    readonly calendarId: string;
    readonly dayOfWeek: number;
    readonly dayOfYear: number;
    readonly weekOfYear: number | undefined;
    readonly yearOfWeek: number | undefined;
    readonly daysInWeek: number;
    readonly daysInMonth: number;
    readonly daysInYear: number;
    readonly monthsInYear: number;
    readonly inLeapYear: boolean;
    readonly era: string | undefined;
    readonly eraYear: number | undefined;

    toString(): string;
    toLocaleString(locales?: string | string[], options?: Intl.DateTimeFormatOptions): string;
    toJSON(): string;
    valueOf(): never;
    toPlainDate(): PlainDate;
    toPlainTime(): PlainTime;
    toPlainYearMonth(): PlainYearMonth;
    toPlainMonthDay(): PlainMonthDay;
    toZonedDateTime(timeZone: string, options?: ToZonedDateTimeOptions): ZonedDateTime;
    withCalendar(calendar: string): PlainDateTime;
    withPlainDate(date: PlainDateLike): PlainDateTime;
    withPlainTime(time?: PlainTimeLike): PlainDateTime;
    with(dateTimeLike: PlainDateTimeLike, options?: AssignmentOptions): PlainDateTime;
    add(duration: DurationLike, options?: ArithmeticOptions): PlainDateTime;
    subtract(duration: DurationLike, options?: ArithmeticOptions): PlainDateTime;
    until(other: PlainDateTimeLike, options?: DifferenceOptions): Duration;
    since(other: PlainDateTimeLike, options?: DifferenceOptions): Duration;
    equals(other: PlainDateTimeLike): boolean;
    round(options: RoundTo): PlainDateTime;
  }

  /**
   * Static PlainDateTime methods and constructor.
   */
  const PlainDateTime: {
    prototype: PlainDateTime;
    new (
      isoYear: number,
      isoMonth: number,
      isoDay: number,
      isoHour?: number,
      isoMinute?: number,
      isoSecond?: number,
      isoMillisecond?: number,
      isoMicrosecond?: number,
      isoNanosecond?: number,
      calendar?: string,
    ): PlainDateTime;
    from(item: PlainDateTimeLike | string, options?: AssignmentOptions): PlainDateTime;
    compare(one: PlainDateTimeLike, two: PlainDateTimeLike): number;
  };

  /**
   * Input for PlainDateTime operations.
   */
  interface PlainDateTimeLike {
    year?: number;
    month?: number;
    monthCode?: string;
    day?: number;
    hour?: number;
    minute?: number;
    second?: number;
    millisecond?: number;
    microsecond?: number;
    nanosecond?: number;
    calendar?: string;
    era?: string;
    eraYear?: number;
  }

  /**
   * Represents a date and time with timezone information.
   */
  interface ZonedDateTime {
    readonly year: number;
    readonly month: number;
    readonly monthCode: string;
    readonly day: number;
    readonly hour: number;
    readonly minute: number;
    readonly second: number;
    readonly millisecond: number;
    readonly microsecond: number;
    readonly nanosecond: number;
    readonly timeZoneId: string;
    readonly calendarId: string;
    readonly dayOfWeek: number;
    readonly dayOfYear: number;
    readonly weekOfYear: number | undefined;
    readonly yearOfWeek: number | undefined;
    readonly hoursInDay: number;
    readonly daysInWeek: number;
    readonly daysInMonth: number;
    readonly daysInYear: number;
    readonly monthsInYear: number;
    readonly inLeapYear: boolean;
    readonly epochMilliseconds: number;
    readonly epochNanoseconds: bigint;
    readonly offset: string;
    readonly offsetNanoseconds: number;
    readonly era: string | undefined;
    readonly eraYear: number | undefined;

    toString(options?: ZonedDateTimeToStringOptions): string;
    toJSON(): string;
    valueOf(): never;
    toPlainDate(): PlainDate;
    toPlainDateTime(): PlainDateTime;
    toPlainTime(): PlainTime;
    toPlainYearMonth(): PlainYearMonth;
    toPlainMonthDay(): PlainMonthDay;
    toInstant(): Instant;
    with(zonedDateTimeLike: Partial<ZonedDateTimeLike>, options?: AssignmentOptions): ZonedDateTime;
    withCalendar(calendar: string): ZonedDateTime;
    withTimeZone(timeZone: string): ZonedDateTime;
    withPlainDate(date: PlainDateLike): ZonedDateTime;
    withPlainTime(time?: PlainTimeLike): ZonedDateTime;
    add(duration: DurationLike, options?: ArithmeticOptions): ZonedDateTime;
    subtract(duration: DurationLike, options?: ArithmeticOptions): ZonedDateTime;
    until(other: ZonedDateTimeLike, options?: DifferenceOptions): Duration;
    since(other: ZonedDateTimeLike, options?: DifferenceOptions): Duration;
    equals(other: ZonedDateTimeLike): boolean;
    round(options: RoundTo): ZonedDateTime;
    startOfDay(): ZonedDateTime;
    getTimeZoneTransition(direction: 'next' | 'previous'): Instant | null;
  }

  /**
   * Static ZonedDateTime methods and constructor.
   */
  const ZonedDateTime: {
    prototype: ZonedDateTime;
    from(item: ZonedDateTimeLike | string, options?: ZonedDateTimeAssignmentOptions): ZonedDateTime;
    compare(one: ZonedDateTimeLike, two: ZonedDateTimeLike): number;
  };

  /**
   * Input for ZonedDateTime operations.
   */
  interface ZonedDateTimeLike {
    year?: number;
    month?: number;
    monthCode?: string;
    day?: number;
    hour?: number;
    minute?: number;
    second?: number;
    millisecond?: number;
    microsecond?: number;
    nanosecond?: number;
    offset?: string;
    timeZone: string;
    calendar?: string;
    era?: string;
    eraYear?: number;
  }

  /**
   * Represents a point in time (an instant).
   */
  interface Instant {
    readonly epochMilliseconds: number;
    readonly epochNanoseconds: bigint;

    toString(options?: InstantToStringOptions): string;
    toJSON(): string;
    valueOf(): never;
    toZonedDateTimeISO(timeZone: string): ZonedDateTime;
    toZonedDateTime(options: {timeZone: string; calendar: string}): ZonedDateTime;
    add(duration: DurationLike): Instant;
    subtract(duration: DurationLike): Instant;
    until(other: Instant, options?: DifferenceOptions): Duration;
    since(other: Instant, options?: DifferenceOptions): Duration;
    equals(other: Instant): boolean;
    round(options: RoundTo): Instant;
  }

  /**
   * Static Instant methods and constructor.
   */
  const Instant: {
    prototype: Instant;
    from(item: Instant | string): Instant;
    fromEpochMilliseconds(epochMilliseconds: number): Instant;
    fromEpochNanoseconds(epochNanoseconds: bigint): Instant;
    compare(one: Instant, two: Instant): number;
  };

  /**
   * Represents a year and month without day or time.
   */
  interface PlainYearMonth {
    readonly year: number;
    readonly month: number;
    readonly monthCode: string;
    readonly calendarId: string;
    readonly daysInMonth: number;
    readonly daysInYear: number;
    readonly monthsInYear: number;
    readonly inLeapYear: boolean;
    readonly era: string | undefined;
    readonly eraYear: number | undefined;

    toString(): string;
    toLocaleString(locales?: string | string[], options?: Intl.DateTimeFormatOptions): string;
    toJSON(): string;
    valueOf(): never;
    toPlainDate(day: {day: number}): PlainDate;
    with(yearMonthLike: PlainYearMonthLike, options?: AssignmentOptions): PlainYearMonth;
    add(duration: DurationLike, options?: ArithmeticOptions): PlainYearMonth;
    subtract(duration: DurationLike, options?: ArithmeticOptions): PlainYearMonth;
    until(other: PlainYearMonthLike, options?: DifferenceOptions): Duration;
    since(other: PlainYearMonthLike, options?: DifferenceOptions): Duration;
    equals(other: PlainYearMonthLike): boolean;
  }

  /**
   * Static PlainYearMonth methods and constructor.
   */
  const PlainYearMonth: {
    prototype: PlainYearMonth;
    new (
      isoYear: number,
      isoMonth: number,
      calendar?: string,
      referenceISODay?: number,
    ): PlainYearMonth;
    from(item: PlainYearMonthLike | string, options?: AssignmentOptions): PlainYearMonth;
    compare(one: PlainYearMonthLike, two: PlainYearMonthLike): number;
  };

  /**
   * Input for PlainYearMonth operations.
   */
  interface PlainYearMonthLike {
    year?: number;
    month?: number;
    monthCode?: string;
    calendar?: string;
    era?: string;
    eraYear?: number;
  }

  /**
   * Represents a month and day without year or time.
   */
  interface PlainMonthDay {
    readonly monthCode: string;
    readonly day: number;
    readonly calendarId: string;

    toString(): string;
    toJSON(): string;
    valueOf(): never;
    toPlainDate(year: {year: number}): PlainDate;
    with(monthDayLike: PlainMonthDayLike, options?: AssignmentOptions): PlainMonthDay;
    equals(other: PlainMonthDayLike): boolean;
  }

  /**
   * Static PlainMonthDay methods and constructor.
   */
  const PlainMonthDay: {
    prototype: PlainMonthDay;
    from(item: PlainMonthDayLike | string, options?: AssignmentOptions): PlainMonthDay;
  };

  /**
   * Input for PlainMonthDay operations.
   */
  interface PlainMonthDayLike {
    month?: number;
    monthCode?: string;
    day?: number;
    calendar?: string;
  }

  /**
   * Represents a duration of time.
   */
  interface Duration {
    readonly years: number;
    readonly months: number;
    readonly weeks: number;
    readonly days: number;
    readonly hours: number;
    readonly minutes: number;
    readonly seconds: number;
    readonly milliseconds: number;
    readonly microseconds: number;
    readonly nanoseconds: number;
    readonly sign: -1 | 0 | 1;
    readonly blank: boolean;

    toString(): string;
    toJSON(): string;
    valueOf(): never;
    with(durationLike: DurationLike): Duration;
    negated(): Duration;
    abs(): Duration;
    add(other: DurationLike, options?: DurationArithmeticOptions): Duration;
    subtract(other: DurationLike, options?: DurationArithmeticOptions): Duration;
    round(options: DurationRoundOptions): Duration;
    total(options: DurationTotalOptions): number;
  }

  /**
   * Static Duration methods and constructor.
   */
  const Duration: {
    prototype: Duration;
    new (
      years?: number,
      months?: number,
      weeks?: number,
      days?: number,
      hours?: number,
      minutes?: number,
      seconds?: number,
      milliseconds?: number,
      microseconds?: number,
      nanoseconds?: number,
    ): Duration;
    from(item: DurationLike | string): Duration;
    compare(one: DurationLike, two: DurationLike, options?: DurationCompareOptions): number;
  };

  /**
   * Input for Duration operations.
   */
  interface DurationLike {
    years?: number;
    months?: number;
    weeks?: number;
    days?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
    milliseconds?: number;
    microseconds?: number;
    nanoseconds?: number;
  }

  /**
   * The Now object provides methods for getting the current date/time.
   */
  const Now: {
    instant(): Instant;
    zonedDateTimeISO(timeZone?: string): ZonedDateTime;
    zonedDateTime(calendar: string, timeZone?: string): ZonedDateTime;
    plainDateTimeISO(timeZone?: string): PlainDateTime;
    plainDateTime(calendar: string, timeZone?: string): PlainDateTime;
    plainDateISO(timeZone?: string): PlainDate;
    plainDate(calendar: string, timeZone?: string): PlainDate;
    plainTimeISO(timeZone?: string): PlainTime;
    timeZoneId(): string;
  };

  // Options types

  interface AssignmentOptions {
    overflow?: 'constrain' | 'reject';
  }

  interface ArithmeticOptions {
    overflow?: 'constrain' | 'reject';
  }

  interface DifferenceOptions {
    largestUnit?: string;
    smallestUnit?: string;
    roundingIncrement?: number;
    roundingMode?:
      | 'ceil'
      | 'floor'
      | 'expand'
      | 'trunc'
      | 'halfCeil'
      | 'halfFloor'
      | 'halfExpand'
      | 'halfTrunc'
      | 'halfEven';
  }

  interface RoundTo {
    smallestUnit: string;
    roundingIncrement?: number;
    roundingMode?:
      | 'ceil'
      | 'floor'
      | 'expand'
      | 'trunc'
      | 'halfCeil'
      | 'halfFloor'
      | 'halfExpand'
      | 'halfTrunc'
      | 'halfEven';
  }

  interface ToZonedDateTimeOptions {
    disambiguation?: 'compatible' | 'earlier' | 'later' | 'reject';
  }

  interface ZonedDateTimeAssignmentOptions extends AssignmentOptions {
    disambiguation?: 'compatible' | 'earlier' | 'later' | 'reject';
    offset?: 'use' | 'prefer' | 'ignore' | 'reject';
  }

  interface ZonedDateTimeToStringOptions {
    calendarName?: 'auto' | 'always' | 'never' | 'critical';
    timeZoneName?: 'auto' | 'never' | 'critical';
    offset?: 'auto' | 'never';
    fractionalSecondDigits?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 'auto';
    smallestUnit?: string;
    roundingMode?:
      | 'ceil'
      | 'floor'
      | 'expand'
      | 'trunc'
      | 'halfCeil'
      | 'halfFloor'
      | 'halfExpand'
      | 'halfTrunc'
      | 'halfEven';
  }

  interface InstantToStringOptions {
    timeZone?: string;
    fractionalSecondDigits?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 'auto';
    smallestUnit?: string;
    roundingMode?:
      | 'ceil'
      | 'floor'
      | 'expand'
      | 'trunc'
      | 'halfCeil'
      | 'halfFloor'
      | 'halfExpand'
      | 'halfTrunc'
      | 'halfEven';
  }

  interface DurationArithmeticOptions {
    relativeTo?: PlainDateLike | ZonedDateTimeLike | string;
  }

  interface DurationRoundOptions {
    largestUnit?: string;
    smallestUnit?: string;
    roundingIncrement?: number;
    roundingMode?:
      | 'ceil'
      | 'floor'
      | 'expand'
      | 'trunc'
      | 'halfCeil'
      | 'halfFloor'
      | 'halfExpand'
      | 'halfTrunc'
      | 'halfEven';
    relativeTo?: PlainDateLike | ZonedDateTimeLike | string;
  }

  interface DurationTotalOptions {
    unit: string;
    relativeTo?: PlainDateLike | ZonedDateTimeLike | string;
  }

  interface DurationCompareOptions {
    relativeTo?: PlainDateLike | ZonedDateTimeLike | string;
  }
}
