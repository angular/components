/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgModule} from '@angular/core';
import {MatCommonModule} from '@angular/material/core';
import {MatCheckbox} from './checkbox';
import {MatCheckboxRequiredValidator} from './checkbox-required-validator';

/**
 * @deprecated No longer used, `MatCheckbox` implements required validation directly.
 * @breaking-change 19.0.0
 */
@NgModule({
  imports: [MatCheckboxRequiredValidator],
  exports: [MatCheckboxRequiredValidator],
})
export class _MatCheckboxRequiredValidatorModule {}

@NgModule({
  imports: [MatCheckbox, MatCommonModule],
  exports: [MatCheckbox, MatCommonModule],
})
export class MatCheckboxModule {}
