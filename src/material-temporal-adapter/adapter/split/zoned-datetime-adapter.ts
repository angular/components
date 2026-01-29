/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {inject, Injectable, InjectionToken} from '@angular/core';
import {DateAdapter, MAT_DATE_LOCALE} from '@angular/material/core';

/**
 * Configuration options for ZonedDateTimeAdapter.
 */
export interface ZonedDateTimeAdapterOptions {
  /** Calendar system to use (e.g., 'iso8601', 'hebrew', 'islamic'). Defaults to 'iso8601'. */
  calendar: string;
  /**
   * Calendar system to use for output/formatting. Defaults to `calendar` if not set.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal/ZonedDateTime/withCalendar
   */
  outputCalendar?: string;
  /** Timezone ID (e.g., 'America/New_York', 'UTC'). Defaults to system timezone. */
  timezone?: string;
  /** First day of week (0 = Sunday, 6 = Saturday). If not set, derived from locale. */
  firstDayOfWeek?: number;
  /**
   * How to resolve ambiguous or nonexistent local times when converting to ZonedDateTime.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal/PlainDateTime/toZonedDateTime
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal/ZonedDateTime/from
   */
  disambiguation?: 'compatible' | 'earlier' | 'later' | 'reject';
  /**
   * How to resolve offset ambiguity when parsing zoned strings with explicit offsets.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal/ZonedDateTime/from
   */
  offset?: 'use' | 'ignore' | 'reject' | 'prefer';
  /**
   * Optional rounding applied to zoned values before output/serialization.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal/ZonedDateTime/round
   */
  rounding?: {
    smallestUnit: string;
    roundingIncrement?: number;
    roundingMode?: 'ceil' | 'floor' | 'trunc' | 'halfExpand';
  };
  /**
   * How to handle out-of-range values in date creation.
   * - 'reject': Throw for invalid dates (default)
   * - 'constrain': Clamp to nearest valid date
   * @default 'reject'
   */
  overflow?: 'reject' | 'constrain';
}

/** Injection token for ZonedDateTimeAdapter options. */
export const MAT_ZONED_DATETIME_OPTIONS = new InjectionToken<ZonedDateTimeAdapterOptions>(
  'MAT_ZONED_DATETIME_OPTIONS',
);

/**
 * Sentinel object representing an invalid ZonedDateTime.
 */
const INVALID_ZONED_DATETIME = Object.freeze({
  _invalid: true,
  year: NaN,
  month: NaN,
  day: NaN,
  hour: NaN,
  minute: NaN,
  second: NaN,
  millisecond: NaN,
  dayOfWeek: NaN,
  daysInMonth: NaN,
  monthsInYear: NaN,
  timeZoneId: 'UTC',
  epochNanoseconds: BigInt(0),
}) as unknown as Temporal.ZonedDateTime;

/** Interface for Intl.Locale with weekInfo support. */
interface IntlWithLocale {
  Locale?: new (locale: string) => {
    getWeekInfo?: () => {firstDay: number};
    weekInfo?: {firstDay: number};
  };
}

/**
 * DateAdapter implementation for `Temporal.ZonedDateTime`.
 *
 * This adapter is for timezone-aware date+time scenarios.
 * For date-only, use `PlainDateAdapter`.
 * For date+time without timezone, use `PlainDateTimeAdapter`.
 *
 * @example
 * ```typescript
 * import { provideZonedDateTimeAdapter } from '@angular/material-temporal-adapter';
 *
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideZonedDateTimeAdapter({
 *       timezone: 'America/New_York',
 *     }),
 *   ],
 * });
 * ```
 */
@Injectable()
export class ZonedDateTimeAdapter extends DateAdapter<Temporal.ZonedDateTime> {
  private readonly _calendar: string;
  private readonly _outputCalendar: string | null;
  private readonly _timezone: string;
  private readonly _firstDayOfWeek?: number;
  private readonly _overflow: 'reject' | 'constrain';
  private readonly _disambiguation?: 'compatible' | 'earlier' | 'later' | 'reject';
  private readonly _offset?: 'use' | 'ignore' | 'reject' | 'prefer';
  private readonly _rounding?: {
    smallestUnit: string;
    roundingIncrement?: number;
    roundingMode?: 'ceil' | 'floor' | 'trunc' | 'halfExpand';
  };
  private readonly _matDateLocale = inject(MAT_DATE_LOCALE, {optional: true});

