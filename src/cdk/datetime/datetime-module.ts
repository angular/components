/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DateAdapter} from './date-adapter';
import {NativeDateAdapter} from './native-date-adapter';
import {NgModule} from '@angular/core';
import {PlatformModule} from '@angular/cdk/platform';

@NgModule({
    imports: [PlatformModule],
    providers: [
        {provide: DateAdapter, useClass: NativeDateAdapter},
    ],
})
export class NativeDateModule {}
