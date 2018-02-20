/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {CdkVirtualForOf} from './virtual-for-of';
import {CdkVirtualScrollFixedSize} from './virtual-scroll-fixed-size';
import {CdkVirtualScrollViewport} from './virtual-scroll-viewport';


@NgModule({
  exports: [
    CdkVirtualForOf,
    CdkVirtualScrollFixedSize,
    CdkVirtualScrollViewport,
  ],
  declarations: [
    CdkVirtualForOf,
    CdkVirtualScrollFixedSize,
    CdkVirtualScrollViewport,
  ],
})
export class ScrollingModule {}
