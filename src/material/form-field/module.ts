/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ObserversModule} from '@angular/cdk/observers';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatCommonModule} from '@angular/material/core';
import {MatError} from './directives/error';
import {MatHint} from './directives/hint';
import {MatLabel} from './directives/label';
import {MatPrefix} from './directives/prefix';
import {MatSuffix} from './directives/suffix';
import {MatFormField} from './form-field';

@NgModule({
  imports: [
    MatCommonModule,
    CommonModule,
    ObserversModule,
    MatFormField,
    MatLabel,
    MatError,
    MatHint,
    MatPrefix,
    MatSuffix,
  ],
  exports: [MatFormField, MatLabel, MatHint, MatError, MatPrefix, MatSuffix, MatCommonModule],
})
export class MatFormFieldModule {}
