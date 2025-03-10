/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgModule} from '@angular/core';
import {MatCommonModule, MatRippleModule} from '../core';
import {MatButtonToggle, MatButtonToggleGroup} from './button-toggle';

@NgModule({
  imports: [MatCommonModule, MatRippleModule, MatButtonToggleGroup, MatButtonToggle],
  exports: [MatCommonModule, MatButtonToggleGroup, MatButtonToggle],
})
export class MatButtonToggleModule {}
