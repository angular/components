/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {MatDateFormats} from '@angular/material/core';

export const MAT_MOMENT_DATE_FORMATS: MatDateFormats = {
  parse: {
    dateInput: 'l',
    timeInput: 'LT',
  },
  display: {
    dateInput: 'l',
    timeInput: 'LT',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
    timeOptionLabel: 'LT',
  },
};
