/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {DateAdapter, MD_DATE_FORMATS} from '@angular/material';
import {MomentDateAdapter} from './moment-date-adapter';
import {MD_MOMENT_DATE_FORMATS} from './moment-date-formats';

export * from './moment-date-adapter';
export * from './moment-date-formats';


@NgModule({
  providers: [{provide: DateAdapter, useClass: MomentDateAdapter}],
})
export class MomentDateModule {}


@NgModule({
  imports: [MomentDateModule],
  providers: [{provide: MD_DATE_FORMATS, useValue: MD_MOMENT_DATE_FORMATS}],
})
export class MdMomentDateModule {}
