/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgModule} from '@angular/core';
import {MatRippleModule} from '../ripple/ripple-module';
import {MatPseudoCheckboxModule} from '../selection/pseudo-checkbox/pseudo-checkbox-module';
import {MatCommonModule} from '../common-behaviors/common-module';
import {MatOption} from './option';
import {MatOptgroup} from './optgroup';

@NgModule({
  imports: [MatRippleModule, MatCommonModule, MatPseudoCheckboxModule, MatOption, MatOptgroup],
  exports: [MatOption, MatOptgroup],
})
export class MatOptionModule {}
