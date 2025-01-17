/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken} from '@angular/core';

export type MatDateFormats = {
  parse: {
    dateInput: any;
    timeInput?: any;
  };
  display: {
    dateInput: any;
    monthLabel?: any;
    monthYearLabel: any;
    dateA11yLabel: any;
    monthYearA11yLabel: any;
    timeInput?: any;
    timeOptionLabel?: any;
  };
};

export const MAT_DATE_FORMATS = new InjectionToken<MatDateFormats>('mat-date-formats');
