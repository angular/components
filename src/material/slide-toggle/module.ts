/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgModule} from '@angular/core';
import {MatCommonModule} from '../core';
import {MatSlideToggle} from './slide-toggle';
import {MatSlideToggleRequiredValidator} from './slide-toggle-required-validator';

/**
 * @deprecated No longer used, `MatSlideToggle` implements required validation directly.
 * @breaking-change 19.0.0
 */
@NgModule({
  imports: [MatSlideToggleRequiredValidator],
  exports: [MatSlideToggleRequiredValidator],
})
export class _MatSlideToggleRequiredValidatorModule {}

@NgModule({
  imports: [MatSlideToggle, MatCommonModule],
  exports: [MatSlideToggle, MatCommonModule],
})
export class MatSlideToggleModule {}
