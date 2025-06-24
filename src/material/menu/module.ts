/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgModule} from '@angular/core';
import {MatCommonModule, MatRippleModule} from '../core';
import {OverlayModule} from '@angular/cdk/overlay';
import {CdkScrollableModule} from '@angular/cdk/scrolling';
import {MatMenu} from './menu';
import {MatMenuItem} from './menu-item';
import {MatMenuContent} from './menu-content';
import {MatMenuTrigger} from './menu-trigger';
import {MAT_MENU_SCROLL_STRATEGY_FACTORY_PROVIDER} from './menu-trigger-base';
import {MatContextMenuTrigger} from './context-menu-trigger';

@NgModule({
  imports: [
    MatRippleModule,
    MatCommonModule,
    OverlayModule,
    MatMenu,
    MatMenuItem,
    MatMenuContent,
    MatMenuTrigger,
    MatContextMenuTrigger,
  ],
  exports: [
    CdkScrollableModule,
    MatMenu,
    MatCommonModule,
    MatMenuItem,
    MatMenuContent,
    MatMenuTrigger,
    MatContextMenuTrigger,
  ],
  providers: [MAT_MENU_SCROLL_STRATEGY_FACTORY_PROVIDER],
})
export class MatMenuModule {}
