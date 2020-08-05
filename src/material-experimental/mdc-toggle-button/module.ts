/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatCommonModule, MatRippleModule} from '@angular/material/core';
import {MatToggleButton} from './toggle-button';
import {MatToggleButtonSegment} from './toggle-button-segment';

@NgModule({
  imports: [
    MatCommonModule,
    MatRippleModule,
    CommonModule
  ],
  exports: [
    MatToggleButton,
    MatToggleButtonSegment,
    MatCommonModule
  ],
  declarations: [
    MatToggleButton,
    MatToggleButtonSegment
  ]
})
export class MatToggleButtonModule { }
