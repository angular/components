/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {OverlayModule} from '@angular/cdk/overlay';
import {CdkScrollableModule} from '@angular/cdk/scrolling';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatCommonModule, MatRippleModule} from '@angular/material-experimental/mdc-core';
import {_MatMenuDirectivesModule} from '@angular/material/menu';

import {MAT_MENU_SCROLL_STRATEGY_FACTORY_PROVIDER, MatMenu} from './menu';
import {MatMenuItem} from './menu-item';

@NgModule({
  imports:
      [CommonModule, MatRippleModule, MatCommonModule, OverlayModule, _MatMenuDirectivesModule],
  exports: [CdkScrollableModule, MatMenu, MatCommonModule, MatMenuItem, _MatMenuDirectivesModule],
  declarations: [MatMenu, MatMenuItem],
  providers: [MAT_MENU_SCROLL_STRATEGY_FACTORY_PROVIDER]
})
export class MatMenuModule {
}
