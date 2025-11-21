/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {BidiModule} from '@angular/cdk/bidi';
import {TextFieldModule} from '@angular/cdk/text-field';
import {NgModule} from '@angular/core';
import {MatFormFieldModule} from '../form-field';
import {MatInput} from './input';

@NgModule({
  imports: [MatFormFieldModule, MatInput],
  exports: [MatInput, MatFormFieldModule, TextFieldModule, BidiModule],
})
export class MatInputModule {}
