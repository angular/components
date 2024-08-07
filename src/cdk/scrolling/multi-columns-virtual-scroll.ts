import {coerceNumberProperty, NumberInput} from '@angular/cdk/coercion';
import {Directive, forwardRef, Input, OnChanges} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {distinctUntilChanged} from 'rxjs/operators';
import {VIRTUAL_SCROLL_STRATEGY, VirtualScrollStrategy} from './virtual-scroll-strategy';
import {CdkVirtualScrollViewport} from './virtual-scroll-viewport';

export class ItemDimension {
  width: number | string;
  height: number;
}

// Only support vertical scroll
export class MultiColumnVirtualScrollStrategy implements VirtualScrollStrategy {
  private readonly _scrolledIndexChange = new Subject<number>();

  /** @docs-private Implemented as part of VirtualScrollStrategy. */
  scrolledIndexChange: Observable<number> = this._scrolledIndexChange.pipe(distinctUntilChanged());
  private _itemDimension: ItemDimension;
  private _minBufferPx: number;
  private _maxBufferPx: number;
  private _viewport: CdkVirtualScrollViewport | null = null;
  constructor(itemDimension: ItemDimension, minBufferPx: number, maxBufferPx: number) {
    this._itemDimension = itemDimension;
    this._minBufferPx = minBufferPx;
    this._maxBufferPx = maxBufferPx;
  }
  /**
   * after viewPort size calculated, attach to the viewPort
   * @param viewport
   */
  attach(viewport: CdkVirtualScrollViewport): void {
    this._viewport = viewport;
    this._updateTotalContentSize();
    this._updateRenderedRange();
  }

  /**
   * detach on viewPort destroy
   */
  detach(): void {
    this._scrolledIndexChange.complete();
    this._viewport = null;
  }
  /**
   * Update the item size and buffer size.
   * @param itemSize The size of the items in the virtually scrolling list.
   * @param minBufferPx The minimum amount of buffer (in pixels) before needing to render more
   * @param maxBufferPx The amount of buffer (in pixels) to render when rendering more.
   */
  updateItemAndBufferSize(itemSize: ItemDimension, minBufferPx: number, maxBufferPx: number) {
    if (maxBufferPx < minBufferPx) {
      throw Error('CDK virtual scroll: maxBufferPx must be greater than or equal to minBufferPx');
    }
    this._itemDimension = itemSize;
    this._minBufferPx = minBufferPx;
    this._maxBufferPx = maxBufferPx;
    this._updateTotalContentSize();
    this._updateRenderedRange();
  }
  /** @docs-private Implemented as part of VirtualScrollStrategy. */
  onContentScrolled(): void {
    this._updateRenderedRange();
  }
  /** @docs-private Implemented as part of VirtualScrollStrategy. */
  onDataLengthChanged(): void {
    this._updateTotalContentSize();
    this._updateRenderedRange();
  }
  /** @docs-private Implemented as part of VirtualScrollStrategy. */
  onContentRendered(): void {
    /* no-op */
  }
  /** @docs-private Implemented as part of VirtualScrollStrategy. */
  onRenderedOffsetChanged(): void {
    /* no-op */
  }
  /**
   * scroll to item by index
   * @param dataIndex index of the data item
   * @param behavior scroll behavior
   */
  scrollToIndex(dataIndex: number, behavior: ScrollBehavior): void {
    if (this._viewport) {
      this._viewport.scrollToOffset(
        this.getScrollIndex(dataIndex) * this._itemDimension.height,
        behavior,
      );
    }
  }
  /**
   *
   * @param dataIndex of the data
   * @returns offset of the index
   */
  private getScrollIndex(dataIndex: number) {
    if (this._viewport) {
      if (this._viewport.orientation === 'vertical') {
        const colPerRow = this.getColPerRow();
        const rowIndex = Math.floor(dataIndex / colPerRow);
        return rowIndex;
      } else {
        console.warn('The horizontal mode is not support yet.');
      }
    }
    return 0;
  }

