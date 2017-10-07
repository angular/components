/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PlatformModule} from '@uiux/cdk/platform';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatFormFieldModule} from '@uiux/material/form-field';
import {MatTextareaAutosize} from './autosize';
import {MatInput} from './input';
import {ErrorStateMatcher} from '@uiux/material/core';


@NgModule({
  declarations: [
    MatInput,
    MatTextareaAutosize,
  ],
  imports: [
    CommonModule,
    MatFormFieldModule,
    PlatformModule,
  ],
  exports: [
    // We re-export the `MatFormFieldModule` since `MatInput` will almost always
    // be used together with `MatFormField`.
    MatFormFieldModule,
    MatInput,
    MatTextareaAutosize,
  ],
  providers: [ErrorStateMatcher],
})
export class MatInputModule {}
