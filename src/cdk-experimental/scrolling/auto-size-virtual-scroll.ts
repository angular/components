/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, forwardRef, Input, OnChanges} from '@angular/core';
import {VIRTUAL_SCROLL_STRATEGY, VirtualScrollStrategy} from './virtual-scroll-strategy';
import {CdkVirtualScrollViewport} from './virtual-scroll-viewport';


/** Virtual scrolling strategy for lists with items of unknown or dynamic size. */
export class AutoSizeVirtualScrollStrategy implements VirtualScrollStrategy {
  /** The attached viewport. */
  private _viewport: CdkVirtualScrollViewport | null = null;

  /** The size of the items in the virtually scrolling list. */
  private _minBufferPx: number;

  /** The number of buffer items to render beyond the edge of the viewport. */
  private _addBufferPx: number;

  /**
   * @param minBufferPx The minimum amount of buffer rendered beyond the viewport (in pixels).
   *     If the amount of buffer dips below this number, more items will be rendered.
   * @param addBufferPx The number of pixels worth of buffer to shoot for when rendering new items.
   *     If the actual amount turns out to be less it will not necessarily trigger an additional
   *     rendering cycle (as long as the amount of buffer is still greater than `minBufferPx`).
   */
  constructor(minBufferPx: number, addBufferPx: number) {
    this._minBufferPx = minBufferPx;
    this._addBufferPx = addBufferPx;
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

  /** Called when the viewport is scrolled (debounced using requestAnimationFrame). */
  onContentScrolled() {
    // TODO: do stuff.
  }

  /** Called when the length of the data changes. */
  onDataLengthChanged() {
    // TODO: do stuff.
  }

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
