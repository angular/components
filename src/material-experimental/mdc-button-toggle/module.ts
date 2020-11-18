/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatCommonModule, MatRippleModule} from '@angular/material/core';
import {MatButtonToggle, MatButtonToggleGroup} from './button-toggle';
import {CommonModule} from '@angular/common';

@NgModule({
  imports: [MatCommonModule, MatRippleModule, CommonModule],
  exports: [MatButtonToggle, MatButtonToggleGroup, MatCommonModule],
  declarations: [MatButtonToggle, MatButtonToggleGroup],
})
export class MatButtonToggleModule {
}
