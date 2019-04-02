/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {coerceCssPixelValue} from '@angular/cdk/coercion';
import {Platform} from '@angular/cdk/platform';
import {ViewportRuler} from '@angular/cdk/scrolling';
import {Subscription} from 'rxjs';

import {OverlayReference} from '../overlay-reference';

import {
  BoundingBox,
  boundingBoxClass,
  BoundingBoxRect,
  clearBoundingBoxStyles,
  extendStyles,
  FlexibleConnectedPositionStrategyOrigin,
  getOriginRect,
  resetBoundingBoxStyles,
  resetOverlayElementStyles
} from './flexible-positioning';
import {PositionStrategy} from './position-strategy';

/**
 * A strategy for positioning overlays. Using this strategy, an overlay is given an
 * implicit position relative some origin element. The relative position is defined in terms of
 * a point on the origin element that is connected to a point on the overlay element. For example,
 * a basic dropdown is connecting the bottom-left corner of the origin to the top-left corner
 * of the overlay.
 */
export class CoverPositionStrategy implements PositionStrategy {
  /** The overlay to which this strategy is attached. */
  private _overlayRef: OverlayReference;

  /** Whether we're performing the very first positioning of the overlay. */
  private _isInitialRender: boolean;

  /** Whether the overlay can be pushed on-screen on the initial open. */
  private _canPush = true;

  /** Whether the overlay can grow via flexible width/height after the initial open. */
  private _growAfterOpen = false;

  /** Whether the overlay's width and height can be constrained to fit within the viewport. */
  private _hasFlexibleDimensions = true;

  /** Whether the overlay position is locked. */
  private _positionLocked = false;

  /** Amount of space that must be maintained between the overlay and the edge of the viewport. */
  private _viewportMargin = 0;

  /** Cached viewport dimensions. */
  private _viewportRect: BoundingBoxRect;

  /**
   * The origin element against which the horizontal start of the overlay will be positioned.
   * The start of the overlay will match the start of this element.
   */
  private _startOrigin?: FlexibleConnectedPositionStrategyOrigin;

  /**
   * The origin element against which the horizontal end of the overlay will be positioned.
   * The end of the overlay will match the end of this element.
   * If absent, the end of _startOrigin will be used.
   */
  private _endOrigin?: FlexibleConnectedPositionStrategyOrigin;

  /**
   * The origin element against which the top of the overlay will be positioned.
   * The top of the overlay will match the top of this element.
   */
  private _topOrigin?: FlexibleConnectedPositionStrategyOrigin;

  /**
   * The origin element against which the bottom of the overlay will be positioned.
   * The bottom of the overlay will match the bottom of this element.
   * If absent, _topOrigin will be used.
   */
  private _bottomOrigin?: FlexibleConnectedPositionStrategyOrigin;

  /** The overlay pane element. */
  private _pane: HTMLElement;

  /** Whether the strategy has been disposed of already. */
  private _isDisposed: boolean;

  /**
   * Parent element for the overlay panel used to constrain the overlay panel's size to fit
   * within the viewport.
   */
  private _boundingBox: HTMLElement | null;

  /** The last computed bounding box. */
  private _lastBoundingBox: Partial<BoundingBoxRect>|null;

  /** The last computed bounding box adjustments. */
  private _lastAdjustments: BoundingBox|null;

  /** Subscription to viewport size changes. */
  private _resizeSubscription = Subscription.EMPTY;

  constructor(
      private _viewportRuler: ViewportRuler,
      private _document: Document,
      private _platform: Platform,
      topConnectedTo?: FlexibleConnectedPositionStrategyOrigin,
      endConnectedTo?: FlexibleConnectedPositionStrategyOrigin,
      bottomConnectedTo?: FlexibleConnectedPositionStrategyOrigin,
      startConnectedTo?: FlexibleConnectedPositionStrategyOrigin,
  ) {
    this.withTopOrigin(topConnectedTo)
        .withEndOrigin(endConnectedTo)
        .withBottomOrigin(bottomConnectedTo)
        .withStartOrigin(startConnectedTo);
  }

