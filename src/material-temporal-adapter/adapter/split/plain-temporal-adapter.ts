/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {inject, Injectable, InjectionToken} from '@angular/core';
import {DateAdapter, MAT_DATE_LOCALE} from '@angular/material/core';

/** Plain date/datetime type - either PlainDate or PlainDateTime depending on mode */
export type PlainTemporalType = Temporal.PlainDate | Temporal.PlainDateTime;

/**
 * Sentinel object representing an invalid PlainDate.
 */
const INVALID_PLAIN_DATE = Object.freeze({
  _invalid: true,
  year: NaN,
  month: NaN,
  day: NaN,
  dayOfWeek: NaN,
  daysInMonth: NaN,
  monthsInYear: NaN,
}) as unknown as Temporal.PlainDate;

/**
 * Sentinel object representing an invalid PlainDateTime.
 */
const INVALID_PLAIN_DATETIME = Object.freeze({
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
}) as unknown as Temporal.PlainDateTime;

/** Configuration options for PlainTemporalAdapter. */
export interface PlainTemporalAdapterOptions {
  /**
   * Mode for the adapter.
   * - 'date': Uses Temporal.PlainDate (no time component)
   * - 'datetime': Uses Temporal.PlainDateTime (with time, no timezone)
   * @default 'datetime'
   */
  mode: 'date' | 'datetime';

  /**
   * Calendar system to use.
   * @default 'iso8601'
   */
  calendar?: string;

  /**
   * First day of week (0 = Sunday, 6 = Saturday).
   * If not set, determined from locale.
   */
  firstDayOfWeek?: number;

  /**
   * How to handle out-of-range values in date creation.
   * - 'reject': Throw for invalid dates (default)
   * - 'constrain': Clamp to nearest valid date
   * @default 'reject'
   */
  overflow?: 'reject' | 'constrain';
}

/** InjectionToken for PlainTemporalAdapter options. */
export const MAT_PLAIN_TEMPORAL_ADAPTER_OPTIONS = new InjectionToken<PlainTemporalAdapterOptions>(
  'MAT_PLAIN_TEMPORAL_ADAPTER_OPTIONS',
  {
    providedIn: 'root',
    factory: () => ({mode: 'datetime', overflow: 'reject'}),
  },
);

/** Interface for Intl.Locale with weekInfo support. */
interface IntlWithLocale {
  Locale?: new (locale: string) => {
    getWeekInfo?: () => {firstDay: number};
    weekInfo?: {firstDay: number};
  };
}

/**
 * DateAdapter implementation for `Temporal.PlainDate` and `Temporal.PlainDateTime`.
 *
 * This adapter handles date and date-time scenarios without timezone awareness.
 * Use the `mode` option to choose between:
 * - 'date': Only date, no time (PlainDate)
 * - 'datetime': Date with time (PlainDateTime)
 *
 * For timezone-aware dates, use `ZonedDateTimeAdapter`.
 *
 * @example
 * ```typescript
 * import { providePlainTemporalAdapter } from '@angular/material-temporal-adapter/split';
 *
 * // Date only
 * bootstrapApplication(AppComponent, {
 *   providers: [providePlainTemporalAdapter(formats, { mode: 'date' })],
 * });
 *
 * // Date + time (default)
 * bootstrapApplication(AppComponent, {
 *   providers: [providePlainTemporalAdapter()],
 * });
 * ```
 */
@Injectable()
export class PlainTemporalAdapter extends DateAdapter<PlainTemporalType> {
  private readonly _mode: 'date' | 'datetime';
  private readonly _calendar: string;
  private readonly _firstDayOfWeek?: number;
  private readonly _overflow: 'reject' | 'constrain';

  constructor() {
    super();

    const dateLocale = inject(MAT_DATE_LOCALE, {optional: true});
    const options = inject<PlainTemporalAdapterOptions>(MAT_PLAIN_TEMPORAL_ADAPTER_OPTIONS, {
      optional: true,
    });

    this._mode = options?.mode ?? 'datetime';
    this._calendar = options?.calendar ?? 'iso8601';
    this._firstDayOfWeek = options?.firstDayOfWeek;
    this._overflow = options?.overflow ?? 'reject';
    this.setLocale(dateLocale || this._getDefaultLocale());
  }

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

