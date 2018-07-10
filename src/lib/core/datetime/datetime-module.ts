/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MAT_DATE_FORMATS} from './date-formats';
import {MAT_NATIVE_DATE_FORMATS} from './native-date-formats';
import {NativeDateModule} from '@angular/cdk/datetime';

@NgModule({
    imports: [NativeDateModule],
    providers: [{provide: MAT_DATE_FORMATS, useValue: MAT_NATIVE_DATE_FORMATS}],
})
export class MatNativeDateModule {}
