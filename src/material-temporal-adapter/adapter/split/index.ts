/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Provider} from '@angular/core';
import {DateAdapter, MAT_DATE_FORMATS, MatDateFormats} from '@angular/material/core';
import {
  MAT_PLAIN_TEMPORAL_ADAPTER_OPTIONS,
  PlainTemporalAdapter,
  PlainTemporalAdapterOptions,
} from './plain-temporal-adapter';
import {
  MAT_ZONED_DATETIME_OPTIONS,
  ZonedDateTimeAdapter,
  ZonedDateTimeAdapterOptions,
} from './zoned-datetime-adapter';

// Export base adapter for extension
export {BaseTemporalAdapter, MAT_BASE_TEMPORAL_OPTIONS} from './base-temporal-adapter';

// Export specific adapters
export {PlainDateAdapter} from './plain-date-adapter';
export {PlainDateTimeAdapter} from './plain-datetime-adapter';

// Export the two main adapters
export {
  PlainTemporalAdapter,
  PlainTemporalAdapterOptions,
  PlainTemporalType,
  MAT_PLAIN_TEMPORAL_ADAPTER_OPTIONS,
} from './plain-temporal-adapter';

export {
  ZonedDateTimeAdapter,
  ZonedDateTimeAdapterOptions,
  MAT_ZONED_DATETIME_OPTIONS,
} from './zoned-datetime-adapter';

// ========================
// Default formats
// ========================

/** Default date formats for PlainTemporalAdapter in date mode. */
export const MAT_PLAIN_DATE_FORMATS: MatDateFormats = {
  parse: {
    dateInput: null,
    timeInput: null,
  },
  display: {
    dateInput: {year: 'numeric', month: 'numeric', day: 'numeric'},
    timeInput: {hour: 'numeric', minute: 'numeric'},
    monthYearLabel: {year: 'numeric', month: 'short'},
    dateA11yLabel: {year: 'numeric', month: 'long', day: 'numeric'},
    monthYearA11yLabel: {year: 'numeric', month: 'long'},
    timeOptionLabel: {hour: 'numeric', minute: 'numeric'},
  },
};

/** Default date formats for PlainTemporalAdapter in datetime mode (includes time). */
export const MAT_PLAIN_DATETIME_FORMATS: MatDateFormats = {
  parse: {
    dateInput: null,
    timeInput: null,
  },
  display: {
    dateInput: {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    },
    timeInput: {hour: 'numeric', minute: 'numeric'},
    monthYearLabel: {year: 'numeric', month: 'short'},
    dateA11yLabel: {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    },
    monthYearA11yLabel: {year: 'numeric', month: 'long'},
    timeOptionLabel: {hour: 'numeric', minute: 'numeric'},
  },
};

/** Default date formats for ZonedDateTimeAdapter (includes time and timezone). */
export const MAT_ZONED_DATETIME_FORMATS: MatDateFormats = {
  parse: {
    dateInput: null,
    timeInput: null,
  },
  display: {
    dateInput: {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      timeZoneName: 'short',
    },
    timeInput: {hour: 'numeric', minute: 'numeric'},
    monthYearLabel: {year: 'numeric', month: 'short'},
    dateA11yLabel: {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    },
    monthYearA11yLabel: {year: 'numeric', month: 'long'},
    timeOptionLabel: {hour: 'numeric', minute: 'numeric'},
  },
};

// ========================
// Provider functions
// ========================

/**
 * Provides PlainTemporalAdapter for date or date+time scenarios without timezone.
 *
 * This is the recommended adapter for most use cases:
 * - Use `mode: 'date'` for date-only pickers
 * - Use `mode: 'datetime'` for date+time pickers without timezone
 *
 * For timezone-aware scenarios, use `provideZonedDateTimeAdapter` instead.
 *
 * @example
 * ```typescript
 * import { providePlainTemporalAdapter, MAT_PLAIN_DATE_FORMATS } from '@angular/material-temporal-adapter/split';
 *
 * // Date only
 * bootstrapApplication(AppComponent, {
 *   providers: [providePlainTemporalAdapter(MAT_PLAIN_DATE_FORMATS, { mode: 'date' })],
 * });
 *
 * // Date + time (default)
 * bootstrapApplication(AppComponent, {
 *   providers: [providePlainTemporalAdapter()],
 * });
 *
 * // With Hebrew calendar
 * bootstrapApplication(AppComponent, {
 *   providers: [providePlainTemporalAdapter(MAT_PLAIN_DATETIME_FORMATS, {
 *     mode: 'datetime',
 *     calendar: 'hebrew',
 *   })],
 * });
 * ```
 */
export function providePlainTemporalAdapter(
  formats: MatDateFormats = MAT_PLAIN_DATETIME_FORMATS,
  options?: Partial<PlainTemporalAdapterOptions>,
): Provider[] {
  const providers: Provider[] = [
    {provide: DateAdapter, useClass: PlainTemporalAdapter},
    {provide: MAT_DATE_FORMATS, useValue: formats},
  ];

  if (options) {
    providers.push({
      provide: MAT_PLAIN_TEMPORAL_ADAPTER_OPTIONS,
      useValue: {
        mode: options.mode ?? 'datetime',
        calendar: options.calendar ?? 'iso8601',
        outputCalendar: options.outputCalendar,
        firstDayOfWeek: options.firstDayOfWeek,
        overflow: options.overflow,
      } satisfies PlainTemporalAdapterOptions,
    });
  }

  return providers;
}

/**
 * Provides ZonedDateTimeAdapter for timezone-aware date+time scenarios.
 *
 * Use this adapter when you need timezone support. For UTC, pass `{ timezone: 'UTC' }`.
 *
 * @example
 * ```typescript
 * import { provideZonedDateTimeAdapter } from '@angular/material-temporal-adapter/split';
 *
 * // System timezone (default)
 * bootstrapApplication(AppComponent, {
 *   providers: [provideZonedDateTimeAdapter()],
 * });
 *
 * // UTC timezone
 * bootstrapApplication(AppComponent, {
 *   providers: [provideZonedDateTimeAdapter(formats, { timezone: 'UTC' })],
 * });
 *
 * // Specific timezone
 * bootstrapApplication(AppComponent, {
 *   providers: [provideZonedDateTimeAdapter(formats, {
 *     timezone: 'America/New_York',
 *     calendar: 'iso8601',
 *   })],
 * });
 * ```
 */
export function provideZonedDateTimeAdapter(
  formats: MatDateFormats = MAT_ZONED_DATETIME_FORMATS,
  options?: Partial<ZonedDateTimeAdapterOptions>,
): Provider[] {
  const providers: Provider[] = [
    {provide: DateAdapter, useClass: ZonedDateTimeAdapter},
    {provide: MAT_DATE_FORMATS, useValue: formats},
  ];

  if (options) {
    providers.push({
      provide: MAT_ZONED_DATETIME_OPTIONS,
      useValue: {
        calendar: options.calendar ?? 'iso8601',
        outputCalendar: options.outputCalendar,
        timezone: options.timezone,
        firstDayOfWeek: options.firstDayOfWeek,
        overflow: options.overflow,
        disambiguation: options.disambiguation,
        offset: options.offset,
        rounding: options.rounding,
      } satisfies ZonedDateTimeAdapterOptions,
    });
  }

  return providers;
}
