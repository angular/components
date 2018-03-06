/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ListRange} from '@angular/cdk/collections';
import {Directive, forwardRef, Input, OnChanges} from '@angular/core';
import {VIRTUAL_SCROLL_STRATEGY, VirtualScrollStrategy} from './virtual-scroll-strategy';
import {CdkVirtualScrollViewport} from './virtual-scroll-viewport';


/**
 * A class that tracks the size of items that have been seen and uses it to estimate the average
 * item size.
 */
export class ItemSizeAverager {
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
  addSample(range: ListRange, size: number) {
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
  private _averager: ItemSizeAverager;

  /**
   * @param minBufferPx The minimum amount of buffer rendered beyond the viewport (in pixels).
   *     If the amount of buffer dips below this number, more items will be rendered.
   * @param addBufferPx The number of pixels worth of buffer to shoot for when rendering new items.
   *     If the actual amount turns out to be less it will not necessarily trigger an additional
   *     rendering cycle (as long as the amount of buffer is still greater than `minBufferPx`).
   * @param averager The averager used to estimate the size of unseen items.
   */
  constructor(minBufferPx: number, addBufferPx: number, averager = new ItemSizeAverager()) {
    this._minBufferPx = minBufferPx;
    this._addBufferPx = addBufferPx;
    this._averager = averager;
  }

  /**
   * Attaches this scroll strategy to a viewport.
   * @param viewport The viewport to attach this strategy to.
   */
  attach(viewport: CdkVirtualScrollViewport) {
    this._viewport = viewport;
    this._updateTotalContentSize();
    this._renderContentForOffset(this._viewport.measureScrollOffset());
  }

  /** Detaches this scroll strategy from the currently attached viewport. */
  detach() {
    this._viewport = null;
  }

  /** Called when the viewport is scrolled. */
  onContentScrolled() {
    if (this._viewport) {
      this._renderContentForOffset(this._viewport.measureScrollOffset());
    }
  }

  /** Called when the length of the data changes. */
  onDataLengthChanged() {
    if (this._viewport) {
      this._updateTotalContentSize();
      this._renderContentForOffset(this._viewport.measureScrollOffset());
    }
  }

  /**
   * Update the buffer parameters.
   * @param minBufferPx The minimum amount of buffer rendered beyond the viewport (in pixels).
   * @param addBufferPx The number of buffer items to render beyond the edge of the viewport (in
   *     pixels).
   */
  updateBufferSize(minBufferPx: number, addBufferPx: number) {
    this._minBufferPx = minBufferPx;
    this._addBufferPx = addBufferPx;
  }

  /**
   * Render the content that we estimate should be shown for the given scroll offset.
   * Note: must not be called if `this._viewport` is null
   */
  private _renderContentForOffset(scrollOffset: number) {
    const viewport = this._viewport!;
    const itemSize = this._averager.getAverageItemSize();
    const firstVisibleIndex =
        Math.min(viewport.getDataLength() - 1, Math.floor(scrollOffset / itemSize));
    const bufferSize = Math.ceil(this._addBufferPx / itemSize);
    const range = this._expandRange(
        this._getVisibleRangeForIndex(firstVisibleIndex), bufferSize, bufferSize);

    viewport.setRenderedRange(range);
    viewport.setRenderedContentOffset(itemSize * range.start);
  }

  // TODO: maybe move to base class, can probably share with fixed size strategy.
  /**
   * Gets the visible range of data for the given start index. If the start index is too close to
   * the end of the list it may be backed up to ensure the estimated size of the range is enough to
   * fill the viewport.
   * Note: must not be called if `this._viewport` is null
   * @param startIndex The index to start the range at
   * @return a range estimated to be large enough to fill the viewport when rendered.
   */
  private _getVisibleRangeForIndex(startIndex: number): ListRange {
    const viewport = this._viewport!;
    const range: ListRange = {
      start: startIndex,
      end: startIndex +
          Math.ceil(viewport.getViewportSize() / this._averager.getAverageItemSize())
    };
    const extra = range.end - viewport.getDataLength();
    if (extra > 0) {
      range.start = Math.max(0, range.start - extra);
    }
    return range;
  }

  // TODO: maybe move to base class, can probably share with fixed size strategy.
  /**
   * Expand the given range by the given amount in either direction.
   * Note: must not be called if `this._viewport` is null
   * @param range The range to expand
   * @param expandStart The number of items to expand the start of the range by.
   * @param expandEnd The number of items to expand the end of the range by.
   * @return The expanded range.
   */
  private _expandRange(range: ListRange, expandStart: number, expandEnd: number): ListRange {
    const viewport = this._viewport!;
    const start = Math.max(0, range.start - expandStart);
    const end = Math.min(viewport.getDataLength(), range.end + expandEnd);
    return {start, end};
  }

  /** Update the viewport's total content size. */
  private _updateTotalContentSize() {
    const viewport = this._viewport!;
    viewport.setTotalContentSize(viewport.getDataLength() * this._averager.getAverageItemSize());
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
  @Input() minBufferPx: number = 100;

  /**
   * The number of pixels worth of buffer to shoot for when rendering new items.
   * If the actual amount turns out to be less it will not necessarily trigger an additional
   * rendering cycle (as long as the amount of buffer is still greater than `minBufferPx`).
   */
  @Input() addBufferPx: number = 200;

  /** The scroll strategy used by this directive. */
  _scrollStrategy = new AutoSizeVirtualScrollStrategy(this.minBufferPx, this.addBufferPx);

  ngOnChanges() {
    this._scrollStrategy.updateBufferSize(this.minBufferPx, this.addBufferPx);
  }
}
