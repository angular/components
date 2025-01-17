/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgModule} from '@angular/core';
import {MatCommonModule} from '@angular/material/core';
import {MatDivider} from './divider';

@NgModule({
  imports: [MatCommonModule, MatDivider],
  exports: [MatDivider, MatCommonModule],
})
export class MatDividerModule {}