  constructor() {
    super();
    const options = inject(MAT_ZONED_DATETIME_OPTIONS, {optional: true});
    this._calendar = options?.calendar ?? 'iso8601';
    this._outputCalendar = options?.outputCalendar ?? null;
    this._timezone = options?.timezone ?? Temporal.Now.timeZoneId();
    this._firstDayOfWeek = options?.firstDayOfWeek;
    this._overflow = options?.overflow ?? 'reject';
    this._disambiguation = options?.disambiguation;
    this._offset = options?.offset;
    this._rounding = options?.rounding;

    if (this._matDateLocale) {
      super.setLocale(this._matDateLocale);
    } else {
      super.setLocale(this._getDefaultLocale());
    }
  }

  private _getDefaultLocale(): string {
    if (typeof navigator !== 'undefined' && navigator.language) {
      return navigator.language;
    }
    return 'en-US';
  }

  private _getCalendarId(): string {
    return this._calendar;
  }

  private _getOutputCalendarId(): string {
    return this._outputCalendar || this._calendar;
  }

  private _getZonedFromOptions(): {
    overflow?: 'reject' | 'constrain';
    disambiguation?: 'compatible' | 'earlier' | 'later' | 'reject';
    offset?: 'use' | 'ignore' | 'reject' | 'prefer';
  } {
    return {
      overflow: this._overflow,
      disambiguation: this._disambiguation,
      offset: this._offset,
    };
  }

  private _getDisambiguationOption():
    | {disambiguation?: 'compatible' | 'earlier' | 'later' | 'reject'}
    | undefined {
    return this._disambiguation ? {disambiguation: this._disambiguation} : undefined;
  }

  private _maybeRoundZoned(date: Temporal.ZonedDateTime): Temporal.ZonedDateTime {
    if (!this._rounding) {
      return date;
    }
    return date.round(this._rounding);
  }

  // ========================
  // DateAdapter implementation
  // ========================

  getYear(date: Temporal.ZonedDateTime): number {
    return date.year;
  }

  getMonth(date: Temporal.ZonedDateTime): number {
    return date.month - 1;
  }

  getDate(date: Temporal.ZonedDateTime): number {
    return date.day;
  }

  getDayOfWeek(date: Temporal.ZonedDateTime): number {
    const dayOfWeek = date.dayOfWeek;
    return dayOfWeek === 7 ? 0 : dayOfWeek;
  }

  getMonthNames(style: 'long' | 'short' | 'narrow'): string[] {
    const monthsInYear = this._getMonthsInYear();
    const options: Intl.DateTimeFormatOptions = {
      month: style,
      calendar: this._getOutputCalendarId(),
    };

    return Array.from({length: monthsInYear}, (_, i) => {
      const date = Temporal.PlainDate.from({
        year: 2024,
        month: i + 1,
        day: 1,
        calendar: this._getOutputCalendarId(),
      });
      const zdt = date
        .toPlainDateTime({hour: 12, minute: 0, second: 0})
        .toZonedDateTime(this._timezone, this._getDisambiguationOption());
      return this._formatWithLocale(zdt, options);
    });
  }

  getDateNames(): string[] {
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      calendar: this._getOutputCalendarId(),
    };

