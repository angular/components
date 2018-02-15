/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PlatformModule} from '@angular/cdk/platform';
import {NgModule} from '@angular/core';
import {CdkScrollable} from './scrollable';
import {CdkVirtualForOf} from './virtual-for-of';
import {CdkVirtualScrollFixedSize} from './virtual-scroll-fixed-size';
import {CdkVirtualScrollViewport} from './virtual-scroll-viewport';

@NgModule({
  imports: [PlatformModule],
  exports: [
    CdkVirtualForOf,
    CdkScrollable,
    CdkVirtualScrollFixedSize,
    CdkVirtualScrollViewport,
  ],
  declarations: [
    CdkVirtualForOf,
    CdkScrollable,
    CdkVirtualScrollFixedSize,
    CdkVirtualScrollViewport,
  ],
})
export class ScrollDispatchModule {}
