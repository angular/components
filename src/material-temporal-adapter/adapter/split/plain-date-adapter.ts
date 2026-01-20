/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injectable} from '@angular/core';
import {BaseTemporalAdapter} from './base-temporal-adapter';

/**
 * Sentinel object representing an invalid PlainDate.
 * Since Temporal throws instead of creating invalid dates, we use this marker.
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
 * DateAdapter implementation for `Temporal.PlainDate`.
 *
 * This adapter is for date-only scenarios (no time component).
 * For date+time, use `PlainDateTimeAdapter`.
 * For timezone-aware dates, use `ZonedDateTimeAdapter`.
 *
 * @example
 * ```typescript
 * import { providePlainDateAdapter } from '@angular/material-temporal-adapter';
 *
 * bootstrapApplication(AppComponent, {
 *   providers: [providePlainDateAdapter()],
 * });
 * ```
 */
@Injectable()
export class PlainDateAdapter extends BaseTemporalAdapter<Temporal.PlainDate> {
  /**
   * Clones the given date.
   * Note: Temporal objects are immutable, so the original cannot be mutated.
   * However, we still create a new object because:
   * 1. The DateAdapter interface contract specifies "A new date"
   * 2. Consumer code may use reference equality checks (clone !== original)
   * 3. Consistency with other date adapters (NativeDateAdapter, LuxonDateAdapter)
   */
  clone(date: Temporal.PlainDate): Temporal.PlainDate {
    return Temporal.PlainDate.from(date.toString());
  }

  createDate(year: number, month: number, date: number): Temporal.PlainDate {
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
      return Temporal.PlainDate.from(
        {
          year,
          month: month + 1, // Convert 0-indexed to 1-indexed
          day: date,
          calendar: this._getCalendarId(),
        },
        {overflow: this._overflow},
      );
    } catch (e) {
      if ((typeof ngDevMode === 'undefined' || ngDevMode) && this._overflow === 'reject') {
        throw Error(`Invalid date "${date}" for month with index "${month}".`);
      }
      return this.invalid();
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

  today(): Temporal.PlainDate {
    return Temporal.Now.plainDateISO().withCalendar(this._getCalendarId());
  }

  parse(value: unknown, parseFormat?: any): Temporal.PlainDate | null {
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

  toIso8601(date: Temporal.PlainDate): string {
    return date.toString();
  }

  override deserialize(value: unknown): Temporal.PlainDate | null {
    if (typeof value === 'string') {
      if (!value) return null;
      const parsed = this._parseString(value);
      return parsed && this.isValid(parsed) ? parsed : this.invalid();
    }
    return super.deserialize(value);
  }

  isDateInstance(obj: unknown): obj is Temporal.PlainDate {
    if (obj == null || typeof obj !== 'object') return false;
    if ((obj as {_invalid?: boolean})._invalid) return true;
    return obj instanceof (Temporal.PlainDate as unknown as new (...args: unknown[]) => unknown);
  }

  isValid(date: Temporal.PlainDate): boolean {
    if ((date as unknown as {_invalid?: boolean})._invalid) return false;
    return date != null && typeof date.year === 'number' && !isNaN(date.year);
  }

  invalid(): Temporal.PlainDate {
    return INVALID_PLAIN_DATE;
  }

  // Time methods - PlainDate has no time, return 0
  override getHours(_date: Temporal.PlainDate): number {
    return 0;
  }

  override getMinutes(_date: Temporal.PlainDate): number {
    return 0;
  }

  override getSeconds(_date: Temporal.PlainDate): number {
    return 0;
  }

  override setTime(
    target: Temporal.PlainDate,
    hours: number,
    minutes: number,
    seconds: number,
  ): Temporal.PlainDate {
    // PlainDate cannot hold time - convert to PlainDateTime
    // This is a design decision: caller should use PlainDateTimeAdapter if time is needed
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      console.warn(
        'PlainDateAdapter.setTime: PlainDate cannot hold time. ' +
          'Use PlainDateTimeAdapter for date+time scenarios.',
      );
    }
    return target; // Return unchanged
  }

  override parseTime(_value: unknown, _parseFormat?: any): Temporal.PlainDate | null {
    // PlainDate cannot hold time
    return this.invalid();
  }

  override addSeconds(date: Temporal.PlainDate, _amount: number): Temporal.PlainDate {
    // PlainDate cannot hold time - return unchanged
    return date;
  }

  protected _parseString(value: string): Temporal.PlainDate | null {
    if (!value) return null;
    try {
      return Temporal.PlainDate.from(value).withCalendar(this._getCalendarId());
    } catch {
      return null;
    }
  }

  protected _createFromEpochMs(ms: number): Temporal.PlainDate {
    if (!Number.isFinite(ms) || ms > 8.64e15 || ms < -8.64e15) {
      return this.invalid();
    }
    try {
      const instant = Temporal.Instant.fromEpochMilliseconds(ms);
      const zdt = instant.toZonedDateTimeISO(Temporal.Now.timeZoneId());
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
}