  /** Attaches this position strategy to an overlay. */
  attach(overlayRef: OverlayReference): void {
    if (this._overlayRef && overlayRef !== this._overlayRef) {
      throw Error('This position strategy is already attached to an overlay');
    }

    overlayRef.hostElement.classList.add(boundingBoxClass);

    this._overlayRef = overlayRef;
    this._boundingBox = overlayRef.hostElement;
    this._pane = overlayRef.overlayElement;
    this._isDisposed = false;
    this._isInitialRender = true;
    this._lastBoundingBox = null;
    this._lastAdjustments = null;
    this._resizeSubscription.unsubscribe();
    this._resizeSubscription = this._viewportRuler.change().subscribe(() => {
      // When the window is resized, we want to trigger the next reposition as if it
      // was an initial render, in order for the strategy to pick a new optimal position,
      // otherwise position locking will cause it to stay at the old one.
      this._isInitialRender = true;
      this.apply();
    });
  }

  /**
   * Updates the position of the overlay element, using whichever preferred position relative
   * to the origin best fits on-screen.
   *
   * The selection of a position goes as follows:
   *  - If any positions fit completely within the viewport as-is,
   *      choose the first position that does so.
   *  - If flexible dimensions are enabled and at least one satifies the given minimum width/height,
   *      choose the position with the greatest available size modified by the positions' weight.
   *  - If pushing is enabled, take the position that went off-screen the least and push it
   *      on-screen.
   *  - If none of the previous criteria were met, use the position that goes off-screen the least.
   * @docs-private
   */
  apply(): void {
    // We shouldn't do anything if the strategy was disposed or we're on the server.
    if (this._isDisposed || !this._platform.isBrowser) {
      return;
    }

    // If the position has been applied already (e.g. when the overlay was opened) and the
    // consumer opted into locking in the position, re-use the old position, in order to
    // prevent the overlay from jumping around.
    if (!this._isInitialRender && this._positionLocked) {
      this._applyPosition(this._lastBoundingBox!, this._lastAdjustments!);
      return;
    }

    this._resetOverlayElementStyles();
    this._resetBoundingBoxStyles();

    // Get the viewport rect on the intiial render.
    // We use the viewport rect to determine whether a position would go off-screen.
    if (this._isInitialRender) {
      this._viewportRect = this._getViewportRect();
    }

    const boundingBox = this._calculateBoundingBoxRect();
    const adjustments = this._getOverlayAdjustment(boundingBox);

    this._applyPosition(boundingBox, adjustments);
  }

  detach(): void {
    this._lastBoundingBox = null;
    this._lastAdjustments = null;
    this._resizeSubscription.unsubscribe();
  }

  /** Cleanup after the element gets destroyed. */
  dispose(): void {
    if (this._isDisposed) {
      return;
    }

    // We can't use `_resetBoundingBoxStyles` here, because it resets
    // some properties to zero, rather than removing them.
    if (this._boundingBox) {
      clearBoundingBoxStyles(this._boundingBox.style);
    }

    if (this._pane) {
      this._resetOverlayElementStyles();
    }

    if (this._overlayRef) {
      this._overlayRef.hostElement.classList.remove(boundingBoxClass);
    }

    this.detach();
    this._overlayRef = this._boundingBox = null!;
    this._isDisposed = true;
  }

  /**
   * Sets a minimum distance the overlay may be positioned to the edge of the viewport.
   * @param margin Required margin between the overlay and the viewport edge in pixels.
   */
  withViewportMargin(margin: number): this {
    this._viewportMargin = margin;
    return this;
  }

  /** Sets whether the overlay's width and height can be constrained to fit within the viewport. */
  withFlexibleDimensions(flexibleDimensions = true): this {
    this._hasFlexibleDimensions = flexibleDimensions;
    return this;
  }

  /** Sets whether the overlay can grow after the initial open via flexible width/height. */
  withGrowAfterOpen(growAfterOpen = true): this {
    this._growAfterOpen = growAfterOpen;
    return this;
  }

  /** Sets whether the overlay can be pushed on-screen if none of the provided positions fit. */
  withPush(canPush = true): this {
    this._canPush = canPush;
    return this;
  }

  /**
   * Sets whether the overlay's position should be locked in after it is positioned
   * initially. When an overlay is locked in, it won't attempt to reposition itself
   * when the position is re-applied (e.g. when the user scrolls away).
   * @param isLocked Whether the overlay should locked in.
   */
  withLockedPosition(isLocked = true): this {
    this._positionLocked = isLocked;
    return this;
  }

  /**
   * Sets the origin, relative to which to position horozontal start of the overlay.
   * Using an element origin is useful for building components that need to be positioned
   * relatively to a trigger (e.g. dropdown menus or tooltips), whereas using a point can be
   * used for cases like contextual menus which open relative to the user's pointer.
   * @param origin Reference to the new origin.
   */
  withStartOrigin(origin?: FlexibleConnectedPositionStrategyOrigin): this {
    this._startOrigin = origin;
    return this;
  }

