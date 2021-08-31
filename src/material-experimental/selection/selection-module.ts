/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// TODO(yifange): Move the table-specific code to a separate module from the other selection
// behaviors once we move it out of experiemental.
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatTableModule} from '@angular/material/table';

import {MatRowSelection} from './row-selection';
import {MatSelectAll} from './select-all';
import {MatSelection} from './selection';
import {MatSelectionColumn} from './selection-column';
import {MatSelectionToggle} from './selection-toggle';

@NgModule({
  imports: [
    CommonModule,
    MatTableModule,
    MatCheckboxModule,
  ],
  exports: [
    MatSelectAll,
    MatSelection,
    MatSelectionToggle,
    MatSelectionColumn,
    MatRowSelection,
  ],
  declarations: [
    MatSelectAll,
    MatSelection,
    MatSelectionToggle,
    MatSelectionColumn,
    MatRowSelection,
  ],
})
export class MatSelectionModule {
}