    return Array.from({length: 31}, (_, i) => {
      const date = Temporal.PlainDate.from({
        year: 2024,
        month: 1,
        day: i + 1,
        calendar: this._getOutputCalendarId(),
      });
      const zdt = date
        .toPlainDateTime({hour: 12, minute: 0, second: 0})
        .toZonedDateTime(this._timezone, this._getDisambiguationOption());
      return this._formatWithLocale(zdt, options);
    });
  }

  getDayOfWeekNames(style: 'long' | 'short' | 'narrow'): string[] {
    const options: Intl.DateTimeFormatOptions = {
      weekday: style,
    };

    // Jan 7, 2024 was a Sunday in ISO8601 calendar.
    // Day-of-week names are locale-dependent, not calendar-dependent,
    // so we format directly without calendar conversion.
    return Array.from({length: 7}, (_, i) => {
      const date = Temporal.PlainDate.from({
        year: 2024,
        month: 1,
        day: 7 + i,
        calendar: 'iso8601',
      });
      return date.toLocaleString(this.locale, options).replace(/[\u200e\u200f]/g, '');
    });
  }

  getYearName(date: Temporal.ZonedDateTime): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      calendar: this._getOutputCalendarId(),
    };
    return this._formatWithLocale(date, options);
  }

  getFirstDayOfWeek(): number {
    if (this._firstDayOfWeek !== undefined) {
      return this._firstDayOfWeek;
    }

    const intlWithLocale = Intl as IntlWithLocale;
    if (typeof Intl !== 'undefined' && intlWithLocale.Locale) {
      try {
        const locale = new intlWithLocale.Locale!(this.locale);
        const weekInfo = locale.getWeekInfo?.() || locale.weekInfo;
        if (weekInfo?.firstDay !== undefined) {
          return weekInfo.firstDay === 7 ? 0 : weekInfo.firstDay;
        }
      } catch {
        // Fall through
      }
    }

    return 0;
  }

  getNumDaysInMonth(date: Temporal.ZonedDateTime): number {
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
  clone(date: Temporal.ZonedDateTime): Temporal.ZonedDateTime {
    // For ZonedDateTime, we need to use toString() since from() requires timeZone property
    return Temporal.ZonedDateTime.from(date.toString());
  }

  createDate(year: number, month: number, date: number): Temporal.ZonedDateTime {
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
      const plainDate = Temporal.PlainDate.from(
        {
          year,
          month: month + 1,
          day: date,
          calendar: this._getCalendarId(),
        },
        {overflow: this._overflow},
      );
      // PlainDate -> PlainDateTime -> ZonedDateTime
      return plainDate
        .toPlainDateTime({hour: 0, minute: 0, second: 0})
        .toZonedDateTime(this._timezone, this._getDisambiguationOption());
    } catch (e) {
      if ((typeof ngDevMode === 'undefined' || ngDevMode) && this._overflow === 'reject') {
        throw Error(`Invalid date "${date}" for month with index "${month}".`);
      }
      return this.invalid();
    }
  }

  today(): Temporal.ZonedDateTime {
    return Temporal.Now.zonedDateTimeISO(this._timezone).withCalendar(this._getCalendarId());
  }

  parse(value: unknown, parseFormat?: any): Temporal.ZonedDateTime | null {
    if (typeof value === 'number') {
      return this._createFromEpochMs(value);
    }
    if (typeof value === 'string') {
      return value ? (this._parseString(value) ?? this.invalid()) : null;
    }
    if (this.isDateInstance(value)) {
      return this.clone(value);
    }
    return value ? this.invalid() : null;
  }

  format(date: Temporal.ZonedDateTime, displayFormat: Intl.DateTimeFormatOptions): string {
    if (!this.isValid(date)) {
      throw Error('ZonedDateTimeAdapter: Cannot format invalid date.');
    }

    const options: Intl.DateTimeFormatOptions = {
      ...displayFormat,
      calendar: this._getOutputCalendarId(),
    };
    return this._formatWithLocale(this._maybeRoundZoned(date), options);
  }

  addCalendarYears(date: Temporal.ZonedDateTime, years: number): Temporal.ZonedDateTime {
    return date.add({years}, {overflow: this._overflow});
  }

  addCalendarMonths(date: Temporal.ZonedDateTime, months: number): Temporal.ZonedDateTime {
    return date.add({months}, {overflow: this._overflow});
  }

  addCalendarDays(date: Temporal.ZonedDateTime, days: number): Temporal.ZonedDateTime {
    return date.add({days}, {overflow: this._overflow});
  }

  toIso8601(date: Temporal.ZonedDateTime): string {
    return this._maybeRoundZoned(date).toString();
  }

  override deserialize(value: unknown): Temporal.ZonedDateTime | null {
    if (typeof value === 'string') {
      if (!value) return null;
      const parsed = this._parseString(value);
      return parsed && this.isValid(parsed) ? parsed : this.invalid();
    }
    return super.deserialize(value);
  }

  isDateInstance(obj: unknown): obj is Temporal.ZonedDateTime {
    if (obj == null || typeof obj !== 'object') return false;
    if ((obj as {_invalid?: boolean})._invalid) return true;
    return (
      obj instanceof (Temporal.ZonedDateTime as unknown as new (...args: unknown[]) => unknown)
    );
  }

  isValid(date: Temporal.ZonedDateTime): boolean {
    if ((date as unknown as {_invalid?: boolean})._invalid) return false;
    return date != null && typeof date.year === 'number' && !isNaN(date.year);
  }

  invalid(): Temporal.ZonedDateTime {
    return INVALID_ZONED_DATETIME;
  }

  // Time methods
  override getHours(date: Temporal.ZonedDateTime): number {
    return date.hour;
  }

  override getMinutes(date: Temporal.ZonedDateTime): number {
    return date.minute;
  }

  override getSeconds(date: Temporal.ZonedDateTime): number {
    return date.second;
  }

  override setTime(
    target: Temporal.ZonedDateTime,
    hours: number,
    minutes: number,
    seconds: number,
  ): Temporal.ZonedDateTime {
    // Validate inputs are finite numbers within valid ranges
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
    return Temporal.ZonedDateTime.from(
      {
        year: target.year,
        month: target.month,
        day: target.day,
        hour: hours,
        minute: minutes,
        second: seconds,
        millisecond: 0,
        timeZone: target.timeZoneId,
        calendar: this._getCalendarId(),
      },
      this._getZonedFromOptions(),
    );
  }

  override parseTime(value: unknown, parseFormat?: any): Temporal.ZonedDateTime | null {
    if (value == null || value === '') return null;

    if (typeof value === 'string') {
      if (value.trim() === '') return this.invalid();

      // Reject very long strings to prevent potential DoS from regex backtracking
      if (value.length > 32) {
        return this.invalid();
      }

      const timeMatch = value
        .toUpperCase()
        .match(/^(\d?\d)[:.](\d?\d)(?:[:.](\d?\d))?\s*(AM|PM)?$/i);
      if (timeMatch) {
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

      try {
        const time = Temporal.PlainTime.from(value);
        return this.setTime(this.today(), time.hour, time.minute, time.second);
      } catch {
        return this.invalid();
      }
    }

    return this.parse(value, parseFormat);
  }

  override addSeconds(date: Temporal.ZonedDateTime, amount: number): Temporal.ZonedDateTime {
    return date.add({seconds: amount});
  }

  private _formatWithLocale(
    date: Temporal.ZonedDateTime,
    options: Intl.DateTimeFormatOptions,
  ): string {
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

  private _parseString(value: string): Temporal.ZonedDateTime | null {
    if (!value) return null;
    try {
      // Try ZonedDateTime first
      try {
        return Temporal.ZonedDateTime.from(value, this._getZonedFromOptions()).withCalendar(
          this._getCalendarId(),
        );
      } catch {
        if (value.includes('[')) {
          return null;
        }
        // Try PlainDate and convert
        const plainDate = Temporal.PlainDate.from(value);
        return plainDate
          .toPlainDateTime({hour: 0, minute: 0, second: 0})
          .toZonedDateTime(this._timezone, this._getDisambiguationOption())
          .withCalendar(this._getCalendarId());
      }
    } catch {
      return null;
    }
  }

  private _createFromEpochMs(ms: number): Temporal.ZonedDateTime {
    // Validate input: must be a finite number within JavaScript's Date range
    // (±8.64e15 ms from Unix epoch, approximately ±273,000 years)
    if (!Number.isFinite(ms) || ms > 8.64e15 || ms < -8.64e15) {
      return this.invalid();
    }

    try {
      const instant = Temporal.Instant.fromEpochMilliseconds(ms);
      return instant.toZonedDateTimeISO(this._timezone).withCalendar(this._getCalendarId());
    } catch {
      return this.invalid();
    }
  }

  /** Gets the number of months in the current calendar year. */
  private _getMonthsInYear(): number {
    try {
      const refDate = Temporal.PlainDate.from({
        year: 2024,
        month: 1,
        day: 1,
        calendar: this._getOutputCalendarId(),
      });
      return refDate.monthsInYear;
    } catch {
      return 12;
    }
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
      return 12;
    }
  }
}
