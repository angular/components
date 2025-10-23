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
import {MatTimepickerOptionTemplate} from './timepicker-option';
import {MatTimepickerToggle} from './timepicker-toggle';

@NgModule({
  imports: [MatTimepicker, MatTimepickerInput, MatTimepickerOptionTemplate, MatTimepickerToggle],
  exports: [
    CdkScrollableModule,
    MatTimepicker,
    MatTimepickerInput,
    MatTimepickerOptionTemplate,
    MatTimepickerToggle,
  ],
})
export class MatTimepickerModule {}
