/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directionality} from '@angular/cdk/bidi';
import {Directive, ElementRef, NgZone, Optional} from '@angular/core';
import {ScrollDispatcher} from './scroll-dispatcher';
import {CdkVirtualScrollable, VIRTUAL_SCROLLABLE} from './virtual-scrollable';

@Directive({
  selector: 'cdk-virtual-scroll-viewport[scrollable-window]',
  providers: [{provide: VIRTUAL_SCROLLABLE, useExisting: CdkVirtualScrollableWindow}],
})
export class CdkVirtualScrollableWindow extends CdkVirtualScrollable {
  constructor(scrollDispatcher: ScrollDispatcher, ngZone: NgZone, @Optional() dir: Directionality) {
    super(new ElementRef(document.documentElement), scrollDispatcher, ngZone, dir);
  }
}
