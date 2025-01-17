/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Directive, InjectionToken} from '@angular/core';
import {CdkScrollable} from './scrollable';

export const VIRTUAL_SCROLLABLE = new InjectionToken<CdkVirtualScrollable>('VIRTUAL_SCROLLABLE');

/**
 * Extending the {@link CdkScrollable} to be used as scrolling container for virtual scrolling.
 */
@Directive()
export abstract class CdkVirtualScrollable extends CdkScrollable {
  constructor(...args: unknown[]);
  constructor() {
    super();
  }

  /**
   * Measure the viewport size for the provided orientation.
   *
   * @param orientation The orientation to measure the size from.
   */
  measureViewportSize(orientation: 'horizontal' | 'vertical') {
    const viewportEl = this.elementRef.nativeElement;
    return orientation === 'horizontal' ? viewportEl.clientWidth : viewportEl.clientHeight;
  }

  /**
   * Measure the bounding DOMRect size including the scroll offset.
   *
   * @param from The edge to measure from.
   */
  abstract measureBoundingClientRectWithScrollOffset(
    from: 'left' | 'top' | 'right' | 'bottom',
  ): number;
}
