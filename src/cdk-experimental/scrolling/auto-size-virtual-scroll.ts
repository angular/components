/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {coerceNumberProperty, NumberInput} from '@angular/cdk/coercion';
import {ListRange} from '@angular/cdk/collections';
import {
  CdkVirtualScrollViewport,
  VIRTUAL_SCROLL_STRATEGY,
  VirtualScrollStrategy,
} from '@angular/cdk/scrolling';
import {Directive, forwardRef, Input, OnChanges} from '@angular/core';
import {Observable} from 'rxjs';

/**
 * A class that tracks the size of items that have been seen and uses it to estimate the average
 * item size.
 */
export class ItemSizeAverager {
  /** The total amount of weight behind the current average. */
  private _totalWeight = 0;

  /** The current average item size. */
  private _averageItemSize: number;

  /** The default size to use for items when no data is available. */
  private _defaultItemSize: number;

  /** @param defaultItemSize The default size to use for items when no data is available. */
  constructor(defaultItemSize = 50) {
    this._defaultItemSize = defaultItemSize;
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
    const newTotalWeight = this._totalWeight + range.end - range.start;
    if (newTotalWeight) {
      const newAverageItemSize =
        (size + this._averageItemSize * this._totalWeight) / newTotalWeight;
      if (newAverageItemSize) {
        this._averageItemSize = newAverageItemSize;
        this._totalWeight = newTotalWeight;
      }
    }
  }

  /** Resets the averager. */
  reset() {
    this._averageItemSize = this._defaultItemSize;
    this._totalWeight = 0;
  }
}

