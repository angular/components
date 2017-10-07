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
import {MatCommonModule, MatOptionModule} from '@uiux/material/core';
import {OverlayModule} from '@uiux/cdk/overlay';
import {MatFormFieldModule} from '@uiux/material/form-field';
import {ErrorStateMatcher} from '@uiux/material/core';


@NgModule({
  imports: [
    CommonModule,
    OverlayModule,
    MatOptionModule,
    MatCommonModule,
  ],
  exports: [MatFormFieldModule, MatSelect, MatSelectTrigger, MatOptionModule, MatCommonModule],
  declarations: [MatSelect, MatSelectTrigger],
  providers: [MAT_SELECT_SCROLL_STRATEGY_PROVIDER, ErrorStateMatcher]
})
export class MatSelectModule {}
