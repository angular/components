/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgModule} from '@angular/core';
import {MatPseudoCheckbox} from './pseudo-checkbox';
import {MatCommonModule} from '../../common-behaviors/common-module';

@NgModule({
  imports: [MatCommonModule, MatPseudoCheckbox],
  exports: [MatPseudoCheckbox],
})
export class MatPseudoCheckboxModule {}
