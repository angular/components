/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injectable, InjectionToken, inject} from '@angular/core';
import {DateAdapter, MAT_DATE_LOCALE} from '@angular/material/core';

/**
 * Valid calendar identifiers supported by the Temporal API.
 *
 * Common calendars include:
 * - 'iso8601' - ISO 8601 calendar (default, equivalent to Gregorian)
 * - 'gregory' - Gregorian calendar
 * - 'hebrew' - Hebrew calendar
 * - 'islamic' - Islamic calendar
 * - 'japanese' - Japanese calendar with era
 * - 'chinese' - Chinese calendar
 * - 'persian' - Persian/Solar Hijri calendar
 * - 'buddhist' - Buddhist calendar (Thai)
 * - 'indian' - Indian National Calendar
 * - 'ethiopic' - Ethiopian calendar
 * - 'coptic' - Coptic calendar
 *
 * For a complete list of supported calendars, see:
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/calendar
 * @see https://tc39.es/proposal-temporal/docs/calendars.html
 */
export type TemporalCalendarId = string;

/**
 * Represents a date in the Temporal API format.
 * Can be a PlainDate, PlainDateTime, or ZonedDateTime depending on the adapter mode.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal/PlainDate
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal/PlainDateTime
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal/ZonedDateTime
 */
export type TemporalDateType = Temporal.PlainDate | Temporal.PlainDateTime | Temporal.ZonedDateTime;

/**
 * Mode for the Temporal adapter - determines which type is used internally.
 * - 'date': Uses Temporal.PlainDate (for date-only pickers, no time/timezone)
 * - 'datetime': Uses Temporal.PlainDateTime (for date-time pickers, no timezone)
 * - 'zoned': Uses Temporal.ZonedDateTime (for date-time with timezone)
 */
export type TemporalAdapterMode = 'date' | 'datetime' | 'zoned';

/** Disambiguation options for converting local date-times to time zones. */
export type TemporalDisambiguation = 'compatible' | 'earlier' | 'later' | 'reject';

/** Offset handling options for ambiguous offsets when parsing zoned strings. */
export type TemporalOffsetOption = 'use' | 'ignore' | 'reject' | 'prefer';

/** Rounding modes supported by Temporal rounding APIs. */
export type TemporalRoundingMode = 'ceil' | 'floor' | 'trunc' | 'halfExpand';

/** Rounding units supported by Temporal rounding APIs. */
export type TemporalRoundingUnit =
  | 'day'
  | 'hour'
  | 'minute'
  | 'second'
  | 'millisecond'
  | 'microsecond'
  | 'nanosecond'
  | 'days'
  | 'hours'
  | 'minutes'
  | 'seconds'
  | 'milliseconds'
  | 'microseconds'
  | 'nanoseconds';

/** Rounding options applied to zoned date-times before output/serialization. */
export interface TemporalRoundingOptions {
  smallestUnit: TemporalRoundingUnit;
  roundingIncrement?: number;
  roundingMode?: TemporalRoundingMode;
}

/** Configurable options for the `TemporalDateAdapter`. */
export interface MatTemporalDateAdapterOptionsBase {
  /**
   * The calendar system to use for date calculations.
   * Defaults to 'iso8601' (ISO 8601 calendar, equivalent to Gregorian).
   *
   * Pass a calendar ID string. You can get the user's preferred calendar from:
   * `new Intl.DateTimeFormat().resolvedOptions().calendar`
   *
   * Common calendar IDs:
   * - 'iso8601' - ISO 8601 calendar (default)
   * - 'gregory' - Gregorian calendar
   * - 'hebrew', 'islamic', 'japanese', 'chinese', 'persian', 'buddhist'
   *
   * @see https://tc39.es/proposal-temporal/docs/calendars.html
   */
  calendar: TemporalCalendarId;

  /**
   * The calendar system to use for output/formatting.
   * If not set, the adapter uses `calendar` for both calculations and output.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal/PlainDate/withCalendar
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal/ZonedDateTime/withCalendar
   */
  outputCalendar?: TemporalCalendarId;

  /**
   * Sets the first day of week.
   * Changing this will change how Angular Material components like DatePicker shows start of week.
   * If not set, it will be determined from the locale.
   */
  firstDayOfWeek?: number;

  /**
   * How to handle out-of-range values in date creation.
   * - 'reject': Throw an error for invalid dates like Feb 31 (default, strict mode)
   * - 'constrain': Clamp to the nearest valid value (Feb 31 → Feb 28/29)
   *
   * This is similar to Moment.js strict mode, but applies to date values rather than format.
   *
   * @example
   * ```typescript
   * // Strict mode (default) - Feb 31 throws error
   * { mode: 'date', overflow: 'reject' }
   *
   * // Lenient mode - Feb 31 becomes Feb 28/29
   * { mode: 'date', overflow: 'constrain' }
   * ```
   */
  overflow?: 'reject' | 'constrain';
}

