/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgModule, Provider} from '@angular/core';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MatDateFormats,
} from '@angular/material/core';
import {
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MatMomentDateAdapterOptions,
  MomentDateAdapter,
} from './moment-date-adapter';
import {MAT_MOMENT_DATE_FORMATS} from './moment-date-formats';

export * from './moment-date-adapter';
export * from './moment-date-formats';

@NgModule({
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
  ],
})
export class MomentDateModule {}

@NgModule({
  providers: [provideMomentDateAdapter()],
})
export class MatMomentDateModule {}

export function provideMomentDateAdapter(
  formats: MatDateFormats = MAT_MOMENT_DATE_FORMATS,
  options?: MatMomentDateAdapterOptions,
): Provider[] {
  const providers: Provider[] = [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    {provide: MAT_DATE_FORMATS, useValue: formats},
  ];

  if (options) {
    providers.push({provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: options});
  }

  return providers;
}
