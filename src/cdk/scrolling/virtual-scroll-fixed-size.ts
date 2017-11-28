import {Range} from '@angular/cdk/collections';
import {Directive, forwardRef, Input, OnChanges} from '@angular/core';
import {VIRTUAL_SCROLL_STRATEGY, VirtualScrollStrategy} from './virtual-scroll-strategy';
import {CdkVirtualScrollViewport} from './virtual-scroll-viewport';


/** Virtual scrolling strategy for lists with items of known fixed size. */
export class VirtualScrollFixedSizeStrategy implements VirtualScrollStrategy {
  private _viewport: CdkVirtualScrollViewport;

  constructor(public itemSize: number, public bufferSize: number) {}

  /** Initialize the strategy and specify the viewport it will be working with. */
  init(viewport: CdkVirtualScrollViewport) {
    this._viewport = viewport;
    this._viewport.totalContentSize = this._viewport.dataLength * this.itemSize;
    this._updateRenderedRange();
  }

  /** Re-initialize the strategy with the same viewport. */
  reinit() {
    if (this._viewport) {
      this.init(this._viewport);
    }
  }

  onContentScrolled() {
    this._updateRenderedRange();
  }

  onDataLengthChanged() {
    this._viewport.totalContentSize = this._viewport.dataLength * this.itemSize;
    this._updateRenderedRange();
  }

  private _updateRenderedRange() {
    const scrollOffset = this._viewport.measureScrollOffset();
    const firstVisibleIndex = Math.floor(scrollOffset / this.itemSize);
    const range = this._expandRange(
        {start: firstVisibleIndex, end: firstVisibleIndex},
        this.bufferSize,
        Math.ceil(this._viewport.viewportSize / this.itemSize) + this.bufferSize);
    this._viewport.renderedRange = range;
    this._viewport.renderedContentOffset = this.itemSize * range.start;
  }

  private _expandRange(range: Range, expandStart: number, expandEnd: number): Range {
    const start = Math.max(0, range.start - expandStart);
    const end = Math.min(this._viewport.dataLength, range.end + expandEnd);
    return {start, end};
  }
}


export function _virtualScrollFixedSizeStrategyFactory(fixedSizeDir: CdkVirtualScrollFixedSize) {
  return fixedSizeDir._scrollStrategy;
}


/** A virtual scroll strategy that supports fixed-size items. */
@Directive({
  selector: 'cdk-virtual-scroll-viewport[itemSize]',
  providers: [{
    provide: VIRTUAL_SCROLL_STRATEGY,
    useFactory: _virtualScrollFixedSizeStrategyFactory,
    deps: [forwardRef(() => CdkVirtualScrollFixedSize)],
  }],
})
export class CdkVirtualScrollFixedSize implements OnChanges {
  /** The size of the items in the list. */
  @Input() itemSize = 20;

  /** The number of extra elements to render on either side of the viewport. */
  @Input() bufferSize = 5;

  _scrollStrategy = new VirtualScrollFixedSizeStrategy(this.itemSize, this.bufferSize);

  ngOnChanges() {
    this._scrollStrategy.itemSize = this.itemSize;
    this._scrollStrategy.bufferSize = this.bufferSize;
    this._scrollStrategy.reinit();
  }
}
