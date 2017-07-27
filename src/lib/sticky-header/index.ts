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
import {CdkStickyRegion, CdkStickyHeader,
  STICKY_HEADER_SUPPORT_STRATEGY} from './sticky-header';
import {isPositionStickySupported} from '@angular/cdk';



@NgModule({
  imports: [OverlayModule, MdCommonModule, CommonModule, PlatformModule],
  declarations: [CdkStickyRegion, CdkStickyHeader],
  exports: [CdkStickyRegion, CdkStickyHeader, MdCommonModule],
  providers: [{provide: STICKY_HEADER_SUPPORT_STRATEGY, useFactory: isPositionStickySupported}]
})
export class StickyHeaderModule {}


export * from './sticky-header';
