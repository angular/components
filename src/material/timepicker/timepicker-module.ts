/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgModule} from '@angular/core';
import {CdkScrollableModule} from '@angular/cdk/scrolling';
import {MatTimepicker} from './timepicker';
import {MatTimepickerInput} from './timepicker-input';
import {MatTimepickerToggle} from './timepicker-toggle';

@NgModule({
  imports: [MatTimepicker, MatTimepickerInput, MatTimepickerToggle],
  exports: [CdkScrollableModule, MatTimepicker, MatTimepickerInput, MatTimepickerToggle],
})
export class MatTimepickerModule {}
