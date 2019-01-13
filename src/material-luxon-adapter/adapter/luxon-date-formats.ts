/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MatDateFormats} from '@angular/material/core';


export const MAT_LUXON_DATE_FORMATS: MatDateFormats = {
  parse: {
    // Note: this isn't localized like `D`, however Luxon can't parse input against `D`.
    dateInput: 'L/d/yyyy',
  },
  display: {
    dateInput: 'D',
    monthYearLabel: 'LLL yyyy',
    dateA11yLabel: 'DD',
    monthYearA11yLabel: 'LLLL yyyy',
  },
};
