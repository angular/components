/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken} from '@angular/core';
import {DateAdapter, MatDateFormats} from '@angular/material/core';

/** Pattern that interval strings have to match. */
const INTERVAL_PATTERN = /^(\d*\.?\d+)(h|m|s)?$/i;

/**
 * Object that can be used to configure the default options for the timepicker component.
 */
export interface MatTimepickerConfig {
  /** Default interval for all time pickers. */
  interval?: string | number;

  /** Whether ripples inside the timepicker should be disabled by default. */
  disableRipple?: boolean;
}

/**
 * Injection token that can be used to configure the default options for the timepicker component.
 */
export const MAT_TIMEPICKER_CONFIG = new InjectionToken<MatTimepickerConfig>(
  'MAT_TIMEPICKER_CONFIG',
);

/**
 * Time selection option that can be displayed within a `mat-timepicker`.
 */
export interface MatTimepickerOption<D = unknown> {
  /** Date value of the option. */
  value: D;

  /** Label to show to the user. */
  label: string;
}

/** Parses an interval value into seconds. */
export function parseInterval(value: number | string | null): number | null {
  let result: number;

  if (value === null) {
    return null;
  } else if (typeof value === 'number') {
    result = value;
  } else {
    if (value.trim().length === 0) {
      return null;
    }

    const parsed = value.match(INTERVAL_PATTERN);
    const amount = parsed ? parseFloat(parsed[1]) : null;
    const unit = parsed?.[2]?.toLowerCase() || null;

    if (!parsed || amount === null || isNaN(amount)) {
      return null;
    }

    if (unit === 'h') {
      result = amount * 3600;
    } else if (unit === 'm') {
      result = amount * 60;
    } else {
      result = amount;
    }
  }

  return result;
}

/**
 * Generates the options to show in a timepicker.
 * @param adapter Date adapter to be used to generate the options.
 * @param formats Formatting config to use when displaying the options.
 * @param min Time from which to start generating the options.
 * @param max Time at which to stop generating the options.
 * @param interval Amount of seconds between each option.
 */
export function generateOptions<D>(
  adapter: DateAdapter<D>,
  formats: MatDateFormats,
  min: D,
  max: D,
  interval: number,
): MatTimepickerOption<D>[] {
  const options: MatTimepickerOption<D>[] = [];
  let current = adapter.compareTime(min, max) < 1 ? min : max;

  while (
    adapter.sameDate(current, min) &&
    adapter.compareTime(current, max) < 1 &&
    adapter.isValid(current)
  ) {
    options.push({value: current, label: adapter.format(current, formats.display.timeOptionLabel)});
    current = adapter.addSeconds(current, interval);
  }

  return options;
}

/** Checks whether a date adapter is set up correctly for use with the timepicker. */
export function validateAdapter(
  adapter: DateAdapter<unknown> | null,
  formats: MatDateFormats | null,
) {
  function missingAdapterError(provider: string) {
    return Error(
      `MatTimepicker: No provider found for ${provider}. You must add one of the following ` +
        `to your app config: provideNativeDateAdapter, provideDateFnsAdapter, ` +
        `provideLuxonDateAdapter, provideMomentDateAdapter, or provide a custom implementation.`,
    );
  }

  if (!adapter) {
    throw missingAdapterError('DateAdapter');
  }

  if (!formats) {
    throw missingAdapterError('MAT_DATE_FORMATS');
  }

  if (
    formats.display.timeInput === undefined ||
    formats.display.timeOptionLabel === undefined ||
    formats.parse.timeInput === undefined
  ) {
    throw new Error(
      'MatTimepicker: Incomplete `MAT_DATE_FORMATS` has been provided. ' +
        '`MAT_DATE_FORMATS` must provide `display.timeInput`, `display.timeOptionLabel` ' +
        'and `parse.timeInput` formats in order to be compatible with MatTimepicker.',
    );
  }
}
