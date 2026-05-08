import {ListRange} from '@angular/cdk/collections';
import {Observable, Subject} from 'rxjs';
import {distinctUntilChanged} from 'rxjs/operators';
import {VisibleRange} from './cdk-visible-range.directive';
import {expandRenderedRange} from './virtual-scroll-utils';
import {VirtualScrollStrategy} from './virtual-scroll-strategy';
import {CdkVirtualScrollViewport} from './virtual-scroll-viewport';

/** Virtual scrolling strategy for lists with items of known sizes. */
export class CdkDynamicSizeVirtualScrollStrategy implements VirtualScrollStrategy {
  private readonly _scrolledIndexChange = new Subject<number>();

  /** @docs-private Implemented as part of VirtualScrollStrategy. */
  scrolledIndexChange: Observable<number> = this._scrolledIndexChange.pipe(distinctUntilChanged());

  /** @param renderedRange keeps maximum rendered range and helps render only visible items.
   *
   * [appendOnly] always renders range with start = 0, but when we use virtual-scroll in a grid it is not a performant solution.
   * For case when we rendered a grid, then we scrolled up to the right to the end and then started scrolling to the bottom,
   * default [appendOnly] would render range { start: 0, end: 40 } for each row, but in reality we need only 10 columns for example.
   * renderedRange keeps maximum rendered range and helps render only visible items.
   * */
  renderedRange: {start: number | null; end: number | null} = {start: null, end: null};

  /** If the virtual scroll is a part of grid, we can assign gridRowIndex to render columns in a rows that are in a buffered area.*/
  gridRowIndex!: number;

  /** If the virtual scroll is a part of grid, gridVisibleRowRange keeps range of visible rows.*/
  gridVisibleRowRange: VisibleRange | null = null;

  /** The attached viewport. */
  private _viewport: CdkVirtualScrollViewport | null = null;

  /**
   * @param _sizes The size of the items in the virtually scrolling list.
   * @param _minBufferPx The minimum amount of buffer (in pixels) before needing to render more
   * @param _maxBufferPx The amount of buffer (in pixels) to render when rendering more.
   * @param _stretch Whether Viewport should be stretched to a full width.
   * @param _disableAppending Whether we should keep items in the DOM according to the renderedRange.
   */
  constructor(
    private _sizes: number[],
    private _minBufferPx: number,
    private _maxBufferPx: number,
    private _stretch: boolean,
    private _disableAppending = false,
  ) {}

  /**
   * Attaches this scroll strategy to a viewport.
   * @param viewport The viewport to attach this strategy to.
   */
  attach(viewport: CdkVirtualScrollViewport) {
    this._viewport = viewport;
    this._updateTotalContentSize();
  }

  /** Detaches this scroll strategy from the currently attached viewport. */
  detach() {
    this._scrolledIndexChange.complete();
    this._viewport = null;
  }

  /**
   * Update the item size and buffer size.
   * @param sizes The size of the items in the virtually scrolling list.
   * @param minBufferPx The minimum amount of buffer (in pixels) before needing to render more
   * @param maxBufferPx The amount of buffer (in pixels) to render when rendering more.
   * @param stretch Whether Viewport should be stretched to a full width.
   * @param disableAppending Whether we should keep items in the DOM according to the renderedRange.
   */
  updateItemAndBufferSize(
    sizes: number[],
    minBufferPx: number,
    maxBufferPx: number,
    stretch: boolean,
    disableAppending: boolean,
  ) {
    this.renderedRange = {start: null, end: null};

    if (maxBufferPx < minBufferPx && ngDevMode) {
      throw Error('CDK virtual scroll: maxBufferPx must be greater than or equal to minBufferPx');
    }
    this._sizes = sizes;
    this._minBufferPx = minBufferPx;
    this._maxBufferPx = maxBufferPx;
    this._stretch = stretch;
    this._disableAppending = disableAppending;

    this._updateTotalContentSize();
    this._updateRangeIfItIsInVisibleArea();
  }

  /** @docs-private Implemented as part of VirtualScrollStrategy. */
  onContentScrolled() {
    this._updateRangeIfItIsInVisibleArea();
  }

  /** @docs-private Implemented as part of VirtualScrollStrategy. */
  onDataLengthChanged() {
    this.renderedRange = {start: null, end: null};
    this._updateTotalContentSize();
    this._updateRenderedRange();
  }

  /** @docs-private Implemented as part of VirtualScrollStrategy. */
  onContentRendered() {
    /* no-op */
  }

  /** @docs-private Implemented as part of VirtualScrollStrategy. */
  onRenderedOffsetChanged() {
    /* no-op */
  }

  /**
   * Scroll to the offset for the given index.
   * @param index The index of the element to scroll to.
   * @param behavior The ScrollBehavior to use when scrolling.
   */
  scrollToIndex(index: number, behavior: ScrollBehavior): void {
    if (this._viewport) {
      this._viewport.scrollToOffset(this._getItemIdxByOffset(index), behavior);
    }
  }

