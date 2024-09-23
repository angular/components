/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CdkTableModule} from '@angular/cdk/table';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';

import {CdkRowSelection} from './row-selection';
import {CdkSelectAll} from './select-all';
import {CdkSelection} from './selection';
import {CdkSelectionColumn} from './selection-column';
import {CdkSelectionToggle} from './selection-toggle';

@NgModule({
  imports: [
    CommonModule,
    CdkTableModule,
    CdkSelection,
    CdkSelectionToggle,
    CdkSelectAll,
    CdkSelectionColumn,
    CdkRowSelection,
  ],
  exports: [CdkSelection, CdkSelectionToggle, CdkSelectAll, CdkSelectionColumn, CdkRowSelection],
})
export class CdkSelectionModule {}
