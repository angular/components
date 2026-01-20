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
  MAT_TEMPORAL_DATE_ADAPTER_OPTIONS,
  MatTemporalDateAdapterOptions,
  TemporalDateAdapter,
} from './temporal-date-adapter';
import {MAT_TEMPORAL_DATE_FORMATS} from './temporal-date-formats';

export * from './temporal-date-adapter';
export * from './temporal-date-formats';

/**
 * Module providing the Temporal date adapter.
 * @deprecated Use `provideTemporalDateAdapter` instead.
 */
@NgModule({
  providers: [
    {
      provide: DateAdapter,
      useClass: TemporalDateAdapter,
    },
  ],
})
export class TemporalModule {}

/**
 * Module providing the Temporal date adapter with default formats.
 *
 * @example
 * ```typescript
 * import { MatTemporalModule } from '@angular/material-temporal-adapter';
 *
 * @NgModule({
 *   imports: [MatTemporalModule],
 * })
 * export class AppModule {}
 * ```
 */
@NgModule({
  providers: [provideTemporalDateAdapter()],
})
export class MatTemporalModule {}

/**
 * Provider function for the Temporal date adapter.
 *
 * @param formats Custom date formats to use. Defaults to MAT_TEMPORAL_DATE_FORMATS.
 * @param options Configuration options for the adapter.
 * @returns Array of providers for the Temporal date adapter.
 *
 * @example
 * ```typescript
 * import { provideTemporalDateAdapter } from '@angular/material-temporal-adapter';
 *
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideTemporalDateAdapter(),
 *   ],
 * });
 * ```
 *
 * @example
 * With custom options:
 * ```typescript
 * import {
 *   provideTemporalDateAdapter,
 *   MAT_TEMPORAL_DATETIME_FORMATS
 * } from '@angular/material-temporal-adapter';
 *
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideTemporalDateAdapter(MAT_TEMPORAL_DATETIME_FORMATS, {
 *       calendar: 'islamic',
 *       mode: 'datetime',
 *     }),
 *   ],
 * });
 * ```
 */
export function provideTemporalDateAdapter(
  formats: MatDateFormats = MAT_TEMPORAL_DATE_FORMATS,
  options?: Partial<MatTemporalDateAdapterOptions>,
): Provider[] {
  const providers: Provider[] = [
    {
      provide: DateAdapter,
      useClass: TemporalDateAdapter,
    },
    {provide: MAT_DATE_FORMATS, useValue: formats},
  ];

  if (options) {
    const zonedOptions = options.mode === 'zoned' ? options : null;
    providers.push({
      provide: MAT_TEMPORAL_DATE_ADAPTER_OPTIONS,
      useValue: {
        calendar: options.calendar ?? 'iso8601',
        outputCalendar: options.outputCalendar,
        mode: options.mode ?? 'date',
        firstDayOfWeek: options.firstDayOfWeek,
        overflow: options.overflow,
        ...(zonedOptions
          ? {
              timezone: zonedOptions.timezone,
              disambiguation: zonedOptions.disambiguation,
              offset: zonedOptions.offset,
              rounding: zonedOptions.rounding,
            }
          : {}),
      },
    });
  }

  return providers;
}
