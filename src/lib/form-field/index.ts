/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {
  MdError,
  MdHint,
  MdFormField,
  MdPlaceholder,
  MdPrefix,
  MdSuffix
} from './form-field';
import {CommonModule} from '@angular/common';
import {PlatformModule} from '../core/platform/index';


@NgModule({
  declarations: [
    MdError,
    MdHint,
    MdFormField,
    MdPlaceholder,
    MdPrefix,
    MdSuffix,
  ],
  imports: [
    CommonModule,
    PlatformModule,
  ],
  exports: [
    MdError,
    MdHint,
    MdFormField,
    MdPlaceholder,
    MdPrefix,
    MdSuffix,
  ],
})
export class MdFormFieldModule {}


export * from './form-field';
export * from './form-field-errors';

