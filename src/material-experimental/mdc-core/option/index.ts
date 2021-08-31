/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatPseudoCheckboxModule, MatRippleModule} from '@angular/material/core';

import {MatOptgroup} from './optgroup';
import {MatOption} from './option';


@NgModule({
  imports: [MatRippleModule, CommonModule, MatPseudoCheckboxModule],
  exports: [MatOption, MatOptgroup],
  declarations: [MatOption, MatOptgroup]
})
export class MatOptionModule {
}


export * from './option';
export * from './optgroup';
export {
  MatOptionSelectionChange,
  MatOptionParentComponent,
  MAT_OPTION_PARENT_COMPONENT,
  _countGroupLabelsBeforeOption,
  _getOptionScrollPosition
} from '@angular/material/core';
