/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PlatformModule} from '@angular/cdk/platform';
import {NgModule} from '@angular/core';
import {CdkForOf} from './for-of';
import {SCROLL_DISPATCHER_PROVIDER} from './scroll-dispatcher';
import {CdkScrollable} from './scrollable';
import {CdkVirtualScrollFixedSize} from './virtual-scroll-fixed-size';
import {CdkVirtualScrollViewport} from './virtual-scroll-viewport';

@NgModule({
  imports: [PlatformModule],
  exports: [
    CdkForOf,
    CdkScrollable,
    CdkVirtualScrollFixedSize,
    CdkVirtualScrollViewport,
  ],
  declarations: [
    CdkForOf,
    CdkScrollable,
    CdkVirtualScrollFixedSize,
    CdkVirtualScrollViewport,
  ],
  providers: [SCROLL_DISPATCHER_PROVIDER],
})
export class ScrollDispatchModule {}
