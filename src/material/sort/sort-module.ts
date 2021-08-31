/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatCommonModule} from '@angular/material/core';

import {MatSort} from './sort';
import {MatSortHeader} from './sort-header';
import {MAT_SORT_HEADER_INTL_PROVIDER} from './sort-header-intl';


@NgModule({
  imports: [CommonModule, MatCommonModule],
  exports: [MatSort, MatSortHeader],
  declarations: [MatSort, MatSortHeader],
  providers: [MAT_SORT_HEADER_INTL_PROVIDER]
})
export class MatSortModule {
}
