/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatSelect, MatSelectTrigger, MAT_SELECT_SCROLL_STRATEGY_PROVIDER} from './select';
import {MatSelectHeader} from './select-header';
import {MatCommonModule, MatOptionModule} from '@angular/material/core';
import {OverlayModule} from '@angular/cdk/overlay';
import {MatFormFieldModule} from '@angular/material/form-field';
import {ErrorStateMatcher} from '@angular/material/core';
import {A11yModule} from '@angular/cdk/a11y';


@NgModule({
  imports: [
    CommonModule,
    OverlayModule,
    MatOptionModule,
    MatCommonModule,
    A11yModule,
  ],
  exports: [
    MatFormFieldModule,
    MatSelect,
    MatSelectTrigger,
    MatSelectHeader,
    MatOptionModule,
    MatCommonModule,
  ],
  declarations: [MatSelect, MatSelectTrigger, MatSelectHeader],
  providers: [MAT_SELECT_SCROLL_STRATEGY_PROVIDER, ErrorStateMatcher]
})
export class MatSelectModule {}
