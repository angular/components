/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TextFieldModule} from '@angular/cdk/text-field';
import {NgModule} from '@angular/core';
import {MatCommonModule} from '@angular/material/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInput} from './input';

@NgModule({
  imports: [MatCommonModule, MatFormFieldModule, MatInput],
  exports: [MatInput, MatFormFieldModule, TextFieldModule, MatCommonModule],
})
export class MatInputModule {}
