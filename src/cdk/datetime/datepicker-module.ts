/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {CdkDatepicker} from './datepicker';
import {CdkDatepickerInput} from './datepicker-input';

const EXPORTED_DECLARATIONS = [
  CdkDatepicker,
  CdkDatepickerInput,
];

@NgModule({
  exports: EXPORTED_DECLARATIONS,
  declarations: EXPORTED_DECLARATIONS,
})
export class CdkDatepickerModule {}
