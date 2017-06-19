/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MdSortHeader} from './sort-header';
import {MdSort} from './sort';

export * from './sort-header';
export * from './sort';

@NgModule({
  exports: [MdSort, MdSortHeader],
  declarations: [MdSort, MdSortHeader],
})
export class MdSortModule {}

