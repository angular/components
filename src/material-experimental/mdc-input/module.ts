/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TextFieldModule} from '@angular/cdk/text-field';
import {NgModule} from '@angular/core';
import {MatCommonModule} from '@angular/material/core';
import {MatFormFieldModule} from '@angular/material-experimental/mdc-form-field';
import {MatInput} from './input';

@NgModule({
  declarations: [MatInput],
  exports: [MatInput]
})
export class _MatInputDeclarationModule {}

@NgModule({
  imports: [MatCommonModule, MatFormFieldModule],
  exports: [MatFormFieldModule, TextFieldModule, MatCommonModule, _MatInputDeclarationModule],
})
export class MatInputModule {}