export type MatTemporalDateAdapterOptions =
  | (MatTemporalDateAdapterOptionsBase & {
      /**
       * The mode for the adapter, determining which Temporal type to use.
       * - 'date': Uses Temporal.PlainDate (default, for date-only pickers)
       * - 'datetime': Uses Temporal.PlainDateTime (for date-time pickers without timezone)
       */
      mode?: 'date' | 'datetime';
      /** Timezone is only valid for zoned mode. */
      timezone?: never;
    })
  | (MatTemporalDateAdapterOptionsBase & {
      /**
       * The mode for the adapter, determining which Temporal type to use.
       * - 'zoned': Uses Temporal.ZonedDateTime (for date-time pickers with timezone)
       */
      mode: 'zoned';
      /**
       * The timezone to use when mode is 'zoned'.
       * Can be an IANA timezone identifier (e.g., 'America/New_York', 'Europe/London')
       * or 'UTC' for UTC time.
       * Defaults to system timezone if mode is 'zoned' and timezone is not specified.
       *
       * @example
       * ```typescript
       * // Use UTC timezone (similar to useUtc: true in Moment/Luxon adapters)
       * { mode: 'zoned', timezone: 'UTC' }
       *
       * // Use specific timezone
       * { mode: 'zoned', timezone: 'America/New_York' }
       *
       * // Use system timezone (default)
       * { mode: 'zoned' }
       * ```
       */
      timezone?: string;

      /**
       * How to resolve ambiguous or nonexistent local times when converting to ZonedDateTime.
       * Defaults to Temporal's "compatible" behavior.
       *
       * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal/PlainDateTime/toZonedDateTime
       * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal/ZonedDateTime/from
       */
      disambiguation?: TemporalDisambiguation;

      /**
       * How to resolve offset ambiguity when parsing zoned strings with explicit offsets.
       * Defaults to Temporal's "reject" behavior.
       *
       * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal/ZonedDateTime/from
       */
      offset?: TemporalOffsetOption;

      /**
       * Optional rounding applied to zoned values before output/serialization.
       *
       * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal/ZonedDateTime/round
       */
      rounding?: TemporalRoundingOptions;
    });

/** InjectionToken for TemporalDateAdapter to configure options. */
export const MAT_TEMPORAL_DATE_ADAPTER_OPTIONS = new InjectionToken<MatTemporalDateAdapterOptions>(
  'MAT_TEMPORAL_DATE_ADAPTER_OPTIONS',
  {
    providedIn: 'root',
    factory: () => ({
      calendar: 'iso8601',
      mode: 'date',
      overflow: 'reject',
    }),
  },
);

/**
 * Extended Intl namespace with Locale constructor.
 * This interface provides typing for features that may not be available
 * in all browsers or TypeScript versions.
 */
