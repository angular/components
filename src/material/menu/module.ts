/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatCommonModule, MatRippleModule} from '@angular/material/core';
import {OverlayModule} from '@angular/cdk/overlay';
import {CdkScrollableModule} from '@angular/cdk/scrolling';
import {MatMenu} from './menu';
import {MatMenuItem} from './menu-item';
import {MatMenuContent} from './menu-content';
import {MAT_MENU_SCROLL_STRATEGY_FACTORY_PROVIDER, MatMenuTrigger} from './menu-trigger';

@NgModule({
  imports: [
    CommonModule,
    MatRippleModule,
    MatCommonModule,
    OverlayModule,
    MatMenu,
    MatMenuItem,
    MatMenuContent,
    MatMenuTrigger,
  ],
  exports: [
    CdkScrollableModule,
    MatMenu,
    MatCommonModule,
    MatMenuItem,
    MatMenuContent,
    MatMenuTrigger,
  ],
  providers: [MAT_MENU_SCROLL_STRATEGY_FACTORY_PROVIDER],
})
export class MatMenuModule {}