  /** Whether the adapter is in datetime mode */
  private get _isDateTime(): boolean {
    return this._mode === 'datetime';
  }

  // ========================
  // DateAdapter implementation
  // ========================

  getYear(date: PlainTemporalType): number {
    return date.year;
  }

  getMonth(date: PlainTemporalType): number {
    return date.month - 1; // Convert 1-indexed to 0-indexed
  }

  getDate(date: PlainTemporalType): number {
    return date.day;
  }

  getDayOfWeek(date: PlainTemporalType): number {
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
      return this._formatWithLocale(date, options);
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
      return this._formatWithLocale(date, options);
    });
  }

  getDayOfWeekNames(style: 'long' | 'short' | 'narrow'): string[] {
    const options: Intl.DateTimeFormatOptions = {
      weekday: style,
    };

    // Jan 7, 2024 was a Sunday
    return Array.from({length: 7}, (_, i) => {
      const date = Temporal.PlainDate.from({
        year: 2024,
        month: 1,
        day: 7 + i,
        calendar: this._getCalendarId(),
      });
      return this._formatWithLocale(date, options);
    });
  }

  getYearName(date: PlainTemporalType): string {
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

  getNumDaysInMonth(date: PlainTemporalType): number {
    return date.daysInMonth;
  }

  clone(date: PlainTemporalType): PlainTemporalType {
    if (this._isPlainDateTime(date)) {
      return Temporal.PlainDateTime.from(date.toString());
    }
    return Temporal.PlainDate.from(date.toString());
  }

  createDate(year: number, month: number, date: number): PlainTemporalType {
    if ((typeof ngDevMode === 'undefined' || ngDevMode) && this._overflow === 'reject') {
      if (month < 0 || month > 11) {
        throw Error(`Invalid month index "${month}". Month index has to be between 0 and 11.`);
      }
      if (date < 1) {
        throw Error(`Invalid date "${date}". Date has to be greater than 0.`);
      }
    }

    try {
      const temporalMonth = month + 1; // Convert 0-indexed to 1-indexed
      const overflowOption = {overflow: this._overflow};

      if (this._isDateTime) {
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

  today(): PlainTemporalType {
    if (this._isDateTime) {
      return Temporal.Now.plainDateTimeISO().withCalendar(this._getCalendarId());
    }
    return Temporal.Now.plainDateISO().withCalendar(this._getCalendarId());
  }

  parse(value: unknown, parseFormat?: any): PlainTemporalType | null {
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

  format(date: PlainTemporalType, displayFormat: Intl.DateTimeFormatOptions): string {
    if (!this.isValid(date)) {
      throw Error('PlainTemporalAdapter: Cannot format invalid date.');
    }

    const options: Intl.DateTimeFormatOptions = {
      ...displayFormat,
      calendar: this._getCalendarId(),
    };
    return this._formatWithLocale(date, options);
  }

  addCalendarYears(date: PlainTemporalType, years: number): PlainTemporalType {
    return date.add({years}) as PlainTemporalType;
  }

  addCalendarMonths(date: PlainTemporalType, months: number): PlainTemporalType {
    return date.add({months}) as PlainTemporalType;
  }

  addCalendarDays(date: PlainTemporalType, days: number): PlainTemporalType {
    return date.add({days}) as PlainTemporalType;
  }

  toIso8601(date: PlainTemporalType): string {
    if (this._isPlainDateTime(date)) {
      return date.toPlainDate().toString();
    }
    return date.toString();
  }

  override deserialize(value: unknown): PlainTemporalType | null {
    if (typeof value === 'string') {
      if (!value) return null;
      const parsed = this._parseString(value);
      return parsed && this.isValid(parsed) ? parsed : this.invalid();
    }
    return super.deserialize(value);
  }

  isDateInstance(obj: unknown): obj is PlainTemporalType {
    if (obj == null || typeof obj !== 'object') return false;
    if ((obj as {_invalid?: boolean})._invalid) return true;
    return (
      obj instanceof (Temporal.PlainDate as unknown as new (...args: unknown[]) => unknown) ||
      obj instanceof (Temporal.PlainDateTime as unknown as new (...args: unknown[]) => unknown)
    );
  }

  isValid(date: PlainTemporalType): boolean {
    if ((date as unknown as {_invalid?: boolean})._invalid) return false;
    return date != null && typeof date.year === 'number' && !isNaN(date.year);
  }

  invalid(): PlainTemporalType {
    return this._isDateTime ? INVALID_PLAIN_DATETIME : INVALID_PLAIN_DATE;
  }

  // ========================
  // Time methods
  // ========================

  override getHours(date: PlainTemporalType): number {
    if (this._isPlainDateTime(date)) {
      return date.hour;
    }
    return 0;
  }

  override getMinutes(date: PlainTemporalType): number {
    if (this._isPlainDateTime(date)) {
      return date.minute;
    }
    return 0;
  }

  override getSeconds(date: PlainTemporalType): number {
    if (this._isPlainDateTime(date)) {
      return date.second;
    }
    return 0;
  }

  override setTime(
    target: PlainTemporalType,
    hours: number,
    minutes: number,
    seconds: number,
  ): PlainTemporalType {
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

    if (this._isPlainDateTime(target)) {
      return target.with({hour: hours, minute: minutes, second: seconds, millisecond: 0});
    }

    // In 'date' mode, time is not supported
    if (this._mode === 'date') {
      if (typeof ngDevMode === 'undefined' || ngDevMode) {
        console.warn(
          'PlainTemporalAdapter.setTime: Called in date mode. ' +
            'Use mode: "datetime" for date+time scenarios.',
        );
      }
      return target;
    }

    // Mode is datetime but got PlainDate - convert
    return (target as Temporal.PlainDate)
      .toPlainDateTime({hour: hours, minute: minutes, second: seconds})
      .withCalendar(this._getCalendarId());
  }

  override parseTime(value: unknown, parseFormat?: any): PlainTemporalType | null {
    if (!this._isDateTime) {
      return this.invalid();
    }

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

  override addSeconds(date: PlainTemporalType, amount: number): PlainTemporalType {
    if (this._isPlainDateTime(date)) {
      return date.add({seconds: amount});
    }
    return date;
  }

  // ========================
  // Private helpers
  // ========================

  private _formatWithLocale(date: PlainTemporalType, options: Intl.DateTimeFormatOptions): string {
    const temporal = date as unknown as {
      toLocaleString: (locales?: string | string[], options?: Intl.DateTimeFormatOptions) => string;
    };
    return temporal.toLocaleString(this.locale, options).replace(/[\u200e\u200f]/g, '');
  }

  private _parseString(value: string): PlainTemporalType | null {
    if (!value) return null;
    try {
      if (this._isDateTime) {
        try {
          return Temporal.PlainDateTime.from(value).withCalendar(this._getCalendarId());
        } catch {
          const plainDate = Temporal.PlainDate.from(value);
          return plainDate
            .toPlainDateTime({hour: 0, minute: 0, second: 0})
            .withCalendar(this._getCalendarId());
        }
      } else {
        return Temporal.PlainDate.from(value).withCalendar(this._getCalendarId());
      }
    } catch {
      return null;
    }
  }

  private _createFromEpochMs(ms: number): PlainTemporalType {
    const instant = Temporal.Instant.fromEpochMilliseconds(ms);
    const zdt = instant.toZonedDateTimeISO(Temporal.Now.timeZoneId());

    if (this._isDateTime) {
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
  }

  /** Type guard for PlainDateTime */
  private _isPlainDateTime(date: PlainTemporalType): date is Temporal.PlainDateTime {
    return 'hour' in date && typeof date.hour === 'number';
  }
}
