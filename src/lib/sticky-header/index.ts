/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OverlayModule, MdCommonModule, PlatformModule} from '../core';
import {
  CdkStickyRegion,
  CdkStickyHeader,
  STICKY_HEADER_SUPPORT_STRATEGY_PROVIDER
} from './sticky-header';


@NgModule({
  imports: [OverlayModule, MdCommonModule, CommonModule, PlatformModule],
  declarations: [CdkStickyRegion, CdkStickyHeader],
  exports: [CdkStickyRegion, CdkStickyHeader, MdCommonModule],
  providers: [STICKY_HEADER_SUPPORT_STRATEGY_PROVIDER]
})
export class StickyHeaderModule {}


export * from './sticky-header';
