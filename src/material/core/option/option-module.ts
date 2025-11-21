/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {BidiModule} from '@angular/cdk/bidi';
import {NgModule} from '@angular/core';
import {MatRippleModule} from '../ripple/ripple-module';
import {MatPseudoCheckboxModule} from '../selection/pseudo-checkbox/pseudo-checkbox-module';
import {MatOption} from './option';
import {MatOptgroup} from './optgroup';

@NgModule({
  imports: [MatRippleModule, MatPseudoCheckboxModule, MatOption, MatOptgroup],
  exports: [MatOption, MatOptgroup, BidiModule],
})
export class MatOptionModule {}
