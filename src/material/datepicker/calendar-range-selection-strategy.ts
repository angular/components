/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable, InjectionToken} from '@angular/core';
import {DateAdapter} from '@angular/material/core';
import {DateRange} from './date-selection-model';

// TODO(crisbeto): this needs to be expanded to allow for the preview range to be customized.

/** Injection token used to customize the date range selection behavior. */
export const MAT_CALENDAR_RANGE_SELECTION_STRATEGY =
    new InjectionToken<MatCalendarRangeSelectionStrategy<any>>(
        'MAT_CALENDAR_RANGE_SELECTION_STRATEGY');

/** Object that can be provided in order to customize the date range selection behavior. */
export interface MatCalendarRangeSelectionStrategy<D> {
  /** Called when the user has finished selecting a value. */
  selectionFinished(date: D | null, currentRange: DateRange<D>, event: Event): DateRange<D>;
}

/** Provides the default date range selection behavior. */
@Injectable()
export class DefaultMatCalendarRangeStrategy<D> implements MatCalendarRangeSelectionStrategy<D> {
  constructor(private _dateAdapter: DateAdapter<D>) {}

  selectionFinished(date: D, currentRange: DateRange<D>) {
    let {start, end} = currentRange;

    if (start == null) {
      start = date;
    } else if (end == null && date && this._dateAdapter.compareDate(date, start) > 0) {
      end = date;
    } else {
      start = date;
      end = null;
    }

    return new DateRange<D>(start, end);
  }
}
