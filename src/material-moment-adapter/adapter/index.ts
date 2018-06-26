/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MAT_DATE_FORMATS} from '@angular/material';
import {
  DateAdapter,
  CDK_DATE_LOCALE,
} from '@angular/cdk/datetime';
import {MomentDateAdapter} from './moment-date-adapter';
import {MAT_MOMENT_DATE_FORMATS} from './moment-date-formats';

export * from './moment-date-adapter';
export * from './moment-date-formats';


@NgModule({
  providers: [
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [CDK_DATE_LOCALE]}
  ],
})
export class MomentDateModule {}


@NgModule({
  imports: [MomentDateModule],
  providers: [{provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS}],
})
export class MatMomentDateModule {}
