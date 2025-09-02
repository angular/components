/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgModule} from '@angular/core';
import {BidiModule} from '@angular/cdk/bidi';
import {MatRippleModule} from '../core';
import {MatButtonToggle, MatButtonToggleGroup} from './button-toggle';

@NgModule({
  imports: [MatRippleModule, MatButtonToggleGroup, MatButtonToggle],
  exports: [BidiModule, MatButtonToggleGroup, MatButtonToggle],
})
export class MatButtonToggleModule {}