  setVisibleRowRange(range: VisibleRange) {
    this.gridVisibleRowRange = range;
  }

  private _updateRangeIfItIsInVisibleArea() {
    if (
      this.gridRowIndex === undefined ||
      !this.gridVisibleRowRange ||
      (this.gridRowIndex >= this.gridVisibleRowRange.start &&
        this.gridRowIndex <= this.gridVisibleRowRange.end)
    ) {
      this._updateRenderedRange();
    }
  }

  /** Update the viewport's total content size. */
  private _updateTotalContentSize() {
    if (!this._viewport) {
      return;
    }

    const contentSize = this._getTotalViewportWidthSize();
    const viewportSize = this._viewport.getViewportSize();

    this._viewport._contentWrapper.nativeElement.style.height = this._getViewportHeight(
      viewportSize,
      contentSize,
    );

    this._viewport.setTotalContentSize(contentSize);
  }

  private _getViewportHeight(viewportSize: number, contentSize: number): string {
    return this._stretch && viewportSize > contentSize ? '100%' : '';
  }

  /** Update the viewport's rendered range. */
  private _updateRenderedRange() {
    if (!this._viewport) {
      return;
    }

    const renderedRange = this._viewport.getRenderedRange();
    let newRange = {start: renderedRange.start, end: renderedRange.end};
    const viewportSize = this._viewport.getViewportSize();
    const dataLength = this._viewport.getDataLength();
    let scrollOffset = this._viewport.measureScrollOffset();
    let firstVisibleIndex = this._getItemIdxByOffset(scrollOffset);

    // If user scrolls to the bottom of the list and data changes to a smaller list
    if (newRange.end > dataLength) {
      ({firstVisibleIndex, scrollOffset, newRange} = this._adjustRangeForReducedDataLength(
        firstVisibleIndex,
        scrollOffset,
        viewportSize,
        dataLength,
        newRange,
      ));
    }

    const startBuffer = scrollOffset - this._getOffsetByItemIdx(newRange.start);
    const allOffset = scrollOffset + viewportSize;
    const endBuffer = this._getOffsetByItemIdx(newRange.end) - allOffset;

    if (startBuffer < this._minBufferPx || endBuffer < this._minBufferPx) {
      newRange.start = Math.max(0, this._getItemIdxByOffset(scrollOffset - this._maxBufferPx));
      newRange.end = Math.min(
        dataLength,
        this._getItemIdxByOffset(scrollOffset + viewportSize + this._maxBufferPx) + 1,
      );
    }

    if (!this._disableAppending) {
      newRange = expandRenderedRange(this.renderedRange, newRange);
    }

    this._viewport.setRenderedRange(newRange);
    this._viewport.setRenderedContentOffset(this._getOffsetByItemIdx(newRange.start));

    this._scrolledIndexChange.next(firstVisibleIndex);
  }

  private _getTotalViewportWidthSize() {
    return this._getAllSizes(this._sizes);
  }

  private _getAllSizes(sizes: number[]): number {
    return sizes.reduce((acc, value) => acc + value, 0);
  }

  private _adjustRangeForReducedDataLength(
    firstVisibleIndex: number,
    scrollOffset: number,
    viewportSize: number,
    dataLength: number,
    newRange: ListRange,
  ): {firstVisibleIndex: number; scrollOffset: number; newRange: ListRange} {
    const lastVisibleIndex = this._getItemIdxByOffset(scrollOffset + viewportSize);
    // We have to recalculate the first visible index based on new data length and viewport size.
    const newVisibleIndex = this._getItemIdxByOffset(viewportSize, lastVisibleIndex, 'down');

    // If first visible index changed we must update scroll offset to handle start/end buffers
    // Current range must also be adjusted to cover the new position (bottom of new list).
    if (firstVisibleIndex !== newVisibleIndex) {
      firstVisibleIndex = newVisibleIndex;
      scrollOffset = this._getOffsetByItemIdx(newVisibleIndex);
      newRange.start = firstVisibleIndex;
    }

    const endRange = this._getItemIdxByOffset(scrollOffset + viewportSize) + 1;

    return {
      firstVisibleIndex,
      scrollOffset,
      newRange: {
        start: newRange.start,
        end: Math.max(0, Math.min(dataLength, endRange)),
      },
    };
  }

  private _getOffsetByItemIdx(idx: number): number {
    return this._getAllSizes(this._sizes.slice(0, idx));
  }

  private _getItemIdxByOffset(
    offset: number,
    offsetIdx: number = 0,
    dir: 'down' | 'up' = 'up',
  ): number {
    let accumOffset = 0;

    for (let i = offsetIdx; i < this._sizes.length && i >= 0; dir === 'down' ? i-- : i++) {
      const msgHeight = this._sizes[i];
      accumOffset += msgHeight;

      if (accumOffset >= offset) {
        return i;
      }
    }

    if (accumOffset < offset && dir === 'up') {
      return this._sizes.length - 1;
    }

    return 0;
  }
}
