/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, ElementRef} from '@angular/core';
import {fromEvent, Observable, Observer} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {CdkVirtualScrollable, VIRTUAL_SCROLLABLE} from './virtual-scrollable';

/**
 * Provides as virtual scrollable for the global / window scrollbar.
 */
@Directive({
  selector: 'cdk-virtual-scroll-viewport[scrollWindow]',
  providers: [{provide: VIRTUAL_SCROLLABLE, useExisting: CdkVirtualScrollableWindow}],
  standalone: true,
})
export class CdkVirtualScrollableWindow extends CdkVirtualScrollable {
  protected override _elementScrolled: Observable<Event> = new Observable(
    (observer: Observer<Event>) =>
      this.ngZone.runOutsideAngular(() =>
        fromEvent(document, 'scroll').pipe(takeUntil(this._destroyed)).subscribe(observer),
      ),
  );

  constructor(...args: unknown[]);

  constructor() {
    super();
    this.elementRef = new ElementRef(document.documentElement);
  }

  override measureBoundingClientRectWithScrollOffset(
    from: 'left' | 'top' | 'right' | 'bottom',
  ): number {
    return this.getElementRef().nativeElement.getBoundingClientRect()[from];
  }
}
