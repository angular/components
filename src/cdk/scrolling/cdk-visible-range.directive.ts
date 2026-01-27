/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectorRef, Directive, inject, OnDestroy} from '@angular/core';
import {CdkVirtualScrollViewport} from './virtual-scroll-viewport';
import {CdkFixedSizeVirtualScroll} from './fixed-size-virtual-scroll';
import {Subscription} from 'rxjs';

export type VisibleRange = {start: number; end: number};

@Directive({
  selector: '[visibleRange]',
  exportAs: 'visibleRange',
})
export class CdkVisibleRange implements OnDestroy {
  private readonly _viewport = inject(CdkVirtualScrollViewport, {self: true});
  private readonly _cdkFixedSizeVirtualScroll = inject(CdkFixedSizeVirtualScroll, {
    self: true,
  });
  private readonly _cdr = inject(ChangeDetectorRef);

  _range: VisibleRange = {start: 0, end: 0};

  private _lastVisibleIndex!: number;
  private _scrolledIndexChangeSubscription!: Subscription;

  constructor() {
    this._viewport.scrolledIndexChange.subscribe((index: number) => {
      this._lastVisibleIndex = index;
      this.onScroll(index);
    });

    // _range is not updated when we change table data, so we subscribe on callback to update the visible range
    const original = this._cdkFixedSizeVirtualScroll._scrollStrategy.onDataLengthChanged;
    this._cdkFixedSizeVirtualScroll._scrollStrategy.onDataLengthChanged = () => {
      original.call(this._cdkFixedSizeVirtualScroll._scrollStrategy);
      if (typeof this._lastVisibleIndex === 'number') {
        this.onScroll(this._lastVisibleIndex);
      }
    };
  }

  get range() {
    return this._range;
  }

  onScroll(firstVisibleIndex: number) {
    const viewportSize = this._viewport.getViewportSize();
    const itemSize = this._cdkFixedSizeVirtualScroll.itemSize;
    const bufferMax = this._cdkFixedSizeVirtualScroll.maxBufferPx;
    const dataLength = this._viewport.getDataLength();

    const bufferedItems = Math.ceil(bufferMax / itemSize);
    const visibleItems = Math.ceil(viewportSize / itemSize);

    this._range = {
      start: Math.max(0, firstVisibleIndex - bufferedItems),
      end: Math.min(dataLength, firstVisibleIndex + visibleItems + bufferedItems),
    };

    this._cdr.markForCheck();
  }

  ngOnDestroy(): void {
    this._scrolledIndexChangeSubscription.unsubscribe();
  }
}
