/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {MatDateFormats} from '@angular/material/core';

export const MAT_DATE_FNS_FORMATS: MatDateFormats = {
  parse: {
    dateInput: 'P',
    timeInput: 'p',
  },
  display: {
    dateInput: 'P',
    timeInput: 'p',
    monthYearLabel: 'LLL uuuu',
    dateA11yLabel: 'PP',
    monthYearA11yLabel: 'LLLL uuuu',
    timeOptionLabel: 'p',
  },
};
