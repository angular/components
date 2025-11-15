/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgModule, Provider} from '@angular/core';
import {DateAdapter, MAT_DATE_FORMATS} from '@angular/material/core';
import {LuxonDateAdapter} from './luxon-date-adapter';
import {MAT_LUXON_DATE_FORMATS} from './luxon-date-formats';

export * from './luxon-date-adapter';
export * from './luxon-date-formats';

@NgModule({
  providers: [
    {
      provide: DateAdapter,
      useClass: LuxonDateAdapter,
    },
  ],
})
export class LuxonDateModule {}

@NgModule({
  providers: [provideLuxonDateAdapter()],
})
export class MatLuxonDateModule {}

export function provideLuxonDateAdapter(formats = MAT_LUXON_DATE_FORMATS): Provider[] {
  return [
    {
      provide: DateAdapter,
      useClass: LuxonDateAdapter,
    },
    {provide: MAT_DATE_FORMATS, useValue: formats},
  ];
}
