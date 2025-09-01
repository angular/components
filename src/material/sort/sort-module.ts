/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgModule} from '@angular/core';
import {MatSortHeader} from './sort-header';
import {MatSort} from './sort';
import {MatCommonModule} from '../core';

@NgModule({
  imports: [MatCommonModule, MatSort, MatSortHeader],
  exports: [MatSort, MatSortHeader],
})
export class MatSortModule {}