  /**
   * Sets the origin, relative to which to position horozontal end of the overlay.
   * Using an element origin is useful for building components that need to be positioned
   * relatively to a trigger (e.g. dropdown menus or tooltips), whereas using a point can be
   * used for cases like contextual menus which open relative to the user's pointer.
   * @param origin Reference to the new origin.
   */
  withEndOrigin(origin?: FlexibleConnectedPositionStrategyOrigin): this {
    this._endOrigin = origin;
    return this;
  }

  /**
   * Sets the origin, relative to which to position top of the overlay.
   * Using an element origin is useful for building components that need to be positioned
   * relatively to a trigger (e.g. dropdown menus or tooltips), whereas using a point can be
   * used for cases like contextual menus which open relative to the user's pointer.
   * @param origin Reference to the new origin.
   */
  withTopOrigin(origin?: FlexibleConnectedPositionStrategyOrigin): this {
    this._topOrigin = origin;
    return this;
  }

  /**
   * Sets the origin, relative to which to position bottom of the overlay.
   * Using an element origin is useful for building components that need to be positioned
   * relatively to a trigger (e.g. dropdown menus or tooltips), whereas using a point can be
   * used for cases like contextual menus which open relative to the user's pointer.
   * @param origin Reference to the new origin.
   */
  withBottomOrigin(origin?: FlexibleConnectedPositionStrategyOrigin): this {
    this._bottomOrigin = origin;
    return this;
  }

  /** Gets how well an overlay at the given point will fit within the viewport. */
  private _getOverlayAdjustment(overlay: Partial<BoundingBoxRect>): BoundingBox {
    const top = overlay.top == null ? overlay.bottom! - overlay.height! : overlay.top;
    const right = overlay.right == null ?
        overlay.left! + overlay.width! - this._viewportRect.width : overlay.right;
    const bottom = overlay.bottom == null ?
        overlay.top! + overlay.height! - this._viewportRect.height : overlay.bottom;
    const left = overlay.left == null ? overlay.right! - overlay.width! : overlay.left;

    return {
      top: this._viewportMargin - top,
      right: this._viewportMargin - right,
      bottom: this._viewportMargin - bottom,
      left: this._viewportMargin - left,
    };
  }

  private _adjustBoundingBox(inputOverlay: Partial<BoundingBoxRect>, adjustments: BoundingBox):
      Partial<BoundingBoxRect> {
    const overlay = {...inputOverlay};
    let pushFromTop = 0;
    let pushFromRight = 0;
    let pushFromBottom = 0;
    let pushFromLeft = 0;

    if (this._canPush) {
      if (this._hasFlexibleDimensions) {
        // Push from all directions (shrinking the resulting overlay is ok).
        pushFromTop = overlay.top != null && adjustments.top! > 0 ? adjustments.top! : 0;
        pushFromRight = overlay.right != null && adjustments.right! > 0 ? adjustments.right! : 0;
        pushFromBottom = overlay.bottom != null && adjustments.bottom! > 0 ?
            adjustments.bottom! : 0;
        pushFromLeft = overlay.left != null && adjustments.left! > 0 ? adjustments.left! : 0;

        // Make further adjustments if we overshoot min-height or min-width.
        const overlayConfig = this._overlayRef.getConfig();
        const minHeight = overlayConfig.minHeight;
        const minWidth = overlayConfig.minWidth;
        const shrinkHeight = pushFromTop + pushFromBottom;
        const shrinkWidth = pushFromLeft + pushFromRight;
        const overShrinkHeight = minHeight - (overlay.height! - shrinkHeight);
        const overShrinkWidth = minWidth - (overlay.width! - shrinkWidth);
        if (overShrinkHeight > 0) {
          if (overlay.bottom != null) {
            pushFromBottom -= overShrinkHeight;
          } else {
            pushFromTop -= overShrinkHeight;
          }
        }
        if (overShrinkWidth > 0) {
          if (overlay.left != null) {
            pushFromLeft -= overShrinkWidth;
          } else {
            pushFromRight -= overShrinkWidth;
          }
        }

        overlay.height = Math.max(overlay.height! - shrinkHeight, minHeight);
        overlay.width = Math.max(overlay.width! - shrinkWidth, minWidth);
      } else {
        // Push only if we can do so without shrinking the overlay.
        pushFromTop = adjustments.top! > 0 && adjustments.bottom! < 0 ?
            Math.min(adjustments.top!, -adjustments.bottom!) : 0;
        pushFromRight = adjustments.right! > 0 && adjustments.left! < 0 ?
            Math.min(adjustments.right!, -adjustments.left!) : 0;
        pushFromBottom =  adjustments.bottom! > 0 && adjustments.top! < 0 ?
            Math.min(adjustments.bottom!, -adjustments.top!) : 0;
        pushFromLeft =  adjustments.left! > 0 && adjustments.right! < 0 ?
            Math.min(adjustments.left!, -adjustments.right!) : 0;
      }
    }

    if (pushFromTop) {
      if (overlay.top != null) {
        overlay.top += pushFromTop;
      } else {
        overlay.bottom! -= pushFromTop;
      }
    }
    if (pushFromRight) {
      if (overlay.right != null) {
        overlay.right += pushFromRight;
      } else {
        overlay.left! -= pushFromRight;
      }
    }
    if (pushFromBottom) {
      if (overlay.bottom != null) {
        overlay.bottom += pushFromBottom;
      } else {
        overlay.top! -= pushFromBottom;
      }
    }
    if (pushFromLeft) {
      if (overlay.left != null) {
        overlay.left += pushFromLeft;
      } else {
        overlay.right! -= pushFromLeft;
      }
    }

    if (this._hasFlexibleDimensions) {
      if (!overlay.top) {
        overlay.top = this._viewportMargin;
      }
      if (!overlay.right) {
        overlay.right = this._viewportMargin;
      }
      if (!overlay.bottom) {
        overlay.bottom = this._viewportMargin;
      }
      if (!overlay.left) {
        overlay.left = this._viewportMargin;
      }
    }

    return overlay;
  }

