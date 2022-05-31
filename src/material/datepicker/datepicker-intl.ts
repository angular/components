/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';

/* Datepicker data the requires translations to be implmented in subclass. */
export abstract class BaseMatDatepickerIntl {
  /**
   * Stream that emits whenever the labels here are changed. Use this to notify
   * components if the labels have changed after initialization.
   */
  readonly changes: Subject<void> = new Subject<void>();

  /** Formats a range of years. */
  formatYearRange(start: string, end: string): string {
    return `${start} \u2013 ${end}`;
  }

  /** A label for the calendar popup (used by screen readers). */
  abstract calendarLabel: string;

  /**
   * A label for the button used to open the calendar popup (used by screen
   * readers).
   */
  abstract openCalendarLabel: string;

  /** Label for the button used to close the calendar popup. */
  abstract closeCalendarLabel: string;

  /** A label for the previous month button (used by screen readers). */
  abstract prevMonthLabel: string;

  /** A label for the next month button (used by screen readers). */
  abstract nextMonthLabel: string;

  /** A label for the previous year button (used by screen readers). */
  abstract prevYearLabel: string;

  /** A label for the next year button (used by screen readers). */
  abstract nextYearLabel: string;

  /** A label for the previous multi-year button (used by screen readers). */
  abstract prevMultiYearLabel: string;

  /** A label for the next multi-year button (used by screen readers). */
  abstract nextMultiYearLabel: string;

  /** A label for the 'switch to month view' button (used by screen readers). */
  abstract switchToMonthViewLabel: string;

  /** A label for the 'switch to year view' button (used by screen readers). */
  abstract switchToMultiYearViewLabel: string;
}

/** Datepicker data with translations (en). */
@Injectable({providedIn: 'root'})
export class MatDatepickerIntl extends BaseMatDatepickerIntl {
  calendarLabel = 'Calendar';

  openCalendarLabel = 'Open calendar';

  closeCalendarLabel = 'Close calendar';

  prevMonthLabel = 'Previous month';

  nextMonthLabel = 'Next month';

  prevYearLabel = 'Previous year';

  nextYearLabel = 'Next year';

  prevMultiYearLabel = 'Previous 24 years';

  nextMultiYearLabel = 'Next 24 years';

  switchToMonthViewLabel = 'Choose date';

  switchToMultiYearViewLabel = 'Choose month and year';
}