  /**
   *
   * @returns range of data to render
   */
  private _updateRenderedRange() {
    if (!this._viewport) {
      return;
    }
    const colPerRow = this.getColPerRow();
    // get the current rendered range {start,end} of the data, actually the start/end indexs of the array
    const renderedRange = this._viewport.getRenderedRange();
    // init new render range as current, start, end
    const newRange = {start: renderedRange.start, end: renderedRange.end};
    // actually the height of the view port, we calculated based on height
    const viewportSize = this._viewport.getViewportSize();

    // total data length
    const dataLength = this._viewport.getDataLength();
    // current scrolloffset
    let scrollOffset = this._viewport.measureScrollOffset();

    // Prevent NaN as result when dividing by zero.
    const itemSize = this._itemDimension.height;
    // Totally same as fixed size scrolling start here except dataLength->rowLength
    let firstVisibleIndex = itemSize > 0 ? scrollOffset / itemSize : 0;

    // If user scrolls to the bottom of the list and data changes to a smaller list
    // use original range to check exceed condition
    if (newRange.end > dataLength) {
      // We have to recalculate the first visible index based on new data length and viewport size.
      const maxVisibleItems = Math.ceil(viewportSize / itemSize);
      const newVisibleIndex =
        Math.max(0, Math.min(firstVisibleIndex, dataLength - maxVisibleItems)) * colPerRow;

      // If first visible index changed we must update scroll offset to handle start/end buffers
      // Current range must also be adjusted to cover the new position (bottom of new list).
      if (firstVisibleIndex != newVisibleIndex) {
        firstVisibleIndex = newVisibleIndex;
        scrollOffset = newVisibleIndex * itemSize;
        newRange.start = Math.floor(firstVisibleIndex) * colPerRow;
      }

      newRange.end = Math.max(
        0,
        Math.min(dataLength, (newRange.start + maxVisibleItems) * colPerRow),
      );
    }

    const rowRange = {start: newRange.start / colPerRow, end: Math.ceil(newRange.end / colPerRow)};
    const startBuffer = scrollOffset - rowRange.start * itemSize;
    if (startBuffer < this._minBufferPx && rowRange.start != 0) {
      const expandStart = Math.ceil((this._maxBufferPx - startBuffer) / itemSize);
      rowRange.start = Math.max(0, rowRange.start - expandStart);
      rowRange.end = Math.min(
        dataLength,
        Math.ceil(firstVisibleIndex + (viewportSize + this._minBufferPx) / itemSize),
      );
    } else {
      const endBuffer = rowRange.end * itemSize - (scrollOffset + viewportSize);
      if (endBuffer < this._minBufferPx && rowRange.end != dataLength) {
        const expandEnd = Math.ceil((this._maxBufferPx - endBuffer) / itemSize);
        if (expandEnd > 0) {
          rowRange.end = Math.min(dataLength, rowRange.end + expandEnd);
          rowRange.start = Math.max(
            0,
            Math.floor(firstVisibleIndex - this._minBufferPx / itemSize),
          );
        }
      }
    }
    const updatedRange = {
      start: rowRange.start * colPerRow,
      end: Math.min(dataLength, rowRange.end * colPerRow),
    };
    // Totally same as fixed size scrolling above
    this._viewport.setRenderedRange(updatedRange);
    this._viewport.setRenderedContentOffset(this._itemDimension.height * rowRange.start);
    this._scrolledIndexChange.next(Math.floor(firstVisibleIndex));
  }
  private getColPerRow() {
    // we support multiple columns, so we need know the column number for calc
    // if not specific item width, treat as single column scroll
    const viewPortWidth = this._viewport?.elementRef.nativeElement.clientWidth || 0;
    let itemWidth = 0;
    if (typeof this._itemDimension.width == 'string') {
      itemWidth =
        viewPortWidth *
        (Number(coerceNumberProperty(this._itemDimension.width.replace('%', ''))) / 100);
    } else {
      itemWidth = coerceNumberProperty(this._itemDimension.width);
    }
    const colPerRow =
      itemWidth > 0 && viewPortWidth > itemWidth ? Math.floor(viewPortWidth / itemWidth) : 1;
    return colPerRow;
  }
  /**
   *
   * @returns Total virtual scroll size based on datalength and itemDemension
   */
  private _updateTotalContentSize() {
    if (!this._viewport) {
      return;
    }
    const colPerRow = this.getColPerRow();
    const rows = Math.ceil(this._viewport.getDataLength() / colPerRow);
    this._viewport.setTotalContentSize(rows * this._itemDimension.height);
  }
}

/**
 * Provider factory for `MultiColumnsVirtualScrollStrategy` that simply extracts the already created
 * `MultiColumnsVirtualScrollStrategy` from the given directive.
 * @param multiColumnsDir The instance of `CdkMultiColumnsVirtualScroll` to extract the
 *     `MultiColumnsVirtualScrollStrategy` from.
 */
export function _multiColumnVirtualScrollStrategyFactory(
  multiColumnsDir: CdkMultiColumnsVirtualScroll,
) {
  return multiColumnsDir._scrollStrategy;
}

/** A virtual scroll strategy that supports multi-column items. */
@Directive({
  selector: 'cdk-virtual-scroll-viewport[itemDimension]',
  standalone: true,
  providers: [
    {
      provide: VIRTUAL_SCROLL_STRATEGY,
      useFactory: _multiColumnVirtualScrollStrategyFactory,
      deps: [forwardRef(() => CdkMultiColumnsVirtualScroll)],
    },
  ],
})
export class CdkMultiColumnsVirtualScroll implements OnChanges {
  /**
   * For multiple columns virtual scroll, need to know how many column per row
   * Make sure the item dimension equal to the settings,
   * remember padding/margin/border are counter in as well
   */
  @Input()
  get itemDimension() {
    return this._itemDimension;
  }
  set itemDimension(val: ItemDimension) {
    this._itemDimension = val;
  }
  _itemDimension: ItemDimension = {width: 240, height: 50};

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
   * The number of pixels worth of buffer to render for when rendering new items. Defaults to 200px.
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
  _scrollStrategy = new MultiColumnVirtualScrollStrategy(
    this.itemDimension,
    this.minBufferPx,
    this.maxBufferPx,
  );

  ngOnChanges() {
    this._scrollStrategy.updateItemAndBufferSize(
      this.itemDimension,
      this.minBufferPx,
      this.maxBufferPx,
    );
  }
}
