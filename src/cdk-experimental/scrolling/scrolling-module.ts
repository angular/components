/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {CdkVirtualForOf} from './virtual-for-of';
import {CdkFixedSizeVirtualScroll} from './fixed-size-virtual-scroll';
import {CdkVirtualScrollViewport} from './virtual-scroll-viewport';


@NgModule({
  exports: [
    CdkVirtualForOf,
    CdkFixedSizeVirtualScroll,
    CdkVirtualScrollViewport,
  ],
  declarations: [
    CdkVirtualForOf,
    CdkFixedSizeVirtualScroll,
    CdkVirtualScrollViewport,
  ],
})
export class ScrollingModule {}
