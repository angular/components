/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgModule} from '@angular/core';
import {CdkAutofill} from './autofill';
import {CdkTextareaAutosize} from './autosize';

@NgModule({
  imports: [CdkAutofill, CdkTextareaAutosize],
  exports: [CdkAutofill, CdkTextareaAutosize],
})
export class TextFieldModule {}
