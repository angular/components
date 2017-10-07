/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatCommonModule} from '@uiux/material/core';
import {OverlayModule} from '@uiux/cdk/overlay';
import {MatMenu, MAT_MENU_DEFAULT_OPTIONS} from './menu-directive';
import {MatMenuItem} from './menu-item';
import {MatMenuTrigger, MAT_MENU_SCROLL_STRATEGY_PROVIDER} from './menu-trigger';
import {MatRippleModule} from '@uiux/material/core';


@NgModule({
  imports: [
    OverlayModule,
    CommonModule,
    MatRippleModule,
    MatCommonModule,
  ],
  exports: [MatMenu, MatMenuItem, MatMenuTrigger, MatCommonModule],
  declarations: [MatMenu, MatMenuItem, MatMenuTrigger],
  providers: [
    MAT_MENU_SCROLL_STRATEGY_PROVIDER,
    {
      provide: MAT_MENU_DEFAULT_OPTIONS,
      useValue: {
        overlapTrigger: true,
        xPosition: 'after',
        yPosition: 'below',
      },
    }
  ],
})
export class MatMenuModule {}
