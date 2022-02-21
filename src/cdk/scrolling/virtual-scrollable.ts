/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directionality} from '@angular/cdk/bidi';
import {Directive, ElementRef, InjectionToken, NgZone, Optional} from '@angular/core';
import {ScrollDispatcher} from './scroll-dispatcher';
import {CdkScrollable} from './scrollable';

export const VIRTUAL_SCROLLABLE = new InjectionToken<CdkVirtualScrollable>('VIRTUAL_SCROLLABLE');

@Directive()
export abstract class CdkVirtualScrollable extends CdkScrollable {
  constructor(
    elementRef: ElementRef<HTMLElement>,
    scrollDispatcher: ScrollDispatcher,
    ngZone: NgZone,
    @Optional() dir?: Directionality,
  ) {
    super(elementRef, scrollDispatcher, ngZone, dir);
  }

  measureViewportSize(orientation: 'horizontal' | 'vertical') {
    const viewportEl = this.elementRef.nativeElement;
    return orientation === 'horizontal' ? viewportEl.clientWidth : viewportEl.clientHeight;
  }

  abstract getBoundingClientRectWithScrollOffset(from: 'left' | 'top' | 'right' | 'bottom'): number;
}
