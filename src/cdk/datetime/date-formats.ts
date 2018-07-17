/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectionToken} from '@angular/core';


/**
 * Collection of formats the datepicker uses when displaying and parsing dates.
 */
export type CdkDateFormats = {
  parse: {
    dateInput: any
  },
  display: {
    dateInput: any,
  }
};


/**
 * Injection token for formats the datepicker uses when displaying and parsing dates.
 */
export const CDK_DATE_FORMATS = new InjectionToken<CdkDateFormats>('cdk-date-formats');