/** Virtual scrolling strategy for lists with items of unknown or dynamic size. */
export class AutoSizeVirtualScrollStrategy implements VirtualScrollStrategy {
  /** @docs-private Implemented as part of VirtualScrollStrategy. */
  scrolledIndexChange = new Observable<number>(() => {
    // TODO(mmalerba): Implement.
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      throw Error(
        'cdk-virtual-scroll: scrolledIndexChange is currently not supported for the' +
          ' autosize scroll strategy',
      );
    }
  });

  /** The attached viewport. */
  private _viewport: CdkVirtualScrollViewport | null = null;

  /** The minimum amount of buffer rendered beyond the viewport (in pixels). */
  private _minBufferPx: number;

  /** The number of buffer items to render beyond the edge of the viewport (in pixels). */
  private _maxBufferPx: number;

  /** The estimator used to estimate the size of unseen items. */
  private _averager: ItemSizeAverager;

  /** The last measured scroll offset of the viewport. */
  private _lastScrollOffset: number;

  /** The last measured size of the rendered content in the viewport. */
  private _lastRenderedContentSize: number;

  /** The last measured size of the rendered content in the viewport. */
  private _lastRenderedContentOffset: number;

  /**
   * The last rendered total content size based on the estimated item size.
   *  Initialized with zero, as it will be used before properly calculated the first time.
   */
  private _lastRenderedTotalContentSize = 0;

  /**
   * The number of consecutive cycles where removing extra items has failed. Failure here means that
   * we estimated how many items we could safely remove, but our estimate turned out to be too much
   * and it wasn't safe to remove that many elements.
   */
  private _removalFailures = 0;

  /** Target information when scrolling to an index. */
  private _scrollToIndexTarget?: {
    readonly index: number;
    readonly fromIndex: number;
    readonly offset: number;
    readonly delta: number;
    forceRenderedContentAdjustment?: boolean;
    optimalOffsetAdjustmentDone?: boolean;
  };

  /**
   * @param minBufferPx The minimum amount of buffer rendered beyond the viewport (in pixels).
   *     If the amount of buffer dips below this number, more items will be rendered.
   * @param maxBufferPx The number of pixels worth of buffer to shoot for when rendering new items.
   *     If the actual amount turns out to be less it will not necessarily trigger an additional
   *     rendering cycle (as long as the amount of buffer is still greater than `minBufferPx`).
   * @param averager The averager used to estimate the size of unseen items.
   */
  constructor(minBufferPx: number, maxBufferPx: number, averager = new ItemSizeAverager()) {
    this._minBufferPx = minBufferPx;
    this._maxBufferPx = maxBufferPx;
    this._averager = averager;
  }

  /**
   * Attaches this scroll strategy to a viewport.
   * @param viewport The viewport to attach this strategy to.
   */
  attach(viewport: CdkVirtualScrollViewport) {
    this._averager.reset();
    this._viewport = viewport;
    this._renderContentForCurrentOffset();
  }

  /** Detaches this scroll strategy from the currently attached viewport. */
  detach() {
    this._viewport = null;
  }

  /** @docs-private Implemented as part of VirtualScrollStrategy. */
  onContentScrolled() {
    if (this._viewport) {
      this._updateRenderedContentAfterScroll();
    }
  }

  /** @docs-private Implemented as part of VirtualScrollStrategy. */
  onDataLengthChanged() {
    if (this._viewport) {
      this._renderContentForCurrentOffset();
      this._checkRenderedContentSize();
    }
  }

  /** @docs-private Implemented as part of VirtualScrollStrategy. */
  onContentRendered() {
    if (this._viewport) {
      this._checkRenderedContentSize();
    }
  }

  /** @docs-private Implemented as part of VirtualScrollStrategy. */
  onRenderedOffsetChanged() {
    if (this._viewport) {
      this._checkRenderedContentOffset();
    }
  }

  /** Scroll to the offset for the given index. */
  scrollToIndex(index: number, behavior: ScrollBehavior): void {
    if (this._viewport) {
      const viewport = this._viewport;
      const itemSize = this._averager.getAverageItemSize();
      const renderedRange = viewport.getRenderedRange();
      const currentIndex = this._getFirstVisibleIndex();

      if (this._isIndexInRange(index, renderedRange)) {
        // Index is within the rendered range, so we scroll by the exact amount of pixels
        const toOffset = Math.round(
          viewport.measureRangeSize({start: renderedRange.start, end: index - 1}) +
            this._lastRenderedContentOffset,
        );
        this._scrollToIndexTarget = {
          index,
          fromIndex: currentIndex,
          offset: toOffset,
          delta: Math.abs(toOffset - this._lastScrollOffset),
        };
      } else {
        // Index is out of rendered range, so the target offset is estimated.

        let targetOffset: number;
        const estimatedTargetOffset = Math.min(
          this._getScrollOffsetForIndex(index),
          this._lastRenderedTotalContentSize - viewport.getViewportSize(),
        );
        const predictedContentOffset = this._getScrollOffsetForIndex(renderedRange.start);
        const contentOffsetDifference = predictedContentOffset - this._lastRenderedContentOffset;
        const estimatedScrollMagnitude = Math.abs(this._lastScrollOffset - estimatedTargetOffset);
        let relativeAdjustment: number;
        if (index < renderedRange.start) {
          // scrolling to start
          // The corrected amount is relative to the amount from the scroll magnitude to remaining space to the top (=target offset).
          relativeAdjustment = Math.min(estimatedTargetOffset / estimatedScrollMagnitude, 1);
        } else {
          // scrolling to end
          // The corrected amount is relative to the amount from the scroll magnitude to remaining space to the bottom.
          relativeAdjustment = Math.min(
            (this._lastRenderedTotalContentSize -
              viewport.getViewportSize() -
              estimatedTargetOffset) /
              estimatedScrollMagnitude,
            1,
          );
        }
        const offsetCorrection = contentOffsetDifference * relativeAdjustment;
        targetOffset = estimatedTargetOffset - offsetCorrection;

        if (
          targetOffset > this._lastRenderedContentOffset &&
          targetOffset < this._lastRenderedContentOffset + this._lastRenderedContentSize
        ) {
          // We are not scrolling beyond the current rendered content, but we should as our target index is not rendered yet.
          // Adjusting the targetOffset, to scroll at least beyond the current rendered content.
          if (index < renderedRange.start) {
            const renderedContentSizeBeforeCurrentIndex = viewport.measureRangeSize({
              start: renderedRange.start,
              end: currentIndex - 1,
            });
            targetOffset =
              this._lastScrollOffset -
              renderedContentSizeBeforeCurrentIndex -
              renderedContentSizeBeforeCurrentIndex +
              this._lastRenderedContentOffset -
              this._lastScrollOffset - // portion of the current index, which already scrolled away
              (renderedRange.start - index - 1) * itemSize;
          } else {
            targetOffset =
              this._lastScrollOffset +
              viewport.measureRangeSize({
                start: currentIndex,
                end: renderedRange.end,
              }) +
              itemSize / 2 +
              (index - renderedRange.end) * itemSize;
          }
        }

        const toOffset = Math.round(targetOffset);
        this._scrollToIndexTarget = {
          index,
          fromIndex: currentIndex,
          offset: toOffset,
          delta: Math.abs(toOffset - this._lastScrollOffset),
        };
      }
      viewport.scrollToOffset(this._scrollToIndexTarget.offset, behavior);
    }
  }

  /**
   * Update the buffer parameters.
   * @param minBufferPx The minimum amount of buffer rendered beyond the viewport (in pixels).
   * @param maxBufferPx The number of buffer items to render beyond the edge of the viewport (in
   *     pixels).
   */
  updateBufferSize(minBufferPx: number, maxBufferPx: number) {
    if (maxBufferPx < minBufferPx) {
      throw Error('CDK virtual scroll: maxBufferPx must be greater than or equal to minBufferPx');
    }
    this._minBufferPx = minBufferPx;
    this._maxBufferPx = maxBufferPx;
  }

  /** Update the rendered content after the user scrolls. */
  private _updateRenderedContentAfterScroll() {
    const viewport = this._viewport!;

    // The current scroll offset.
    const scrollOffset = viewport.measureScrollOffset();
    // The delta between the current scroll offset and the previously recorded scroll offset.
    let scrollDelta = scrollOffset - this._lastScrollOffset;
    // The magnitude of the scroll delta.
    let scrollMagnitude = Math.abs(scrollDelta);

    // The currently rendered range.
    const renderedRange = viewport.getRenderedRange();

    // If we're scrolling toward the top, we need to account for the fact that the predicted amount
    // of content and the actual amount of scrollable space may differ. We address this by slowly
    // correcting the difference on each scroll event.
    // When scrolling to an index, the offset must not be corrected. As we need to scroll precisely in this case.
    let offsetCorrection = 0;
    if (scrollDelta < 0 && !this._scrollToIndexTarget) {
      // The content offset we would expect based on the average item size.
      const predictedOffset = renderedRange.start * this._averager.getAverageItemSize();
      // The difference between the predicted size of the un-rendered content at the beginning and
      // the actual available space to scroll over. We need to reduce this to zero by the time the
      // user scrolls to the top.
      // - 0 indicates that the predicted size and available space are the same.
      // - A negative number that the predicted size is smaller than the available space.
      // - A positive number indicates the predicted size is larger than the available space
      const offsetDifference = predictedOffset - this._lastRenderedContentOffset;
      // The amount of difference to correct during this scroll event. We calculate this as a
      // percentage of the total difference based on the percentage of the distance toward the top
      // that the user scrolled.
      offsetCorrection = Math.round(
        offsetDifference *
          Math.max(0, Math.min(1, scrollMagnitude / (scrollOffset + scrollMagnitude))),
      );

      // Based on the offset correction above, we pretend that the scroll delta was bigger or
      // smaller than it actually was, this way we can start to eliminate the difference.
      scrollDelta = scrollDelta - offsetCorrection;
      scrollMagnitude = Math.abs(scrollDelta);
    }

    if (this._scrollToIndexTarget) {
      const correctedRange = this._getCorrectedRangeForIndexScrolling(scrollOffset);
      // We need force rendering the content when the target item is entering the rendered range the first time.
      // Even if there is currently no sufficient underscan or the scroll magnitude is smaller than the viewport.
      // We do this, so that we can calculate the optimal offset as early as possible, so that we can
      // reduce the jitterness when adjusting the content.
      this._scrollToIndexTarget.forceRenderedContentAdjustment =
        this._isIndexInRange(this._scrollToIndexTarget.index, correctedRange) &&
        (!this._isIndexInRange(this._scrollToIndexTarget.index, renderedRange) ||
          !this._scrollToIndexTarget.optimalOffsetAdjustmentDone);
    }

    // The current amount of buffer past the start of the viewport.
    const startBuffer = this._lastScrollOffset - this._lastRenderedContentOffset;
    // The current amount of buffer past the end of the viewport.
    const endBuffer =
      this._lastRenderedContentOffset +
      this._lastRenderedContentSize -
      (this._lastScrollOffset + viewport.getViewportSize());
    // The amount of unfilled space that should be filled on the side the user is scrolling toward
    // in order to safely absorb the scroll delta.
    const underscan =
      scrollMagnitude + this._minBufferPx - (scrollDelta < 0 ? startBuffer : endBuffer);

    // Check if there's unfilled space that we need to render new elements to fill.
    if (
      (underscan > 0 || this._scrollToIndexTarget?.forceRenderedContentAdjustment) &&
      !this._scrollToIndexTarget?.optimalOffsetAdjustmentDone
    ) {
      // Check if the scroll magnitude was larger than the viewport size. In this case the user
      // won't notice a discontinuity if we just jump to the new estimated position in the list.
      // However, if the scroll magnitude is smaller than the viewport the user might notice some
      // jitteriness if we just jump to the estimated position. Instead we make sure to scroll by
      // the same number of pixels as the scroll magnitude.
      if (
        scrollMagnitude >= viewport.getViewportSize() ||
        this._scrollToIndexTarget?.forceRenderedContentAdjustment
      ) {
        this._renderContentForCurrentOffset();
      } else {
        // The number of new items to render on the side the user is scrolling towards. Rather than
        // just filling the underscan space, we actually fill enough to have a buffer size of
        // `maxBufferPx`. This gives us a little wiggle room in case our item size estimate is off.
        const addItems = Math.max(
          0,
          Math.ceil(
            (underscan - this._minBufferPx + this._maxBufferPx) /
              this._averager.getAverageItemSize(),
          ),
        );
        // The amount of filled space beyond what is necessary on the side the user is scrolling
        // away from.
        const overscan =
          (scrollDelta < 0 ? endBuffer : startBuffer) - this._minBufferPx + scrollMagnitude;
        // The number of currently rendered items to remove on the side the user is scrolling away
        // from. If removal has failed in recent cycles we are less aggressive in how much we try to
        // remove.
        const unboundedRemoveItems = Math.floor(
          overscan / this._averager.getAverageItemSize() / (this._removalFailures + 1),
        );
        const removeItems = Math.min(
          renderedRange.end - renderedRange.start,
          Math.max(0, unboundedRemoveItems),
        );

        // The new range we will tell the viewport to render. We first expand it to include the new
        // items we want rendered, we then contract the opposite side to remove items we no longer
        // want rendered.
        const range = this._expandRange(
          renderedRange,
          scrollDelta < 0 ? addItems : 0,
          scrollDelta > 0 ? addItems : 0,
        );
        if (scrollDelta < 0) {
          range.end = Math.max(range.start + 1, range.end - removeItems);
        } else {
          range.start = Math.min(range.end - 1, range.start + removeItems);
        }

        // The new offset we want to set on the rendered content. To determine this we measure the
        // number of pixels we removed and then adjust the offset to the start of the rendered
        // content or to the end of the rendered content accordingly (whichever one doesn't require
        // that the newly added items to be rendered to calculate.)
        let contentOffset: number;
        let contentOffsetTo: 'to-start' | 'to-end';
        if (scrollDelta < 0) {
          let removedSize = viewport.measureRangeSize({
            start: range.end,
            end: renderedRange.end - 1,
          });
          // Check that we're not removing too much.
          if (removedSize <= overscan) {
            contentOffset =
              this._lastRenderedContentOffset + this._lastRenderedContentSize - removedSize;
            this._removalFailures = 0;
          } else {
            // If the removal is more than the overscan can absorb just undo it and record the fact
            // that the removal failed so we can be less aggressive next time.
            range.end = renderedRange.end;
            contentOffset = this._lastRenderedContentOffset + this._lastRenderedContentSize;
            this._removalFailures++;
          }
          contentOffsetTo = 'to-end';
        } else {
          const removedSize = viewport.measureRangeSize({
            start: renderedRange.start,
            end: range.start - 1,
          });
          // Check that we're not removing too much.
          if (removedSize <= overscan) {
            contentOffset = this._lastRenderedContentOffset + removedSize;
            this._removalFailures = 0;
          } else {
            // If the removal is more than the overscan can absorb just undo it and record the fact
            // that the removal failed so we can be less aggressive next time.
            range.start = renderedRange.start;
            contentOffset = this._lastRenderedContentOffset;
            this._removalFailures++;
          }
          contentOffsetTo = 'to-start';
        }

        // Set the range and offset we calculated above.
        viewport.setRenderedRange(range);
        viewport.setRenderedContentOffset(contentOffset + offsetCorrection, contentOffsetTo);
      }
    } else if (offsetCorrection) {
      // Even if the rendered range didn't change, we may still need to adjust the content offset to
      // simulate scrolling slightly slower or faster than the user actually scrolled.
      viewport.setRenderedContentOffset(this._lastRenderedContentOffset + offsetCorrection);
    }

    if (this._scrollToIndexTarget?.offset === scrollOffset) {
      Promise.resolve().then(() => (this._scrollToIndexTarget = undefined));
    }

    // Save the scroll offset to be compared to the new value on the next scroll event.
    this._lastScrollOffset = scrollOffset;
  }

  /**
   * Checks the size of the currently rendered content and uses it to update the estimated item size
   * and estimated total content size.
   */
  private _checkRenderedContentSize() {
    const viewport = this._viewport!;
    this._lastRenderedContentSize = viewport.measureRenderedContentSize();
    this._averager.addSample(viewport.getRenderedRange(), this._lastRenderedContentSize);

    // We cannot update the total content size when scrolling to an index which is after the current offset.
    // Otherwise, we may add space after the last item.
    if (!this._scrollToIndexTarget || this._scrollToIndexTarget.offset < this._lastScrollOffset) {
      this._updateTotalContentSize(this._lastRenderedContentSize);
    }
  }

  /** Checks the currently rendered content offset and saves the value for later use. */
  private _checkRenderedContentOffset() {
    const viewport = this._viewport!;
    this._lastRenderedContentOffset = viewport.getOffsetToRenderedContentStart()!;
  }

  /**
   * Recalculates the rendered content based on our estimate of what should be shown at the current
   * scroll offset or, if present, based on the scrollToIndexTarget.
   */
  private _renderContentForCurrentOffset() {
    const viewport = this._viewport!;
    const scrollOffset = viewport.measureScrollOffset();
    const itemSize = this._averager.getAverageItemSize();
    const bufferSize = Math.ceil(this._maxBufferPx / itemSize);
    this._lastScrollOffset = scrollOffset;
    this._removalFailures = 0;

    // The first index is based on the scroll offset in relation to the total content size
    const firstVisibleIndex = Math.min(
      viewport.getDataLength() - 1,
      Math.round(
        (scrollOffset / (this._lastRenderedTotalContentSize - viewport.getViewportSize())) *
          viewport.getDataLength(),
      ),
    );

    const range = this._expandRange(
      this._getVisibleRangeForIndex(firstVisibleIndex),
      bufferSize,
      bufferSize,
    );

    let correctedRange = range;
    let offsetCorrection = 0;
    let optimalOffsetAdjustmentDoing = false;

    if (this._scrollToIndexTarget) {
      // scrolling to a specific index
      // In this case, we must ensure, that we precisely scroll to a specific item.

      // we adjust the content within this block, so we need to reset the force flag
      this._scrollToIndexTarget.forceRenderedContentAdjustment = false;

      const {offset: targetOffset, index: targetIndex} = this._scrollToIndexTarget;
      correctedRange = this._getCorrectedRangeForIndexScrolling(scrollOffset);
      if (
        this._isIndexInRange(targetIndex, correctedRange) &&
        !this._scrollToIndexTarget.optimalOffsetAdjustmentDone
      ) {
        // We need to correct the content offset, in case the scroll strategy does not provide exact item sizes.
        // Without this, the target index might not be on top in the viewport, if the preceding visible items
        // have a different size than estimated.
        // correctedRange = this._expandRange(correctedRange, 1, 0);
        optimalOffsetAdjustmentDoing = true;
        this._scrollToIndexTarget.optimalOffsetAdjustmentDone = true;
        setTimeout(() => {
          const renderedRange = viewport.getRenderedRange();
          if (
            renderedRange.end === viewport.getDataLength() &&
            viewport.measureRangeSize({start: targetIndex, end: renderedRange.end}) <
              viewport.getViewportSize()
          ) {
            // No more items left to the end and our target is estimated to be within the viewport when we reach the end,
            // so we must perfectly align with the end of the viewport.
            viewport.setRenderedContentOffset(
              this._lastRenderedTotalContentSize - this._lastRenderedContentSize,
            );
          } else {
            // This is the first time, our target index is rendered. We can now calculate the optimal content offset
            // so that we can perfectly scroll to it.
            const optimalOffset =
              scrollOffset -
              this._viewport!.measureRangeSize({
                start: renderedRange.start,
                end: targetIndex - 1,
              }) +
              targetOffset -
              scrollOffset;

            // The rendered range needs to be adopted to reflect our offset modification. Otherwise, we may have unfilled space in the viewport.
            // We only append items if there are not enough. Prepending and removing items would require offset adjustment and may cause jitterness.
            if (optimalOffset < this._lastRenderedContentOffset) {
              const bufferExtend = Math.ceil(
                (this._lastRenderedContentOffset - optimalOffset) / itemSize,
              );
              viewport.setRenderedRange(this._expandRange(renderedRange, 0, bufferExtend));
            }

            this._viewport!.setRenderedContentOffset(
              this._lastScrollOffset -
                this._viewport!.measureRangeSize({
                  start: renderedRange.start,
                  end: targetIndex - 1,
                }) +
                targetOffset -
                scrollOffset,
            );
          }
        });
      }
    }

    if (!this._scrollToIndexTarget?.optimalOffsetAdjustmentDone || optimalOffsetAdjustmentDoing) {
      console.log('regular adjustment', correctedRange);
      console.log(this._scrollToIndexTarget);
      viewport.setRenderedRange(correctedRange);
      viewport.setRenderedContentOffset(
        (this._lastRenderedTotalContentSize / viewport.getDataLength()) * range.start -
          offsetCorrection,
      );
    }
  }

  /**
   * Get the range to render when scrolling to specific index for a scroll offset
   * Note: can only be called when scrolling to an index
   * @param scrollOffset the scroll offset to get the range for
   * @return a range that contains items the should be visible for the provided scroll offset
   */
  private _getCorrectedRangeForIndexScrolling(scrollOffset: number) {
    const {delta, offset: targetOffset, index, fromIndex} = this._scrollToIndexTarget!;
    const bufferSize = Math.ceil(this._maxBufferPx / this._averager.getAverageItemSize());

    const relativeProgress = (delta - targetOffset + scrollOffset) / delta;
    const currentIndex = (index - fromIndex) * relativeProgress + fromIndex;
    return this._expandRange(
      this._getVisibleRangeForIndex(Math.round(currentIndex)),
      bufferSize,
      bufferSize,
    );
  }

  /** Calculates the scrollOffset for an index based on the available max scroll offset */
  private _getScrollOffsetForIndex(index: number) {
    const viewport = this._viewport!;
    return Math.round(
      (index / viewport.getDataLength()) *
        (this._lastRenderedTotalContentSize - viewport.getViewportSize()),
    );
  }

  /** Precisely reads the first visible index */
  private _getFirstVisibleIndex() {
    const viewport = this._viewport!;
    const renderedRange = viewport.getRenderedRange();
    const itemSize = this._averager.getAverageItemSize();

    let renderedStartOverflow = Math.round(
      this._lastScrollOffset - this._lastRenderedContentOffset,
    );
    let firstVisibleIndex = Math.min(
      Math.floor(renderedStartOverflow / itemSize) + renderedRange.start,
      renderedRange.end - 1,
    );

    let corrected = true;
    do {
      const itemStart = Math.round(
        viewport.measureRangeSize({start: renderedRange.start, end: firstVisibleIndex - 1}),
      );
      const itemEnd = Math.round(
        viewport.measureRangeSize({start: renderedRange.start, end: firstVisibleIndex}),
      );

      if (itemStart > renderedStartOverflow) {
        firstVisibleIndex--;
      } else if (itemEnd < renderedStartOverflow) {
        firstVisibleIndex++;
      } else {
        corrected = false;
      }
    } while (corrected);

    return firstVisibleIndex;
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
      end: startIndex + Math.ceil(viewport.getViewportSize() / this._averager.getAverageItemSize()),
    };
    const extra = range.end - viewport.getDataLength();
    if (extra > 0) {
      range.start = Math.max(0, range.start - extra);
    }
    return range;
  }

  /** Checks if index is in the given range. */
  private _isIndexInRange(index: number, range: ListRange) {
    return range.start <= index && range.end > index;
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
  private _updateTotalContentSize(renderedContentSize: number) {
    const viewport = this._viewport!;
    const renderedRange = viewport.getRenderedRange();
    const itemSize = this._averager.getAverageItemSize();

    if (!this._lastRenderedTotalContentSize) {
      // initially use the estimated item size to calculate the total size
      this._lastRenderedTotalContentSize =
        renderedContentSize +
        (viewport.getDataLength() - (renderedRange.end - renderedRange.start)) * itemSize;
    }

    // The total content size might be completely off, as it is not updated when scrolling to an index.
    // We only update it slightly by just adding/removing space based on what is missing from the currently rendered range.
    // This ensures that we do not add more space at the end than we have content to fill it.
    const neededSpace = Math.round((viewport.getDataLength() - renderedRange.end) * itemSize);
    const availableSpace =
      this._lastRenderedTotalContentSize - this._lastRenderedContentOffset - renderedContentSize;
    const correction = Math.round(neededSpace - availableSpace);

    if (correction) {
      this._lastRenderedTotalContentSize += correction;
    }

    viewport.setTotalContentSize(this._lastRenderedTotalContentSize);
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
  providers: [
    {
      provide: VIRTUAL_SCROLL_STRATEGY,
      useFactory: _autoSizeVirtualScrollStrategyFactory,
      deps: [forwardRef(() => CdkAutoSizeVirtualScroll)],
    },
  ],
  standalone: true,
})
export class CdkAutoSizeVirtualScroll implements OnChanges {
  /**
   * The minimum amount of buffer rendered beyond the viewport (in pixels).
   * If the amount of buffer dips below this number, more items will be rendered. Defaults to 100px.
   */
  @Input()
  get minBufferPx(): number {
    return this._minBufferPx;
  }

  set minBufferPx(value: NumberInput) {
    this._minBufferPx = coerceNumberProperty(value);
  }

  _minBufferPx = 100;

  /**
   * The number of pixels worth of buffer to shoot for when rendering new items.
   * If the actual amount turns out to be less it will not necessarily trigger an additional
   * rendering cycle (as long as the amount of buffer is still greater than `minBufferPx`).
   * Defaults to 200px.
   */
  @Input()
  get maxBufferPx(): number {
    return this._maxBufferPx;
  }

  set maxBufferPx(value: NumberInput) {
    this._maxBufferPx = coerceNumberProperty(value);
  }

  _maxBufferPx = 200;

  /** The scroll strategy used by this directive. */
  _scrollStrategy = new AutoSizeVirtualScrollStrategy(this.minBufferPx, this.maxBufferPx);

  ngOnChanges() {
    this._scrollStrategy.updateBufferSize(this.minBufferPx, this.maxBufferPx);
  }
}
