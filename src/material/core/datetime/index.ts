/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgModule, Provider} from '@angular/core';
import {DateAdapter} from './date-adapter';
import {MAT_DATE_FORMATS, MatDateFormats} from './date-formats';
import {NativeDateAdapter} from './native-date-adapter';
import {MAT_NATIVE_DATE_FORMATS} from './native-date-formats';

export * from './date-adapter';
export * from './date-formats';
export * from './native-date-adapter';
export * from './native-date-formats';

@NgModule({
  providers: [{provide: DateAdapter, useClass: NativeDateAdapter}],
})
export class NativeDateModule {}

@NgModule({
  providers: [provideNativeDateAdapter()],
})
export class MatNativeDateModule {}

export function provideNativeDateAdapter(
  formats: MatDateFormats = MAT_NATIVE_DATE_FORMATS,
): Provider[] {
  return [
    {provide: DateAdapter, useClass: NativeDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: formats},
  ];
}
