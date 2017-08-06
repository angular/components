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
  MdInput,
  MdPlaceholder,
  MdPrefix,
  MdSuffix
} from './input-container';
import {MdTextareaAutosize} from './autosize';
import {CommonModule} from '@angular/common';
import {PlatformModule} from '../core/platform/index';


@NgModule({
  declarations: [
    MdError,
    MdHint,
    MdFormField,
    MdInput,
    MdPlaceholder,
    MdPrefix,
    MdSuffix,
    MdTextareaAutosize,
  ],
  imports: [
    CommonModule,
    PlatformModule,
  ],
  exports: [
    MdError,
    MdHint,
    MdFormField,
    MdInput,
    MdPlaceholder,
    MdPrefix,
    MdSuffix,
    MdTextareaAutosize,
  ],
})
export class MdInputModule {}


export * from './autosize';
export * from './input-container';
export * from './input-container-errors';

