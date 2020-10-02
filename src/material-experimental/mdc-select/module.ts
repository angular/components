/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {OverlayModule} from '@angular/cdk/overlay';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatCommonModule} from '@angular/material/core';
import {MatOptionModule} from '@angular/material-experimental/mdc-core';
import {MatFormFieldModule} from '@angular/material-experimental/mdc-form-field';
import {CdkScrollableModule} from '@angular/cdk/scrolling';
import {MAT_SELECT_SCROLL_STRATEGY_PROVIDER} from '@angular/material/select';
import {MatSelect, MatSelectTrigger} from './select';

@NgModule({
  declarations: [MatSelect, MatSelectTrigger],
  exports: [MatSelect, MatSelectTrigger]
})
export class _MatSelectDeclarationModule {}

@NgModule({
  imports: [
    CommonModule,
    OverlayModule,
    MatOptionModule,
    MatCommonModule,
  ],
  exports: [
    CdkScrollableModule,
    MatFormFieldModule,
    MatOptionModule,
    MatCommonModule,
    _MatSelectDeclarationModule,
  ],
  providers: [MAT_SELECT_SCROLL_STRATEGY_PROVIDER]
})
export class MatSelectModule {}
