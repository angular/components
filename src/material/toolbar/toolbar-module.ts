/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgModule} from '@angular/core';
import {MatCommonModule} from '../core';
import {MatToolbar, MatToolbarRow} from './toolbar';

@NgModule({
  imports: [MatCommonModule, MatToolbar, MatToolbarRow],
  exports: [MatToolbar, MatToolbarRow, MatCommonModule],
})
export class MatToolbarModule {}
