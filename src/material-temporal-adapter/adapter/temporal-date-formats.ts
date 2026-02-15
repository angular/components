/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {MatDateFormats} from '@angular/material/core';

/**
 * Default date formats for the Temporal adapter.
 *
 * These formats use Intl.DateTimeFormatOptions for display, following the same
 * pattern as NativeDateAdapter. Parse formats are null because Temporal API
 * handles parsing via its own ISO 8601 compliant methods.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal
 */
export const MAT_TEMPORAL_DATE_FORMATS: MatDateFormats = {
  parse: {
    /**
     * Parse format is null - Temporal handles parsing via Temporal.PlainDate.from(),
     * Temporal.PlainDateTime.from(), and Temporal.ZonedDateTime.from() which accept
     * ISO 8601 strings natively.
     */
    dateInput: null,
    /** Time parse format is null - Temporal handles time parsing natively. */
    timeInput: null,
  },
  display: {
    /** Format used for displaying date in input field. */
    dateInput: {year: 'numeric', month: '2-digit', day: '2-digit'},
    /** Format used for displaying time in input field. */
    timeInput: {hour: '2-digit', minute: '2-digit'},
    /** Format used for month/year label in calendar header. */
    monthYearLabel: {year: 'numeric', month: 'short'},
    /** Format used for accessibility label for date. */
    dateA11yLabel: {year: 'numeric', month: 'long', day: 'numeric'},
    /** Format used for accessibility label for month/year. */
    monthYearA11yLabel: {year: 'numeric', month: 'long'},
    /** Format used for time options in time picker. */
    timeOptionLabel: {hour: '2-digit', minute: '2-digit'},
  },
};

/**
 * Extended date formats for Temporal adapter with datetime support.
 *
 * Use this when working with date-time pickers that need to display
 * both date and time information (e.g., PlainDateTime or ZonedDateTime modes).
 */
export const MAT_TEMPORAL_DATETIME_FORMATS: MatDateFormats = {
  parse: {
    /**
     * Parse format is null - Temporal handles datetime parsing via
     * Temporal.PlainDateTime.from() and Temporal.ZonedDateTime.from().
     */
    dateInput: null,
    /** Time parse format is null - Temporal handles time parsing natively. */
    timeInput: null,
  },
  display: {
    dateInput: {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    },
    timeInput: {hour: '2-digit', minute: '2-digit', second: '2-digit'},
    monthYearLabel: {year: 'numeric', month: 'short'},
    dateA11yLabel: {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
    monthYearA11yLabel: {year: 'numeric', month: 'long'},
    timeOptionLabel: {hour: '2-digit', minute: '2-digit', second: '2-digit'},
  },
};
