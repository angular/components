/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Range} from '@angular/cdk/collections';
import {Directive, forwardRef, Input, OnChanges} from '@angular/core';
import {VIRTUAL_SCROLL_STRATEGY, VirtualScrollStrategy} from './virtual-scroll-strategy';
import {CdkVirtualScrollViewport} from './virtual-scroll-viewport';


/**
 * A class that tracks the size of items that have been seen and uses it to estimate the average
 * item size.
 */
export class ItemSizeEstimator {
  /** The total amount of weight behind the current average. */
  private _totalWeight = 0;

  /** The current average item size. */
  private _averageItemSize: number;

  /** @param defaultItemSize The default size to use for items when no data is available. */
  constructor(defaultItemSize = 50) {
    this._averageItemSize = defaultItemSize;
  }

  /** Returns the average item size. */
  getAverageItemSize(): number {
    return this._averageItemSize;
  }

  /**
   * Adds a measurement sample for the estimator to consider.
   * @param range The measured range.
   * @param size The measured size of the given range in pixels.
   */
  addSample(range: Range, size: number) {
    const weight = range.end - range.start;
    const newTotalWeight = this._totalWeight + weight;
    if (newTotalWeight) {
      const newAverageItemSize =
          (size * weight + this._averageItemSize * this._totalWeight) / newTotalWeight;
      if (newAverageItemSize) {
        this._averageItemSize = newAverageItemSize;
        this._totalWeight = newTotalWeight;
      }
    }
  }
}


/** Virtual scrolling strategy for lists with items of unknown or dynamic size. */
export class AutoSizeVirtualScrollStrategy implements VirtualScrollStrategy {
  /** The attached viewport. */
  private _viewport: CdkVirtualScrollViewport | null = null;

  /** The minimum amount of buffer rendered beyond the viewport (in pixels). */
  private _minBufferPx: number;

  /** The number of buffer items to render beyond the edge of the viewport (in pixels). */
  private _addBufferPx: number;

  /** The estimator used to estimate the size of unseen items. */
  private _estimator: ItemSizeEstimator;

  /**
   * @param minBufferPx The minimum amount of buffer rendered beyond the viewport (in pixels).
   *     If the amount of buffer dips below this number, more items will be rendered.
   * @param addBufferPx The number of pixels worth of buffer to shoot for when rendering new items.
   *     If the actual amount turns out to be less it will not necessarily trigger an additional
   *     rendering cycle (as long as the amount of buffer is still greater than `minBufferPx`).
   * @param estimator The estimator used to estimate the size of unseen items.
   */
  constructor(minBufferPx: number, addBufferPx: number, estimator = new ItemSizeEstimator()) {
    this._minBufferPx = minBufferPx;
    this._addBufferPx = addBufferPx;
    this._estimator = estimator;
  }

  /**
   * Attaches this scroll strategy to a viewport.
   * @param viewport The viewport to attach this strategy to.
   */
  attach(viewport: CdkVirtualScrollViewport) {
    this._viewport = viewport;
    // TODO: kick off rendering (start with totally made up size estimate).
  }

  /** Detaches this scroll strategy from the currently attached viewport. */
  detach() {
    this._viewport = null;
  }

  /** Called when the viewport is scrolled. */
  onContentScrolled() {
    // TODO: do stuff.
  }

  /** Called when the length of the data changes. */
  onDataLengthChanged() {
    // TODO: do stuff.
  }

  /**
   * Update the buffer parameters.
   * @param minBufferPx The minimum amount of buffer rendered beyond the viewport (in pixels).
   * @param addBufferPx The number of buffer items to render beyond the edge of the viewport (in
   *     pixels).
   */
  updateBufferSize(minBufferPx, addBufferPx) {
    this._minBufferPx = minBufferPx;
    this._addBufferPx = addBufferPx;
  }
}

/**
 * Provider factory for `AutoSizeVirtualScrollStrategy` that simply extracts the already created
 * `AutoSizeVirtualScrollStrategy` from the given directive.
 * @param autoSizeDir The instance of `CdkAutoSizeVirtualScroll` to extract the
 *     `AutoSizeVirtualScrollStrategy` from.
 */
export function _autoSizeVirtualScrollStrategyFactory(autoSizeDir: CdkAutoSizeVirtualScroll) {
  return autoSizeDir._scrollStrategy;
}


/** A virtual scroll strategy that supports unknown or dynamic size items. */
@Directive({
  selector: 'cdk-virtual-scroll-viewport[autosize]',
  providers: [{
    provide: VIRTUAL_SCROLL_STRATEGY,
    useFactory: _autoSizeVirtualScrollStrategyFactory,
    deps: [forwardRef(() => CdkAutoSizeVirtualScroll)],
  }],
})
export class CdkAutoSizeVirtualScroll implements OnChanges {
  /**
   * The minimum amount of buffer rendered beyond the viewport (in pixels).
   * If the amount of buffer dips below this number, more items will be rendered.
   */
  @Input() minBufferPx = 20;

  /**
   * The number of pixels worth of buffer to shoot for when rendering new items.
   * If the actual amount turns out to be less it will not necessarily trigger an additional
   * rendering cycle (as long as the amount of buffer is still greater than `minBufferPx`).
   */
  @Input() addBufferPx = 5;

  /** The scroll strategy used by this directive. */
  _scrollStrategy = new AutoSizeVirtualScrollStrategy(this.minBufferPx, this.addBufferPx);

  ngOnChanges() {
    this._scrollStrategy.updateBufferSize(this.minBufferPx, this.addBufferPx);
  }
}
