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
import {MdSortIntl} from './sort-intl';
import {CommonModule} from '@angular/common';

export * from './sort-direction';
export * from './sort-header';
export * from './sort-intl';
export * from './sort';

@NgModule({
  imports: [CommonModule],
  exports: [MdSort, MdSortHeader],
  declarations: [MdSort, MdSortHeader],
  providers: [MdSortIntl]
})
export class MdSortModule {}
