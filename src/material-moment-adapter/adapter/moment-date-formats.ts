/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MatDateFormats} from '@angular/material';
import {CdkDateFormats} from '@angular/cdk/datetime';


export const MAT_MOMENT_DATE_FORMATS: MatDateFormats = {
  /**
   * @deprecated Remove `parse` and use `CDK_MOMENT_DATE_FORMATS` instead.
   * @breaking-change 8.0.0
   */
  parse: {
    dateInput: 'l',
  },
  display: {
    /**
     * @deprecated Remove `parse` and use `CDK_MOMENT_DATE_FORMATS` instead.
     * @breaking-change 8.0.0
     */
    dateInput: 'l',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

export const CDK_MOMENT_DATE_FORMATS: CdkDateFormats = {
  parse: {
    dateInput: 'l',
  },
  display: {
    dateInput: 'l',
  }
};
