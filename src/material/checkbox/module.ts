/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatCommonModule, MatRippleModule} from '@angular/material/core';
import {MatCheckbox} from './checkbox';
import {MatCheckboxRequiredValidator} from './checkbox-required-validator';

/** This module is used by both original and MDC-based checkbox implementations. */
@NgModule({
  imports: [MatCheckboxRequiredValidator],
  exports: [MatCheckboxRequiredValidator],
})
export class _MatCheckboxRequiredValidatorModule {}

@NgModule({
  imports: [MatCommonModule, MatRippleModule, _MatCheckboxRequiredValidatorModule, MatCheckbox],
  exports: [MatCheckbox, MatCommonModule, _MatCheckboxRequiredValidatorModule],
})
export class MatCheckboxModule {}
