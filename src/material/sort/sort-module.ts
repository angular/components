/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HAMMER_GESTURE_CONFIG} from '@angular/platform-browser';
import {GestureConfig} from '@angular/material/core';
import {MatSortHeader} from './sort-header';
import {MatSort} from './sort';
import {MAT_SORT_HEADER_INTL_PROVIDER} from './sort-header-intl';


@NgModule({
  imports: [CommonModule],
  exports: [MatSort, MatSortHeader],
  declarations: [MatSort, MatSortHeader],
  providers: [
    MAT_SORT_HEADER_INTL_PROVIDER,
    {provide: HAMMER_GESTURE_CONFIG, useClass: GestureConfig},
  ]
})
export class MatSortModule {}
