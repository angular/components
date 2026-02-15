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

/**
 * DateAdapter implementation for `Temporal.PlainDateTime`.
 *
 * This adapter is for date+time scenarios without timezone awareness.
 * For date-only, use `PlainDateAdapter`.
 * For timezone-aware dates, use `ZonedDateTimeAdapter`.
 *
 * @example
 * ```typescript
 * import { providePlainDateTimeAdapter } from '@angular/material-temporal-adapter';
 *
 * bootstrapApplication(AppComponent, {
 *   providers: [providePlainDateTimeAdapter()],
 * });
 * ```
 */
@Injectable()
export class PlainDateTimeAdapter extends BaseTemporalAdapter<Temporal.PlainDateTime> {
  /**
   * Clones the given date.
   * Note: Temporal objects are immutable, so the original cannot be mutated.
   * However, we still create a new object because:
   * 1. The DateAdapter interface contract specifies "A new date"
   * 2. Consumer code may use reference equality checks (clone !== original)
   * 3. Consistency with other date adapters (NativeDateAdapter, LuxonDateAdapter)
   */
  clone(date: Temporal.PlainDateTime): Temporal.PlainDateTime {
    return Temporal.PlainDateTime.from(date.toString());
  }

  createDate(year: number, month: number, date: number): Temporal.PlainDateTime {
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
      return Temporal.PlainDateTime.from(
        {
          year,
          month: month + 1,
          day: date,
          hour: 0,
          minute: 0,
          second: 0,
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

  today(): Temporal.PlainDateTime {
    return Temporal.Now.plainDateTimeISO().withCalendar(this._getCalendarId());
  }

  parse(value: unknown, parseFormat?: any): Temporal.PlainDateTime | null {
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

  toIso8601(date: Temporal.PlainDateTime): string {
    return date.toPlainDate().toString();
  }

  override deserialize(value: unknown): Temporal.PlainDateTime | null {
    if (typeof value === 'string') {
      if (!value) return null;
      const parsed = this._parseString(value);
      return parsed && this.isValid(parsed) ? parsed : this.invalid();
    }
    return super.deserialize(value);
  }

  isDateInstance(obj: unknown): obj is Temporal.PlainDateTime {
    if (obj == null || typeof obj !== 'object') return false;
    if ((obj as {_invalid?: boolean})._invalid) return true;
    return (
      obj instanceof (Temporal.PlainDateTime as unknown as new (...args: unknown[]) => unknown)
    );
  }

  isValid(date: Temporal.PlainDateTime): boolean {
    if ((date as unknown as {_invalid?: boolean})._invalid) return false;
    return date != null && typeof date.year === 'number' && !isNaN(date.year);
  }

  invalid(): Temporal.PlainDateTime {
    return INVALID_PLAIN_DATETIME;
  }

  // Time methods
  override getHours(date: Temporal.PlainDateTime): number {
    return date.hour;
  }

  override getMinutes(date: Temporal.PlainDateTime): number {
    return date.minute;
  }

  override getSeconds(date: Temporal.PlainDateTime): number {
    return date.second;
  }

  override setTime(
    target: Temporal.PlainDateTime,
    hours: number,
    minutes: number,
    seconds: number,
  ): Temporal.PlainDateTime {
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

    return target.with({hour: hours, minute: minutes, second: seconds, millisecond: 0});
  }

  override parseTime(value: unknown, parseFormat?: any): Temporal.PlainDateTime | null {
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

      // Try ISO time
      try {
        const time = Temporal.PlainTime.from(value);
        return this.setTime(this.today(), time.hour, time.minute, time.second);
      } catch {
        return this.invalid();
      }
    }

    return this.parse(value, parseFormat);
  }

  override addSeconds(date: Temporal.PlainDateTime, amount: number): Temporal.PlainDateTime {
    return date.add({seconds: amount});
  }

  protected _parseString(value: string): Temporal.PlainDateTime | null {
    if (!value) return null;
    try {
      // Try PlainDateTime first
      try {
        return Temporal.PlainDateTime.from(value).withCalendar(this._getCalendarId());
      } catch {
        // Fall back to PlainDate and convert
        const plainDate = Temporal.PlainDate.from(value);
        return plainDate
          .toPlainDateTime({hour: 0, minute: 0, second: 0})
          .withCalendar(this._getCalendarId());
      }
    } catch {
      return null;
    }
  }

  protected _createFromEpochMs(ms: number): Temporal.PlainDateTime {
    if (!Number.isFinite(ms) || ms > 8.64e15 || ms < -8.64e15) {
      return this.invalid();
    }
    try {
      const instant = Temporal.Instant.fromEpochMilliseconds(ms);
      const zdt = instant.toZonedDateTimeISO(Temporal.Now.timeZoneId());
      return Temporal.PlainDateTime.from({
        year: zdt.year,
        month: zdt.month,
        day: zdt.day,
        hour: zdt.hour,
        minute: zdt.minute,
        second: zdt.second,
        calendar: this._getCalendarId(),
      });
    } catch {
      return this.invalid();
    }
  }
}
