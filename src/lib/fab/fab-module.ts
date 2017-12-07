/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatCommonModule, MatRippleModule} from '@angular/material/core';
import {A11yModule} from '@angular/cdk/a11y';
import {MatFab, MatFabMini} from './fab';


@NgModule({
  imports: [
    CommonModule,
    MatRippleModule,
    MatCommonModule,
    A11yModule,
  ],
  exports: [
    MatFab,
    MatCommonModule,
    MatFabMini,
  ],
  declarations: [
    MatFab,
    MatFabMini,
  ],
})
export class MatFabModule {}
