/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {OverlayModule} from '@angular/cdk/overlay';
import {NgModule} from '@angular/core';
import {MatCommonModule, MatOptionModule} from '../core';
import {MatFormFieldModule} from '../form-field';
import {CdkScrollableModule} from '@angular/cdk/scrolling';
import {MatSelect, MatSelectTrigger, MAT_SELECT_SCROLL_STRATEGY_PROVIDER} from './select';

@NgModule({
  imports: [OverlayModule, MatOptionModule, MatCommonModule, MatSelect, MatSelectTrigger],
  exports: [
    CdkScrollableModule,
    MatFormFieldModule,
    MatSelect,
    MatSelectTrigger,
    MatOptionModule,
    MatCommonModule,
  ],
  providers: [MAT_SELECT_SCROLL_STRATEGY_PROVIDER],
})
export class MatSelectModule {}
