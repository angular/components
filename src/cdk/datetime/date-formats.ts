/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectionToken} from '@angular/core';


export type CdkDateFormats = {
  parse: {
    dateInput: any
  },
  display: {
    dateInput: any,
  }
};


export const CDK_DATE_FORMATS = new InjectionToken<CdkDateFormats>('cdk-date-formats');
