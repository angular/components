/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BidiModule} from '@angular/cdk/bidi';
import {NgModule} from '@angular/core';
import {CdkFixedSizeVirtualScroll} from './fixed-size-virtual-scroll';
import {CdkMultiColumnsVirtualScroll} from './multi-columns-virtual-scroll';
import {CdkScrollable} from './scrollable';
import {CdkVirtualForOf} from './virtual-for-of';
import {CdkVirtualScrollViewport} from './virtual-scroll-viewport';
import {CdkVirtualScrollableElement} from './virtual-scrollable-element';
import {CdkVirtualScrollableWindow} from './virtual-scrollable-window';

@NgModule({
  exports: [CdkScrollable],
  imports: [CdkScrollable],
})
export class CdkScrollableModule {}

/**
 * @docs-primary-export
 */
@NgModule({
  imports: [
    BidiModule,
    CdkScrollableModule,
    CdkVirtualScrollViewport,
    CdkFixedSizeVirtualScroll,
    CdkMultiColumnsVirtualScroll,
    CdkVirtualForOf,
    CdkVirtualScrollableWindow,
    CdkVirtualScrollableElement,
  ],
  exports: [
    BidiModule,
    CdkScrollableModule,
    CdkFixedSizeVirtualScroll,
    CdkMultiColumnsVirtualScroll,
    CdkVirtualForOf,
    CdkVirtualScrollViewport,
    CdkVirtualScrollableWindow,
    CdkVirtualScrollableElement,
  ],
})
export class ScrollingModule {}
