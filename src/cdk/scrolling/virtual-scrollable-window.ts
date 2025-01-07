/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Directive, ElementRef, inject} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {CdkVirtualScrollable, VIRTUAL_SCROLLABLE} from './virtual-scrollable';

/**
 * Provides as virtual scrollable for the global / window scrollbar.
 */
@Directive({
  selector: 'cdk-virtual-scroll-viewport[scrollWindow]',
  providers: [{provide: VIRTUAL_SCROLLABLE, useExisting: CdkVirtualScrollableWindow}],
})
export class CdkVirtualScrollableWindow extends CdkVirtualScrollable {
  constructor(...args: unknown[]);

  constructor() {
    super();
    const document = inject(DOCUMENT);
    this.elementRef = new ElementRef(document.documentElement);
    this._scrollElement = document;
  }

  override measureBoundingClientRectWithScrollOffset(
    from: 'left' | 'top' | 'right' | 'bottom',
  ): number {
    return this.getElementRef().nativeElement.getBoundingClientRect()[from];
  }
}
