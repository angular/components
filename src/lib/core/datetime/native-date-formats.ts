/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MatDateFormats} from './date-formats';


export const MAT_NATIVE_DATE_FORMATS: MatDateFormats = {
  /**
   * @deprecated Removing `parse` and use `CDK_NATIVE_DATE_FORMATS` instead.
   * @breaking-change 8.0.0
   */
  parse: {
    dateInput: null,
  },
  display: {
    /**
     * @deprecated Removing `dateInput` and use `CDK_NATIVE_DATE_FORMATS` instead.
     * @breaking-change 8.0.0
     */
    dateInput: {year: 'numeric', month: 'numeric', day: 'numeric'},
    monthYearLabel: {year: 'numeric', month: 'short'},
    dateA11yLabel: {year: 'numeric', month: 'long', day: 'numeric'},
    monthYearA11yLabel: {year: 'numeric', month: 'long'},
  }
};