interface IntlWithLocale {
  Locale?: {
    new (localeTag: string): {
      getWeekInfo?: () => {firstDay: number};
      weekInfo?: {firstDay: number};
    };
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

/**
 * DateAdapter implementation using the Temporal API.
 *
 * The Temporal API provides modern, immutable date/time handling with proper
 * support for calendars, time zones, and internationalization.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal
 *
 * Note: The Temporal API may require a polyfill in browsers without native support.
 * Popular polyfill options include:
 * - `@js-temporal/polyfill` (reference implementation)
 * - `temporal-polyfill` (lightweight alternative)
 *
 * Install one of these and ensure it's loaded before using this adapter.
 */
@Injectable()
export class TemporalDateAdapter extends DateAdapter<TemporalDateType> {
  private readonly _calendar: TemporalCalendarId;
  private readonly _outputCalendar: TemporalCalendarId | null;
  private readonly _firstDayOfWeek: number | undefined;
  private readonly _mode: TemporalAdapterMode;
  private _timezone: string | null;
  private readonly _overflow: 'reject' | 'constrain';
  private readonly _disambiguation?: TemporalDisambiguation;
  private readonly _offset?: TemporalOffsetOption;
  private readonly _rounding?: TemporalRoundingOptions;

  constructor(...args: unknown[]);

  constructor() {
    super();

    const dateLocale = inject(MAT_DATE_LOCALE, {optional: true});
    const options = inject<MatTemporalDateAdapterOptions>(MAT_TEMPORAL_DATE_ADAPTER_OPTIONS, {
      optional: true,
    });

    this._calendar = options?.calendar || 'iso8601';
    this._outputCalendar = options?.outputCalendar ?? null;
    this._firstDayOfWeek = options?.firstDayOfWeek;
    this._mode = options?.mode || 'date';
    this._overflow = options?.overflow || 'reject';
    // For zoned mode, use provided timezone or resolve to system timezone lazily.
    this._timezone = options?.timezone ?? null;
    const zonedOptions = options && options.mode === 'zoned' ? options : null;
    this._disambiguation = zonedOptions?.disambiguation;
    this._offset = zonedOptions?.offset;
    this._rounding = zonedOptions?.rounding;
    this.setLocale(dateLocale || this._getDefaultLocale());
  }

  /** Gets the year component of the given date. */
  getYear(date: TemporalDateType): number {
    return date.year;
  }

  /**
   * Gets the month component of the given date.
   * Returns 0-indexed month (0 = January) to match DateAdapter interface.
   * Note: Temporal uses 1-indexed months internally.
   */
  getMonth(date: TemporalDateType): number {
    // Temporal uses 1-indexed months, DateAdapter expects 0-indexed
    return date.month - 1;
  }

  /** Gets the date of the month component of the given date. */
  getDate(date: TemporalDateType): number {
    return date.day;
  }

  /**
   * Gets the day of the week component of the given date.
   * Returns 0-indexed day (0 = Sunday) to match DateAdapter interface.
   * Note: Temporal uses 1-indexed days starting from Monday.
   */
  getDayOfWeek(date: TemporalDateType): number {
    // Temporal.dayOfWeek is 1 (Monday) to 7 (Sunday)
    // DateAdapter expects 0 (Sunday) to 6 (Saturday)
    const temporalDayOfWeek = date.dayOfWeek;
    return temporalDayOfWeek === 7 ? 0 : temporalDayOfWeek;
  }

  /** Gets a list of names for the months. */
  getMonthNames(style: 'long' | 'short' | 'narrow'): string[] {
    const monthsInYear = this._getMonthsInYearForOutput(2017);

    const options: Intl.DateTimeFormatOptions = {
      month: style,
      calendar: this._getOutputCalendarId(),
    };

    return range(monthsInYear, i => {
      // Create a date in the middle of each month to avoid edge cases
      const date = Temporal.PlainDate.from({
        year: 2017,
        month: i + 1,
        day: 1,
        calendar: this._getOutputCalendarId(),
      });
      return this._formatWithLocale(date, options);
    });
  }

  /** Gets a list of names for the dates of the month. */
  getDateNames(): string[] {
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      calendar: this._getOutputCalendarId(),
    };

    return range(31, i => {
      const date = Temporal.PlainDate.from({
        year: 2017,
        month: 1,
        day: i + 1,
        calendar: this._getOutputCalendarId(),
      });
      return this._formatWithLocale(date, options);
    });
  }

  /** Gets a list of names for the days of the week. */
  getDayOfWeekNames(style: 'long' | 'short' | 'narrow'): string[] {
    const options: Intl.DateTimeFormatOptions = {
      weekday: style,
    };

    // Generate names starting from Sunday (day 0)
    // January 1, 2017 was a Sunday
    // Day-of-week names are locale-dependent, not calendar-dependent,
    // so we format directly without calendar conversion.
    return range(7, i => {
      const date = Temporal.PlainDate.from({
        year: 2017,
        month: 1,
        day: 1 + i,
        calendar: 'iso8601',
      });
      return date.toLocaleString(this.locale, options).replace(/[\u200e\u200f]/g, '');
    });
  }

  /** Gets the name for the year of the given date. */
  getYearName(date: TemporalDateType): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      calendar: this._getOutputCalendarId(),
    };
    return this._formatWithLocale(date, options);
  }

  /** Gets the first day of the week. */
  getFirstDayOfWeek(): number {
    if (this._firstDayOfWeek !== undefined) {
      return this._firstDayOfWeek;
    }

    // Try to get first day from Intl.Locale if available
    const intlWithLocale = Intl as IntlWithLocale;
    if (typeof Intl !== 'undefined' && intlWithLocale.Locale) {
      try {
        const locale = new intlWithLocale.Locale(this.locale);

        const firstDay = (locale.getWeekInfo?.() || locale.weekInfo)?.firstDay ?? 0;
        // weekInfo.firstDay is 1-7 (Monday-Sunday), we need 0-6 (Sunday-Saturday)
        return firstDay === 7 ? 0 : firstDay;
      } catch {
        // Fall through to default
      }
    }

    // Default to Sunday
    return 0;
  }

  /** Gets the number of days in the month of the given date. */
  getNumDaysInMonth(date: TemporalDateType): number {
    return date.daysInMonth;
  }

  /**
   * Clones the given date.
   * Note: Temporal objects are immutable, so the original cannot be mutated.
   * However, we still create a new object because:
   * 1. The DateAdapter interface contract specifies "A new date"
   * 2. Consumer code may use reference equality checks (clone !== original)
   * 3. Consistency with other date adapters (NativeDateAdapter, LuxonDateAdapter)
   */
  clone(date: TemporalDateType): TemporalDateType {
    // Use from(date) instead of from(date.toString()) to preserve sub-millisecond precision
    // Note: ZonedDateTime.from() requires a string since the object lacks 'timeZone' property
    if (this._isZonedDateTime(date)) {
      return Temporal.ZonedDateTime.from(date.toString());
    }
    if (this._isPlainDateTime(date)) {
      return Temporal.PlainDateTime.from(date);
    }
    return Temporal.PlainDate.from(date);
  }

  /**
   * Creates a date with the given year, month, and date.
   * Month is 0-indexed (0 = January) to match DateAdapter interface.
   */
  createDate(year: number, month: number, date: number): TemporalDateType {
    // Only validate in dev mode when using reject overflow
    if ((typeof ngDevMode === 'undefined' || ngDevMode) && this._overflow === 'reject') {
      const monthsInYear = this._getMonthsInYearForDate(year);
      if (month < 0 || month > monthsInYear - 1) {
        throw Error(
          `Invalid month index "${month}". Month index has to be between 0 and ${monthsInYear - 1}.`,
        );
      }

      if (date < 1) {
        throw Error(`Invalid date "${date}". Date has to be greater than 0.`);
      }
    }

    try {
      // Temporal uses 1-indexed months
      const temporalMonth = month + 1;
      const overflowOption = {overflow: this._overflow};

      if (this._mode === 'zoned') {
        return Temporal.ZonedDateTime.from(
          {
            year,
            month: temporalMonth,
            day: date,
            hour: 0,
            minute: 0,
            second: 0,
            timeZone: this._getTimeZoneId(),
            calendar: this._getCalendarId(),
          },
          this._getZonedFromOptions(),
        );
      } else if (this._mode === 'datetime') {
        return Temporal.PlainDateTime.from(
          {
            year,
            month: temporalMonth,
            day: date,
            hour: 0,
            minute: 0,
            second: 0,
            calendar: this._getCalendarId(),
          },
          overflowOption,
        );
      } else {
        // 'date' mode
        return Temporal.PlainDate.from(
          {
            year,
            month: temporalMonth,
            day: date,
            calendar: this._getCalendarId(),
          },
          overflowOption,
        );
      }
    } catch (e) {
      if ((typeof ngDevMode === 'undefined' || ngDevMode) && this._overflow === 'reject') {
        throw Error(`Invalid date "${date}" for month with index "${month}".`);
      }
      return this.invalid();
    }
  }

  /** Gets today's date. */
  today(): TemporalDateType {
    if (this._mode === 'zoned') {
      return Temporal.Now.zonedDateTimeISO(this._getTimeZoneId()).withCalendar(
        this._getCalendarId(),
      );
    }
    if (this._mode === 'datetime') {
      return Temporal.Now.plainDateTimeISO().withCalendar(this._getCalendarId());
    }
    return Temporal.Now.plainDateISO().withCalendar(this._getCalendarId());
  }

  /**
   * Parses a date from a user-provided value.
   *
   * Similar to NativeDateAdapter, this method uses the native parsing capabilities:
   * - For strings: Uses Temporal.from() which accepts ISO 8601 format
   * - For numbers: Treats as epoch milliseconds
   * - For Date objects: Extracts components directly
   *
   * The parseFormat parameter is ignored since Temporal has built-in ISO 8601 parsing.
   *
   * @param value The value to parse.
   * @param parseFormat Ignored - Temporal handles parsing formats natively.
   * @returns The parsed Temporal date, or null/invalid if parsing failed.
   */
  parse(value: unknown, parseFormat?: any): TemporalDateType | null {
    // Temporal adapter only handles Temporal types, strings, and numbers
    // Unlike NativeDateAdapter, we don't accept JS Date - use Temporal types instead
    if (typeof value === 'number') {
      return this._createFromEpochMs(value);
    }
    if (typeof value === 'string') {
      return value ? (this._parseString(value) ?? this.invalid()) : null;
    }
    if (this._isTemporalDateType(value)) {
      return this.clone(value);
    }
    return value ? this.invalid() : null;
  }

  /**
   * Formats a date as a localized string using Temporal's locale formatting.
   *
   * This method only accepts `Intl.DateTimeFormatOptions` objects, following the same
   * approach as the NativeDateAdapter.
   *
   * @param date The date to format.
   * @param displayFormat The Intl.DateTimeFormatOptions to use for formatting.
   * @returns The formatted date string.
   */
  format(date: TemporalDateType, displayFormat: Intl.DateTimeFormatOptions): string {
    if (!this.isValid(date)) {
      throw Error('TemporalDateAdapter: Cannot format invalid date.');
    }

    const options: Intl.DateTimeFormatOptions = {
      ...displayFormat,
      calendar: this._getOutputCalendarId(),
    };

    const dateForFormat = this._isZonedDateTime(date)
      ? this._maybeRoundZoned(this._toZonedDateTime(date))
      : date;
    return this._formatWithLocale(dateForFormat, options);
  }

  /** Adds the given number of years to the date. */
  addCalendarYears(date: TemporalDateType, years: number): TemporalDateType {
    return date.add({years}, {overflow: this._overflow}) as TemporalDateType;
  }

  /** Adds the given number of months to the date. */
  addCalendarMonths(date: TemporalDateType, months: number): TemporalDateType {
    return date.add({months}, {overflow: this._overflow}) as TemporalDateType;
  }

  /** Adds the given number of days to the date. */
  addCalendarDays(date: TemporalDateType, days: number): TemporalDateType {
    return date.add({days}, {overflow: this._overflow}) as TemporalDateType;
  }

  /** Gets the RFC 3339 compatible string for the given date. */
  toIso8601(date: TemporalDateType): string {
    if (this._isZonedDateTime(date)) {
      // For ZonedDateTime, return the full ISO string with timezone
      return this._maybeRoundZoned(this._toZonedDateTime(date)).toString();
    }
    if (this._isPlainDateTime(date)) {
      // For PlainDateTime, return date portion only for consistency
      return date.toPlainDate().toString();
    }
    return date.toString();
  }

  /**
   * Deserializes a value to a valid date object.
   * Accepts ISO 8601 strings and Temporal types only.
   * Unlike NativeDateAdapter, JS Date is not supported - use Temporal types.
   */
  override deserialize(value: unknown): TemporalDateType | null {
    if (typeof value === 'string') {
      if (!value) {
        return null;
      }
      const parsed = this._parseString(value);
      if (parsed && this.isValid(parsed)) {
        return parsed;
      }
      return this.invalid();
    }
    // Temporal types handled by super.deserialize() via isDateInstance()
    return super.deserialize(value);
  }

  /** Checks whether the given object is a date instance. */
  isDateInstance(obj: unknown): obj is TemporalDateType {
    return this._isTemporalDateType(obj);
  }

  /** Checks whether the given date is valid. */
  isValid(date: TemporalDateType): boolean {
    // Temporal doesn't create invalid dates - it throws instead.
    // Our invalid() returns a sentinel object with NaN values and _invalid marker.
    if ((date as {_invalid?: boolean})._invalid === true) {
      return false;
    }
    return date != null && typeof date.year === 'number' && !isNaN(date.year);
  }

  /**
   * Gets date instance that is not valid.
   *
   * Note: The Temporal API does not support invalid dates like `Date(NaN)`.
   * Instead, we return a sentinel object with NaN values that will be detected
   * by the `isValid()` method. This object should not be used for any date
   * operations - only for representing an invalid state.
   *
   * @returns A sentinel object representing an invalid date.
   */
  invalid(): TemporalDateType {
    // Temporal doesn't support invalid dates like Date(NaN).
    // Return sentinel with _invalid marker and NaN values.
    const baseInvalid = {
      _invalid: true as const,
      year: NaN,
      month: NaN,
      day: NaN,
      calendarId: this._getCalendarId(),
      dayOfWeek: NaN,
      daysInMonth: NaN,
      monthsInYear: NaN,
    };

    if (this._mode === 'zoned') {
      return {
        ...baseInvalid,
        hour: NaN,
        minute: NaN,
        second: NaN,
        millisecond: NaN,
        timeZoneId: this._getTimeZoneId(),
        epochNanoseconds: BigInt(0),
      } as unknown as Temporal.ZonedDateTime;
    }

    if (this._mode === 'datetime') {
      return {
        ...baseInvalid,
        hour: NaN,
        minute: NaN,
        second: NaN,
        millisecond: NaN,
      } as unknown as Temporal.PlainDateTime;
    }

    return baseInvalid as unknown as Temporal.PlainDate;
  }

  /**
   * Sets the time of a date.
   *
   * Note: When the adapter is in 'date' mode and the target is a PlainDate,
   * this method will convert it to a PlainDateTime. If you need to preserve
   * the PlainDate type, consider using 'datetime' mode from the start.
   *
   * @param target Date whose time will be set.
   * @param hours New hours to set (0-23).
   * @param minutes New minutes to set (0-59).
   * @param seconds New seconds to set (0-59).
   * @returns A new date with the specified time. May be PlainDateTime even if input was PlainDate.
   */
  override setTime(
    target: TemporalDateType,
    hours: number,
    minutes: number,
    seconds: number,
  ): TemporalDateType {
    // Validate inputs are finite numbers within valid ranges
    // These checks always run (not just in dev mode) to prevent NaN/Infinity propagation
    if (!Number.isFinite(hours) || hours < 0 || hours > 23) {
      if (typeof ngDevMode === 'undefined' || ngDevMode) {
        throw Error(
          `Invalid hours "${hours}". Hours value must be a finite number between 0 and 23.`,
        );
      }
      return this.invalid();
    }

    if (!Number.isFinite(minutes) || minutes < 0 || minutes > 59) {
      if (typeof ngDevMode === 'undefined' || ngDevMode) {
        throw Error(
          `Invalid minutes "${minutes}". Minutes value must be a finite number between 0 and 59.`,
        );
      }
      return this.invalid();
    }

    if (!Number.isFinite(seconds) || seconds < 0 || seconds > 59) {
      if (typeof ngDevMode === 'undefined' || ngDevMode) {
        throw Error(
          `Invalid seconds "${seconds}". Seconds value must be a finite number between 0 and 59.`,
        );
      }
      return this.invalid();
    }

    // In 'date' mode, time is not supported
    if (this._mode === 'date') {
      if (typeof ngDevMode === 'undefined' || ngDevMode) {
        console.warn(
          'TemporalDateAdapter.setTime: Called in date mode. ' +
            'Use mode: "datetime" or "zoned" for date+time scenarios.',
        );
      }
      return target;
    }

    if (this._isZonedDateTime(target)) {
      return Temporal.ZonedDateTime.from(
        {
          year: target.year,
          month: target.month,
          day: target.day,
          hour: hours,
          minute: minutes,
          second: seconds,
          millisecond: 0,
          timeZone: this._toZonedDateTime(target).timeZoneId,
          calendar: this._getCalendarId(),
        },
        this._getZonedFromOptions(),
      );
    }

    if (this._isPlainDateTime(target)) {
      return target.with({hour: hours, minute: minutes, second: seconds, millisecond: 0});
    }

    // If target is PlainDate, convert to PlainDateTime (or ZonedDateTime in zoned mode)
    if (this._mode === 'zoned') {
      return this._toPlainDate(target)
        .toPlainDateTime({hour: hours, minute: minutes, second: seconds})
        .toZonedDateTime(this._getTimeZoneId(), this._getDisambiguationOption());
    }
    return this._toPlainDate(target).toPlainDateTime({
      hour: hours,
      minute: minutes,
      second: seconds,
    });
  }

  /** Gets the hours component of the given date. */
  override getHours(date: TemporalDateType): number {
    if (this._isZonedDateTime(date)) {
      return this._toZonedDateTime(date).hour;
    }
    if (this._isPlainDateTime(date)) {
      return date.hour;
    }
    return 0;
  }

  /** Gets the minutes component of the given date. */
  override getMinutes(date: TemporalDateType): number {
    if (this._isZonedDateTime(date)) {
      return this._toZonedDateTime(date).minute;
    }
    if (this._isPlainDateTime(date)) {
      return date.minute;
    }
    return 0;
  }

  /** Gets the seconds component of the given date. */
  override getSeconds(date: TemporalDateType): number {
    if (this._isZonedDateTime(date)) {
      return this._toZonedDateTime(date).second;
    }
    if (this._isPlainDateTime(date)) {
      return date.second;
    }
    return 0;
  }

  /** Parses a time string into a date object. */
  override parseTime(value: unknown, parseFormat: string | string[]): TemporalDateType | null {
    // In 'date' mode, time parsing is not supported
    if (this._mode === 'date') {
      return this.invalid();
    }

    // Handle empty or undefined values
    if (value == null || value === '') {
      return null;
    }

    if (typeof value === 'string') {
      // Treat whitespace-only strings as invalid, not null
      if (value.trim() === '') {
        return this.invalid();
      }

      // Reject very long strings to prevent potential DoS
      if (value.length > 32) {
        return this.invalid();
      }

      const timeMatch = value
        .toUpperCase()
        .match(/^(\d?\d)[:.](\d?\d)(?:[:.](\d?\d))?\s*(AM|PM)?$/i);

      if (timeMatch) {
        // Additional bounds check: reject obviously invalid digit sequences
        if (timeMatch[1].length > 2 || timeMatch[2].length > 2 || (timeMatch[3]?.length ?? 0) > 2) {
          return this.invalid();
        }

        let hours = parseInt(timeMatch[1], 10);
        const minutes = parseInt(timeMatch[2], 10);
        const seconds = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;
        const amPm = timeMatch[4] as 'AM' | 'PM' | undefined;

        if (hours === 12) {
          hours = amPm === 'AM' ? 0 : hours;
        } else if (amPm === 'PM') {
          hours += 12;
        }

        if (
          hours >= 0 &&
          hours <= 23 &&
          minutes >= 0 &&
          minutes <= 59 &&
          seconds >= 0 &&
          seconds <= 59
        ) {
          return this.setTime(this.today(), hours, minutes, seconds);
        }
      }

      // Try parsing as ISO time
      try {
        const time = Temporal.PlainTime.from(value);
        return this.setTime(this.today(), time.hour, time.minute, time.second);
      } catch {
        return this.invalid();
      }
    }

    return this.parse(value, parseFormat);
  }

  /**
   * Adds seconds to the date.
   *
   * Note: When the input is a PlainDate, this method will convert it to
   * a PlainDateTime starting at midnight (00:00:00) before adding seconds.
   * The result will be a PlainDateTime (or ZonedDateTime in 'zoned' mode).
   *
   * @param date Date to which to add seconds.
   * @param amount Amount of seconds to add (may be negative).
   * @returns A new date with the seconds added. May be PlainDateTime even if input was PlainDate.
   */
  override addSeconds(date: TemporalDateType, amount: number): TemporalDateType {
    if (this._mode === 'date') {
      if (typeof ngDevMode === 'undefined' || ngDevMode) {
        console.warn(
          'TemporalDateAdapter.addSeconds: Called in date mode. ' +
            'Use mode: "datetime" or "zoned" for date+time scenarios.',
        );
      }
      return date;
    }

    if (this._isZonedDateTime(date)) {
      return this._toZonedDateTime(date).add({seconds: amount});
    }

    if (this._isPlainDateTime(date)) {
      // PlainDateTime has add method with seconds support
      return this._toPlainDateTime(date).add({seconds: amount});
    }

    // For PlainDate, we need to convert to PlainDateTime first
    const dateTime = this._toPlainDate(date).toPlainDateTime({hour: 0, minute: 0, second: 0});
    if (this._mode === 'zoned') {
      return dateTime
        .toZonedDateTime(this._getTimeZoneId(), this._getDisambiguationOption())
        .add({seconds: amount});
    }
    return dateTime.add({seconds: amount});
  }

  // ========================
  // Private helper methods
  // ========================

  /** Gets the default locale from the browser or system. */
  private _getDefaultLocale(): string {
    if (typeof navigator !== 'undefined' && navigator.language) {
      return navigator.language;
    }
    return 'en-US';
  }

  /** Gets the calendar ID string. */
  private _getCalendarId(): string {
    return this._calendar;
  }

  /** Gets the calendar ID string for output/formatting. */
  private _getOutputCalendarId(): string {
    return this._outputCalendar || this._calendar;
  }

  /** Gets the timezone ID, resolving to system timezone lazily if not provided. */
  private _getTimeZoneId(): string {
    if (this._timezone) {
      return this._timezone;
    }
    this._timezone = Temporal.Now.timeZoneId();
    return this._timezone;
  }

  /** Gets options for Temporal.ZonedDateTime.from. */
  private _getZonedFromOptions(): {
    overflow?: 'reject' | 'constrain';
    disambiguation?: TemporalDisambiguation;
    offset?: TemporalOffsetOption;
  } {
    return {
      overflow: this._overflow,
      disambiguation: this._disambiguation,
      offset: this._offset,
    };
  }

  /** Gets options for converting PlainDateTime to ZonedDateTime. */
  private _getDisambiguationOption(): {disambiguation?: TemporalDisambiguation} | undefined {
    return this._disambiguation ? {disambiguation: this._disambiguation} : undefined;
  }

  /** Applies rounding to zoned values when configured. */
  private _maybeRoundZoned(date: Temporal.ZonedDateTime): Temporal.ZonedDateTime {
    if (!this._rounding) {
      return date;
    }
    return date.round(this._rounding);
  }

  /** Gets the number of months in a specific year for the configured calendar. */
  private _getMonthsInYearForDate(year: number): number {
    try {
      const refDate = Temporal.PlainDate.from({
        year,
        month: 1,
        day: 1,
        calendar: this._getCalendarId(),
      });
      return refDate.monthsInYear;
    } catch {
      return 12; // Fallback to standard calendar
    }
  }

  /** Gets the number of months in a specific year for the output calendar. */
  private _getMonthsInYearForOutput(year: number): number {
    try {
      const refDate = Temporal.PlainDate.from({
        year,
        month: 1,
        day: 1,
        calendar: this._getOutputCalendarId(),
      });
      return refDate.monthsInYear;
    } catch {
      return 12;
    }
  }

  /** Formats a Temporal date using its built-in locale formatter. */
  private _formatWithLocale(date: TemporalDateType, options: Intl.DateTimeFormatOptions): string {
    const outputCalendar = this._getOutputCalendarId();
    const dateForOutput =
      outputCalendar === (date as {calendarId?: string}).calendarId
        ? date
        : date.withCalendar(outputCalendar);
    const temporal = dateForOutput as unknown as {
      toLocaleString: (locales?: string | string[], options?: Intl.DateTimeFormatOptions) => string;
    };
    return temporal.toLocaleString(this.locale, options).replace(/[\u200e\u200f]/g, '');
  }

  /** Checks if a value is a Temporal.PlainDateTime. */
  private _isPlainDateTime(value: unknown): value is Temporal.PlainDateTime {
    return (
      value != null &&
      typeof value === 'object' &&
      value instanceof (Temporal.PlainDateTime as unknown as new (...args: unknown[]) => unknown)
    );
  }

  /**
   * Checks if a value is a valid Temporal date type or an invalid date sentinel.
   */
  private _isTemporalDateType(value: unknown): value is TemporalDateType {
    if (value == null || typeof value !== 'object') {
      return false;
    }

    // Check for our sentinel invalid date object
    if ((value as {_invalid?: boolean})._invalid === true) {
      return true;
    }

    return (
      value instanceof (Temporal.PlainDate as unknown as new (...args: unknown[]) => unknown) ||
      value instanceof (Temporal.PlainDateTime as unknown as new (...args: unknown[]) => unknown) ||
      value instanceof (Temporal.ZonedDateTime as unknown as new (...args: unknown[]) => unknown)
    );
  }

  /**
   * Checks if a value is a Temporal.ZonedDateTime.
   */
  private _isZonedDateTime(value: unknown): value is Temporal.ZonedDateTime {
    if (value == null || typeof value !== 'object') {
      return false;
    }

    return (
      value instanceof (Temporal.ZonedDateTime as unknown as new (...args: unknown[]) => unknown)
    );
  }

  /**
   * Converts a TemporalDateType to Temporal.PlainDate for internal use.
   * This is needed because our public interface doesn't expose Temporal types directly.
   */
  private _toPlainDate(date: TemporalDateType): Temporal.PlainDate {
    if (this._isZonedDateTime(date)) {
      return this._toZonedDateTime(date).toPlainDate();
    }
    if (this._isPlainDateTime(date)) {
      return this._toPlainDateTime(date).toPlainDate();
    }
    return date as Temporal.PlainDate;
  }

  /**
   * Converts a TemporalDateType to Temporal.PlainDateTime for internal use.
   * This is needed because our public interface doesn't expose Temporal types directly.
   */
  private _toPlainDateTime(date: TemporalDateType): Temporal.PlainDateTime {
    if (this._isZonedDateTime(date)) {
      return this._toZonedDateTime(date).toPlainDateTime();
    }
    if (this._isPlainDateTime(date)) {
      return date;
    }
    // Must be PlainDate - convert to PlainDateTime at midnight
    return (date as Temporal.PlainDate).toPlainDateTime({hour: 0, minute: 0, second: 0});
  }

  /**
   * Converts a TemporalDateType to Temporal.ZonedDateTime for internal use.
   * This is needed because our public interface doesn't expose Temporal types directly.
   */
  private _toZonedDateTime(date: TemporalDateType): Temporal.ZonedDateTime {
    return date as unknown as Temporal.ZonedDateTime;
  }

  /**
   * Creates a Temporal date from epoch milliseconds.
   * Uses local timezone for date/datetime modes, configured timezone for zoned modes.
   */
  private _createFromEpochMs(ms: number): TemporalDateType {
    // Validate input: must be a finite number within JavaScript's Date range
    // (±8.64e15 ms from Unix epoch, approximately ±273,000 years)
    if (!Number.isFinite(ms) || ms > 8.64e15 || ms < -8.64e15) {
      return this.invalid();
    }

    try {
      const instant = Temporal.Instant.fromEpochMilliseconds(ms);
      if (this._mode === 'zoned') {
        return instant
          .toZonedDateTimeISO(this._getTimeZoneId())
          .withCalendar(this._getCalendarId());
      }
      // For date/datetime modes, use local timezone (like JS Date)
      const zdt = instant.toZonedDateTimeISO(Temporal.Now.timeZoneId());
      if (this._mode === 'datetime') {
        return Temporal.PlainDateTime.from({
          year: zdt.year,
          month: zdt.month,
          day: zdt.day,
          hour: zdt.hour,
          minute: zdt.minute,
          second: zdt.second,
          calendar: this._getCalendarId(),
        });
      }
      return Temporal.PlainDate.from({
        year: zdt.year,
        month: zdt.month,
        day: zdt.day,
        calendar: this._getCalendarId(),
      });
    } catch {
      return this.invalid();
    }
  }

  /**
   * Parses a string to a Temporal date using ISO 8601 format.
   * Returns null if parsing fails.
   */
  private _parseString(value: string): TemporalDateType | null {
    if (!value) {
      return null;
    }
    try {
      if (this._mode === 'zoned') {
        try {
          return Temporal.ZonedDateTime.from(value, this._getZonedFromOptions()).withCalendar(
            this._getCalendarId(),
          );
        } catch {
          if (value.includes('[')) {
            return null;
          }
          const plainDate = Temporal.PlainDate.from(value);
          return plainDate
            .toPlainDateTime({hour: 0, minute: 0, second: 0})
            .toZonedDateTime(this._getTimeZoneId(), this._getDisambiguationOption())
            .withCalendar(this._getCalendarId());
        }
      } else if (this._mode === 'datetime') {
        try {
          return Temporal.PlainDateTime.from(value).withCalendar(this._getCalendarId());
        } catch {
          const plainDate = Temporal.PlainDate.from(value);
          return plainDate
            .toPlainDateTime({hour: 0, minute: 0, second: 0})
            .withCalendar(this._getCalendarId());
        }
      }
      return Temporal.PlainDate.from(value).withCalendar(this._getCalendarId());
    } catch {
      return null;
    }
  }
}
