/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectionToken} from '@angular/core';
import {CdkDateFormats} from '@angular/cdk/datetime';


export type MatDateFormats = CdkDateFormats & {
  display: {
    monthYearLabel: any,
    dateA11yLabel: any,
    monthYearA11yLabel: any,
  }
};


export const MAT_DATE_FORMATS = new InjectionToken<MatDateFormats>('mat-date-formats');
