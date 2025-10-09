/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken} from '@angular/core';

export type MatDateFormats<DisplayFormatType = string, ParseFormatType = DisplayFormatType> = {
  parse: {
    dateInput: ParseFormatType;
    timeInput: ParseFormatType;
  };
  display: {
    dateInput: DisplayFormatType;
    monthLabel?: DisplayFormatType;
    monthYearLabel: DisplayFormatType;
    dateA11yLabel: DisplayFormatType;
    monthYearA11yLabel: DisplayFormatType;
    timeInput?: DisplayFormatType;
    timeOptionLabel?: DisplayFormatType;
  };
};

export const MAT_DATE_FORMATS = new InjectionToken<MatDateFormats>('mat-date-formats');
