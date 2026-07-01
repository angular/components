/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgModule, Provider} from '@angular/core';
import {DateAdapter, MAT_DATE_FORMATS, MatDateFormats} from '@angular/material/core';
import {
  LuxonDateAdapter,
  MAT_LUXON_DATE_ADAPTER_OPTIONS,
  MatLuxonDateAdapterOptions,
} from './luxon-date-adapter';
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

export function provideLuxonDateAdapter(
  formats: MatDateFormats = MAT_LUXON_DATE_FORMATS,
  options?: MatLuxonDateAdapterOptions,
): Provider[] {
  const providers: Provider[] = [
    {
      provide: DateAdapter,
      useClass: LuxonDateAdapter,
    },
    {provide: MAT_DATE_FORMATS, useValue: formats},
  ];

  if (options) {
    providers.push({provide: MAT_LUXON_DATE_ADAPTER_OPTIONS, useValue: options});
  }

  return providers;
}
