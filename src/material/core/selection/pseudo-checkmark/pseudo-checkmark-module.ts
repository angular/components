/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatPseudoCheckmark} from './pseudo-checkmark';
import {MatCommonModule} from '../../common-behaviors/common-module';

@NgModule({
  imports: [MatCommonModule],
  exports: [MatPseudoCheckmark],
  declarations: [MatPseudoCheckmark],
})
export class MatPseudoCheckmarkModule {}