  private _applyPosition(boundingBox: Partial<BoundingBoxRect>, adjustments: BoundingBox) {
    this._setOverlayElementStyles(boundingBox);
    this._setBoundingBoxStyles(boundingBox, adjustments);

    this._isInitialRender = false;
    this._lastBoundingBox = boundingBox;
    this._lastAdjustments = adjustments;
  }

  /**
   * Gets the position and size of the overlay's sizing container based on the origins
   * and the viewport.
   *
   * This method does no measuring and applies no styles so that we can cheaply compute the
   * bounds for all positions and choose the best fit based on these results.
   */
  private _calculateBoundingBoxRect(): Partial<BoundingBoxRect> {
    const viewport = this._viewportRect;
    const isRtl = this._isRtl();

    const boundingBox: Partial<BoundingBoxRect> = {};

    if (this._topOrigin) {
      boundingBox.top = getOriginRect(this._topOrigin).top;
    }
    if (this._endOrigin) {
      const endRect = getOriginRect(this._endOrigin);
      if (isRtl) {
        boundingBox.left = endRect.left;
      } else {
        boundingBox.right = viewport.left + viewport.right - endRect.right;
      }
    }
    if (this._bottomOrigin) {
      boundingBox.bottom = viewport.top + viewport.bottom -
          getOriginRect(this._bottomOrigin).bottom;
    }
    if (this._startOrigin) {
      const startRect = getOriginRect(this._startOrigin);
      if (isRtl) {
        boundingBox.right = viewport.left + viewport.right - startRect.right;
      } else {
        boundingBox.left = startRect.left;
      }
    }

    // Figure out a height if top or bottom is not set.
    if (boundingBox.top == null && boundingBox.bottom == null) {
      throw new Error('CoverPositionStrategy: must have a top or bottom origin element');
    }
    if (boundingBox.left == null && boundingBox.right == null) {
      throw new Error('CoverPositionStrategy: must have a start or end origin element');
    }

    if (boundingBox.top == null) {
      boundingBox.height = viewport.height - boundingBox.bottom! - this._viewportMargin;
    } else if (boundingBox.bottom == null) {
      boundingBox.height = viewport.height - boundingBox.top + this._viewportMargin;
    } else {
      boundingBox.height = viewport.height - boundingBox.bottom - boundingBox.top;
    }

    if (boundingBox.left == null) {
      boundingBox.width = viewport.width - boundingBox.right! - this._viewportMargin;
      console.log('r', boundingBox.width);
    } else if (boundingBox.right == null) {
      boundingBox.width = viewport.width - boundingBox.left + this._viewportMargin;
    } else {
      boundingBox.width = viewport.width - boundingBox.left - boundingBox.right;
    }

    return boundingBox;
  }

