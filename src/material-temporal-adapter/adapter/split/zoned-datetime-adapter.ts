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
  /** Timezone ID (e.g., 'America/New_York', 'UTC'). Defaults to system timezone. */
  timezone?: string;
  /** First day of week (0 = Sunday, 6 = Saturday). If not set, derived from locale. */
  firstDayOfWeek?: number;
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
  private readonly _timezone: string;
  private readonly _firstDayOfWeek?: number;
  private readonly _overflow: 'reject' | 'constrain';
  private readonly _matDateLocale = inject(MAT_DATE_LOCALE, {optional: true});

  constructor() {
    super();
    const options = inject(MAT_ZONED_DATETIME_OPTIONS, {optional: true});
    this._calendar = options?.calendar ?? 'iso8601';
    this._timezone = options?.timezone ?? Temporal.Now.timeZoneId();
    this._firstDayOfWeek = options?.firstDayOfWeek;
    this._overflow = options?.overflow ?? 'reject';

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
    const options: Intl.DateTimeFormatOptions = {
      month: style,
      calendar: this._getCalendarId(),
    };

    return Array.from({length: 12}, (_, i) => {
      const date = Temporal.PlainDate.from({
        year: 2024,
        month: i + 1,
        day: 1,
        calendar: this._getCalendarId(),
      });
      const zdt = date
        .toPlainDateTime({hour: 12, minute: 0, second: 0})
        .toZonedDateTime(this._timezone);
      return this._formatWithLocale(zdt, options);
    });
  }

  getDateNames(): string[] {
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      calendar: this._getCalendarId(),
    };

    return Array.from({length: 31}, (_, i) => {
      const date = Temporal.PlainDate.from({
        year: 2024,
        month: 1,
        day: i + 1,
        calendar: this._getCalendarId(),
      });
      const zdt = date
        .toPlainDateTime({hour: 12, minute: 0, second: 0})
        .toZonedDateTime(this._timezone);
      return this._formatWithLocale(zdt, options);
    });
  }

  getDayOfWeekNames(style: 'long' | 'short' | 'narrow'): string[] {
    const options: Intl.DateTimeFormatOptions = {
      weekday: style,
    };

    return Array.from({length: 7}, (_, i) => {
      const date = Temporal.PlainDate.from({
        year: 2024,
        month: 1,
        day: 7 + i,
        calendar: this._getCalendarId(),
      });
      const zdt = date
        .toPlainDateTime({hour: 12, minute: 0, second: 0})
        .toZonedDateTime(this._timezone);
      return this._formatWithLocale(zdt, options);
    });
  }

  getYearName(date: Temporal.ZonedDateTime): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      calendar: this._getCalendarId(),
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

  clone(date: Temporal.ZonedDateTime): Temporal.ZonedDateTime {
    return Temporal.ZonedDateTime.from(date.toString());
  }

  createDate(year: number, month: number, date: number): Temporal.ZonedDateTime {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      if (month < 0 || month > 11) {
        throw Error(`Invalid month index "${month}". Month index has to be between 0 and 11.`);
      }
      if (date < 1) {
        throw Error(`Invalid date "${date}". Date has to be greater than 0.`);
      }
    }

    try {
      const plainDate = Temporal.PlainDate.from({
        year,
        month: month + 1,
        day: date,
        calendar: this._getCalendarId(),
      });
      // PlainDate -> PlainDateTime -> ZonedDateTime
      return plainDate
        .toPlainDateTime({hour: 0, minute: 0, second: 0})
        .toZonedDateTime(this._timezone);
    } catch (e) {
      if (typeof ngDevMode === 'undefined' || ngDevMode) {
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
      calendar: this._getCalendarId(),
    };
    return this._formatWithLocale(date, options);
  }

  addCalendarYears(date: Temporal.ZonedDateTime, years: number): Temporal.ZonedDateTime {
    return date.add({years});
  }

  addCalendarMonths(date: Temporal.ZonedDateTime, months: number): Temporal.ZonedDateTime {
    return date.add({months});
  }

  addCalendarDays(date: Temporal.ZonedDateTime, days: number): Temporal.ZonedDateTime {
    return date.add({days});
  }

  toIso8601(date: Temporal.ZonedDateTime): string {
    return date.toString();
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
    if ((typeof ngDevMode === 'undefined' || ngDevMode) && this._overflow === 'reject') {
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
    return target.with({hour: hours, minute: minutes, second: seconds, millisecond: 0});
  }

  override parseTime(value: unknown, parseFormat?: any): Temporal.ZonedDateTime | null {
    if (value == null || value === '') return null;

    if (typeof value === 'string') {
      if (value.trim() === '') return this.invalid();

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
    const temporal = date as unknown as {
      toLocaleString: (locales?: string | string[], options?: Intl.DateTimeFormatOptions) => string;
    };
    return temporal.toLocaleString(this.locale, options).replace(/[\u200e\u200f]/g, '');
  }

  private _parseString(value: string): Temporal.ZonedDateTime | null {
    if (!value) return null;
    try {
      // Try ZonedDateTime first
      try {
        return Temporal.ZonedDateTime.from(value).withCalendar(this._getCalendarId());
      } catch {
        // Try PlainDate and convert
        const plainDate = Temporal.PlainDate.from(value);
        return plainDate
          .toPlainDateTime({hour: 0, minute: 0, second: 0})
          .toZonedDateTime(this._timezone)
          .withCalendar(this._getCalendarId());
      }
    } catch {
      return null;
    }
  }

  private _createFromEpochMs(ms: number): Temporal.ZonedDateTime {
    const instant = Temporal.Instant.fromEpochMilliseconds(ms);
    return instant.toZonedDateTimeISO(this._timezone).withCalendar(this._getCalendarId());
  }
}
