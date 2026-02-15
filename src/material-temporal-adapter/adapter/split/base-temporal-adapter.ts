/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {inject, InjectionToken} from '@angular/core';
import {DateAdapter, MAT_DATE_LOCALE} from '@angular/material/core';

/**
 * Configuration options for split Temporal adapters.
 */
export interface BaseTemporalAdapterOptions {
  /** Calendar system to use (e.g., 'iso8601', 'hebrew', 'islamic'). Defaults to 'iso8601'. */
  calendar: string;
  /** Calendar system to use for output/formatting. Defaults to `calendar` if not set. */
  outputCalendar?: string;
  /** First day of week (0 = Sunday, 6 = Saturday). If not set, derived from locale. */
  firstDayOfWeek?: number;
  /**
   * How to handle out-of-range values in date arithmetic.
   * - 'reject': Throw an error for invalid dates (default)
   * - 'constrain': Clamp to the nearest valid value
   */
  overflow?: 'reject' | 'constrain';
}

/** Injection token for base Temporal adapter options. */
export const MAT_BASE_TEMPORAL_OPTIONS = new InjectionToken<BaseTemporalAdapterOptions>(
  'MAT_BASE_TEMPORAL_OPTIONS',
);

/** Interface for Intl.Locale with weekInfo support. */
interface IntlWithLocale {
  Locale?: new (locale: string) => {
    getWeekInfo?: () => {firstDay: number};
    weekInfo?: {firstDay: number};
  };
}

type TemporalDateLike = Temporal.PlainDate | Temporal.PlainDateTime;

/**
 * Base class for split Temporal adapters.
 * Contains shared functionality for PlainDate and PlainDateTime adapters.
 *
 * @template T The Temporal type this adapter works with.
 */
export abstract class BaseTemporalAdapter<T extends TemporalDateLike> extends DateAdapter<T> {
  protected readonly _calendar: string;
  protected readonly _outputCalendar: string | null;
  protected readonly _firstDayOfWeek?: number;
  protected readonly _overflow: 'reject' | 'constrain';
  protected readonly _matDateLocale = inject(MAT_DATE_LOCALE, {optional: true});

  constructor() {
    super();
    const options = inject(MAT_BASE_TEMPORAL_OPTIONS, {optional: true});
    this._calendar = options?.calendar ?? 'iso8601';
    this._outputCalendar = options?.outputCalendar ?? null;
    this._firstDayOfWeek = options?.firstDayOfWeek;
    this._overflow = options?.overflow ?? 'reject';

    if (this._matDateLocale) {
      super.setLocale(this._matDateLocale);
    } else {
      super.setLocale(this._getDefaultLocale());
    }
  }

  /** Gets the calendar ID string. */
  protected _getCalendarId(): string {
    return this._calendar;
  }

  /** Gets the calendar ID string for output/formatting. */
  protected _getOutputCalendarId(): string {
    return this._outputCalendar || this._calendar;
  }

  /** Gets the default locale from the browser or system. */
  private _getDefaultLocale(): string {
    if (typeof navigator !== 'undefined' && navigator.language) {
      return navigator.language;
    }
    return 'en-US';
  }

  // ========================
  // Common DateAdapter methods
  // ========================

  getYear(date: T): number {
    return date.year;
  }

  getMonth(date: T): number {
    return date.month - 1; // Convert 1-indexed to 0-indexed
  }

  getDate(date: T): number {
    return date.day;
  }

  getDayOfWeek(date: T): number {
    const dayOfWeek = date.dayOfWeek;
    return dayOfWeek === 7 ? 0 : dayOfWeek; // Convert Monday=1..Sunday=7 to Sunday=0..Saturday=6
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
      return this._formatWithLocale(date, options);
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
      return this._formatWithLocale(date, options);
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

  getYearName(date: T): string {
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
        // Fall through to default
      }
    }

    return 0; // Default to Sunday
  }

  getNumDaysInMonth(date: T): number {
    return date.daysInMonth;
  }

  addCalendarYears(date: T, years: number): T {
    return date.add({years}, {overflow: this._overflow}) as T;
  }

  addCalendarMonths(date: T, months: number): T {
    return date.add({months}, {overflow: this._overflow}) as T;
  }

  addCalendarDays(date: T, days: number): T {
    return date.add({days}, {overflow: this._overflow}) as T;
  }

  format(date: T, displayFormat: Intl.DateTimeFormatOptions): string {
    if (!this.isValid(date)) {
      throw Error('BaseTemporalAdapter: Cannot format invalid date.');
    }

    const options: Intl.DateTimeFormatOptions = {
      ...displayFormat,
      calendar: this._getOutputCalendarId(),
    };
    return this._formatWithLocale(date, options);
  }

  /** Gets the number of months in the current calendar year. */
  protected _getMonthsInYear(): number {
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

  /** Formats a Temporal date using its built-in locale formatter. */
  protected _formatWithLocale(date: TemporalDateLike, options: Intl.DateTimeFormatOptions): string {
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

  /** Parses an ISO 8601 string. Returns null if parsing fails. */
  protected abstract _parseString(value: string): T | null;

  /** Creates a date from epoch milliseconds. */
  protected abstract _createFromEpochMs(ms: number): T;
}
