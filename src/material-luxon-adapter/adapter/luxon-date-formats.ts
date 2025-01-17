/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {MatDateFormats} from '@angular/material/core';

export const MAT_LUXON_DATE_FORMATS: MatDateFormats = {
  parse: {
    dateInput: 'D',
    timeInput: 't',
  },
  display: {
    dateInput: 'D',
    timeInput: 't',
    monthYearLabel: 'LLL yyyy',
    dateA11yLabel: 'DD',
    monthYearA11yLabel: 'LLLL yyyy',
    timeOptionLabel: 't',
  },
};
