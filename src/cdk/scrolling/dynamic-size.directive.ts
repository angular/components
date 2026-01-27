import {coerceNumberProperty, NumberInput} from '@angular/cdk/coercion';
import {Directive, forwardRef, Input, OnChanges} from '@angular/core';
import {VisibleRange} from './cdk-visible-range.directive';
import {CdkDynamicSizeVirtualScrollStrategy} from './dynamic-size-strategy';
import {VIRTUAL_SCROLL_STRATEGY} from './virtual-scroll-strategy';

export function _dynamicSizeVirtualScrollStrategyFactory(
  fixedSizeDir: CdkDynamicSizeVirtualScroll,
) {
  return fixedSizeDir._scrollStrategy;
}

@Directive({
  selector: 'cdk-virtual-scroll-viewport[dynamicSize]',
  providers: [
    {
      provide: VIRTUAL_SCROLL_STRATEGY,
      useFactory: _dynamicSizeVirtualScrollStrategyFactory,
      deps: [forwardRef(() => CdkDynamicSizeVirtualScroll)],
    },
  ],
})
export class CdkDynamicSizeVirtualScroll implements OnChanges {
  @Input()
  name!: string;

  @Input()
  disableAppending = false;

  /** The size of the items in the list (in pixels). */
  _sizes: number[] = [];

  @Input()
  get sizes(): number[] {
    return this._sizes;
  }

  set sizes(value: number[]) {
    this._sizes = value;
  }

  @Input()
  set visibleRange(range: VisibleRange) {
    this._scrollStrategy.setVisibleRowRange(range);
  }

  _stretch = false;

  @Input()
  set stretch(stretch: boolean) {
    this._stretch = stretch;
  }

  @Input()
  set rowindex(value: number) {
    this._scrollStrategy.gridRowIndex = value;
  }

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
  _scrollStrategy = new CdkDynamicSizeVirtualScrollStrategy(
    this.sizes,
    this.minBufferPx,
    this.maxBufferPx,
    this._stretch,
    this.disableAppending,
  );

  ngOnChanges() {
    this._scrollStrategy.updateItemAndBufferSize(
      this.sizes,
      this.minBufferPx,
      this.maxBufferPx,
      this._stretch,
      this.disableAppending,
    );
  }
}