  /**
   * Sets the position and size of the overlay's sizing wrapper. The wrapper is positioned on the
   * origin's connection point and stetches to the bounds of the viewport.
   */
  private _setBoundingBoxStyles(boundingBox: Partial<BoundingBoxRect>, adjustments: BoundingBox):
      void {
    const overlay = this._adjustBoundingBox(boundingBox, adjustments);
    const styles = {} as CSSStyleDeclaration;

    const overlayConfig = this._overlayRef.getConfig();
    let maxHeight = overlayConfig.maxHeight;
    let maxWidth = overlayConfig.maxWidth;

    if (!this._isInitialRender && this._hasFlexibleDimensions && !this._growAfterOpen) {
      const lastPosition = this._adjustBoundingBox(this._lastBoundingBox!, this._lastAdjustments!);
      if (lastPosition!.height! <= overlay.height!) {
        maxHeight = Math.min(
            lastPosition!.height! + 2 * this._viewportMargin, maxHeight || Number.MAX_VALUE);
        overlay.height = lastPosition!.height;
      }
      if (lastPosition!.width! <= overlay.width!) {
        maxWidth = Math.min(
            lastPosition!.width! + 2 * this._viewportMargin, maxWidth || Number.MAX_VALUE);
        overlay.width = lastPosition!.width;
      }
    }

    styles.top = coerceCssPixelValue(overlay.top);
    styles.right = coerceCssPixelValue(overlay.right);
    styles.bottom = coerceCssPixelValue(overlay.bottom);
    styles.left = coerceCssPixelValue(overlay.left);

    // Push the pane content towards the proper direction.
    styles.alignItems = boundingBox.left == null ? 'flex-end' : 'flex-start';
    styles.justifyContent = boundingBox.top == null ? 'flex-end' : 'flex-start';

    if (maxHeight) {
      styles.maxHeight = coerceCssPixelValue(maxHeight);
    }
    if (maxWidth) {
      styles.maxWidth = coerceCssPixelValue(maxWidth);
    }

    extendStyles(this._boundingBox!.style, styles);
  }

  /** Resets the styles for the bounding box so that a new positioning can be computed. */
  private _resetBoundingBoxStyles(): void {
    resetBoundingBoxStyles(this._boundingBox!.style);
  }

  /** Resets the styles for the overlay pane so that a new positioning can be computed. */
  private _resetOverlayElementStyles(): void {
    resetOverlayElementStyles(this._pane.style);
  }

  /** Sets positioning styles to the overlay element. */
  private _setOverlayElementStyles(overlay: Partial<BoundingBox>): void {
    const styles = {} as CSSStyleDeclaration;

    styles.position = 'static';

    if (overlay.top != null && overlay.bottom != null) {
      styles.height = '100%';
    }
    if (overlay.left != null && overlay.right != null) {
      styles.width = '100%';
    }

    // If a maxWidth or maxHeight is specified on the overlay, we remove them. We do this because
    // we need these values to both be set to "100%" for the automatic flexible sizing to work.
    // The maxHeight and maxWidth are set on the boundingBox in order to enforce the constraint.
    if (this._hasFlexibleDimensions && this._overlayRef.getConfig().maxHeight) {
      styles.maxHeight = '';
    }

    if (this._hasFlexibleDimensions && this._overlayRef.getConfig().maxWidth) {
      styles.maxWidth = '';
    }

    extendStyles(this._pane.style, styles);
  }

  /** Narrows the given viewport rect by the current _viewportMargin. */
  private _getViewportRect(): BoundingBoxRect {
    // We recalculate the viewport rect here ourselves, rather than using the ViewportRuler,
    // because we want to use the `clientWidth` and `clientHeight` as the base. The difference
    // being that the client properties don't include the scrollbar, as opposed to `innerWidth`
    // and `innerHeight` that do. This is necessary, because the overlay container uses
    // 100% `width` and `height` which don't include the scrollbar either.
    const width = this._document.documentElement!.clientWidth;
    const height = this._document.documentElement!.clientHeight;

    return {
      top:    this._viewportMargin,
      left:   this._viewportMargin,
      right:  width - this._viewportMargin,
      bottom: height - this._viewportMargin,
      width:  width  - (2 * this._viewportMargin),
      height: height - (2 * this._viewportMargin),
    };
  }

  /** Whether the we're dealing with an RTL context */
  private _isRtl(): boolean {
    return this._overlayRef.getDirection() === 'rtl';
  }
}
