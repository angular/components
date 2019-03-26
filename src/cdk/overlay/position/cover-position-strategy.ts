/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PositionStrategy} from './position-strategy';
import {ElementRef} from '@angular/core';
import {ViewportRuler,/* CdkScrollable,*/ /*ViewportScrollPosition*/} from '@angular/cdk/scrolling';
/*import {
  ConnectedOverlayPositionChange,
  ConnectionPositionPair,
  ScrollingVisibility,
  validateHorizontalPosition,
  validateVerticalPosition,
} from './connected-position';
*/import {/*Observable,*/ Subscription/*, Observer*/} from 'rxjs';
import {OverlayReference} from '../overlay-reference';
/*import {isElementScrolledOutsideView, isElementClippedByScrolling} from './scroll-clip';*/
import {coerceCssPixelValue/*, coerceArray*/} from '@angular/cdk/coercion';
import {Platform} from '@angular/cdk/platform';
/*import {OverlayContainer} from '../overlay-container';*/
import {clearStyles, extendStyles, FlexibleConnectedPositionStrategyOrigin, getOriginRect, Point, Rect} from './flexible-positioning';

/** Class to be added to the overlay bounding box. */
const boundingBoxClass = 'cdk-overlay-connected-position-bounding-box';

/** Possible values that can be set as the origin of a FlexibleConnectedPositionStrategy. */
export type FlexibleConnectedPositionStrategyOrigin = ElementRef | HTMLElement | Point;

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

  /** Last size used for the bounding box. Used to avoid resizing the overlay after open. */
/*  private _lastBoundingBoxSize = {width: 0, height: 0};*/

  /** Whether the overlay was pushed in a previous positioning. */
/*  private _isPushed = false;*/

  /** Whether the overlay can be pushed on-screen on the initial open. */
  private _canPush = true;

  /** Whether the overlay can grow via flexible width/height after the initial open. */
  private _growAfterOpen = false;

  /** Whether the overlay's width and height can be constrained to fit within the viewport. */
  private _hasFlexibleDimensions = true;

  /** Whether the overlay position is locked. */
  private _positionLocked = false;

  /** Cached origin dimensions */
/*  private _originRect: Rect;*/

  /** Cached overlay dimensions */
/*  private _overlayRect: Rect;*/

  /** Amount of space that must be maintained between the overlay and the edge of the viewport. */
  private _viewportMargin = 0;

  /** Cached viewport dimensions. */
  private _viewportRect: Rect;

  /** The Scrollable containers used to check scrollable view properties on position change. */
/*  private scrollables: CdkScrollable[] = [];*/
  
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

  /** The last position to have been calculated as the best fit position. */
  private _lastPosition: Rect | null;

  /** Subscription to viewport size changes. */
  private _resizeSubscription = Subscription.EMPTY;

  /** Keeps track of the CSS classes that the position strategy has applied on the overlay panel. */
  private _appliedPanelClasses: string[] = [];

  constructor(
    private _viewportRuler: ViewportRuler,
    private _document: Document,
    private _platform: Platform,
/*    private _overlayContainer: OverlayContainer,*/
    topConnectedTo?: FlexibleConnectedPositionStrategyOrigin,
    endConnectedTo?: FlexibleConnectedPositionStrategyOrigin,
    bottomConnectedTo?: FlexibleConnectedPositionStrategyOrigin,
    startConnectedTo?: FlexibleConnectedPositionStrategyOrigin,) {
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
    this._lastPosition = null;
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
    if (!this._isInitialRender && this._positionLocked && this._lastPosition) {
      console.log('would reapply');
/*      this.reapplyLastPosition();*/
/*      return;*/
    }

    this._clearPanelClasses();
    this._resetOverlayElementStyles();
    this._resetBoundingBoxStyles();

    // We need the bounding rects for the origins and the overlay to determine how to position
    // the overlay relative to the origin.
    // We use the viewport rect to determine whether a position would go off-screen.

/*    this._startOriginRect = getOriginRect(this._startOrigin);
    this._endOriginRect = getOriginRect(this._endOrigin);
    this._topOriginRect = getOriginRect(this._topOrigin);
    this._bottomOriginRect = getOriginRect(this._bottomOrigin);
*/    /*this._overlayRect = this._pane.getBoundingClientRect();*/

    // Compute the preferred position based on the origins.
    if (this._isInitialRender) {
      this._viewportRect = this._getViewportRect();
    }
    
    const scrollPosition = this._viewportRuler.getViewportScrollPosition();

    const boundingBox = this._calculateBoundingBoxRect();
    const adjustments = this._getOverlayAdjustment(boundingBox, scrollPosition);

    this._applyPosition(boundingBox, adjustments);
  }

  detach() {
    this._clearPanelClasses();
    this._lastPosition = null;
    this._resizeSubscription.unsubscribe();
  }

  /** Cleanup after the element gets destroyed. */
  dispose() {
    if (this._isDisposed) {
      return;
    }

    // We can't use `_resetBoundingBoxStyles` here, because it resets
    // some properties to zero, rather than removing them.
    if (this._boundingBox) {
      clearStyles(this._boundingBox.style);
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
   * This re-aligns the overlay element with the trigger in its last calculated position,
   * even if a position higher in the "preferred positions" list would now fit. This
   * allows one to re-align the panel without changing the orientation of the panel.
   */
  /*reapplyLastPosition(): void {
    if (!this._isDisposed && this._platform.isBrowser) {
      this._originRect = this._getOriginRect();
      this._overlayRect = this._pane.getBoundingClientRect();
      this._viewportRect = this._getNarrowedViewportRect();

      this._applyPosition(this._lastPosition);
    }
  }
*/
  /**
   * Sets the list of Scrollable containers that host the origin element so that
   * on reposition we can evaluate if it or the overlay has been clipped or outside view. Every
   * Scrollable must be an ancestor element of the strategy's origin element.
   */
/*  withScrollableContainers(scrollables: CdkScrollable[]) {
    this.scrollables = scrollables;
  }*/

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
  private _getOverlayAdjustment(overlay: Partial<Rect>, scrollPosition: Pick<Rect, 'top'|'left'>): Partial<Rect> {
    const top = overlay.top == null ? overlay.bottom! - overlay.height! : overlay.top;
    const right = overlay.right == null ? overlay.left! + overlay.width! : overlay.right;
    const bottom = overlay.bottom == null ? overlay.top! + overlay.height! : overlay.bottom;
    const left = overlay.left == null ? overlay.right! - overlay.width! : overlay.left;

    //todo - the way we compute right and bottom is probably wrong
    //todo - need to apply scroll position
    scrollPosition.top;
    return {
      top: 0 - top,
      right: right - this._viewportRect.width,
      bottom: bottom - this._viewportRect.height,
      left: 0 - left,
    };
  }

  /**
   * Whether the overlay can fit within the viewport when it may resize either its width or height.
   * @param fit How well the overlay fits in the viewport at some position.
   * @param point The (x, y) coordinates of the overlat at some position.
   * @param viewport The geometry of the viewport.
   */
/*  private _canFitWithFlexibleDimensions(overlay: Partial<Rect>, adjustments: Rect) {
    if (!this._hasFlexibleDimensions) return false;

    const availableHeight = viewport.bottom - point.y;
    const availableWidth = viewport.right - point.x;
    const minHeight = this._overlayRef.getConfig().minHeight;
    const minWidth = this._overlayRef.getConfig().minWidth;

    const verticalFit = adjustments.top + adjustments.bottom <= minHeight || 0;
    const horizontalFit = adjustments.left + adjustments.right <= minWidth || 0;

    return verticalFit && horizontalFit;
  }
*/
  private _adjustBoundingBox(inputOverlay: Partial<Rect>, adjustments: Partial<Rect>) {
    const overlayConfig = this._overlayRef.getConfig();
    
    const overlay = {...inputOverlay};
    let pushFromTop = 0;
    let pushFromRight = 0;
    let pushFromBottom = 0;
    let pushFromLeft = 0;
    let shrinkHeight = 0;
    let shrinkWidth = 0;
    
    if (this._canPush) {
      if (this._hasFlexibleDimensions) {
        // Push from all directions (shrinking the resulting overlay is ok).
        pushFromTop = overlay.top != null && adjustments.top! > 0 ? adjustments.top! : 0;
        pushFromRight = overlay.right != null && adjustments.right! > 0 ? adjustments.right! : 0;
        pushFromBottom = overlay.bottom != null && adjustments.bottom! > 0 ? adjustments.bottom! : 0;
        pushFromLeft = overlay.left != null && adjustments.left! > 0 ? adjustments.left! : 0;
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
    
    if (this._hasFlexibleDimensions) {
      shrinkHeight = overlay.height != null ?
          (adjustments.top! - pushFromTop) + (adjustments.bottom! - pushFromBottom) : 0;
      shrinkWidth = overlay.width != null ?
          (adjustments.left! - pushFromLeft) + (adjustments.right! - pushFromRight) : 0;
    }
    
    if (pushFromTop) {
      if (overlay.top != null) {
        overlay.top += pushFromTop;
      } else {
        overlay.bottom! += pushFromTop;
      }
/*      this._isPushed = true;*/
    }
    if (pushFromRight) {
      if (overlay.right != null) {
        overlay.right -= pushFromRight;
      } else {
        overlay.left! -= pushFromRight;
      }
/*      this._isPushed = true;*/
    }
    if (pushFromBottom) {
      if (overlay.bottom != null) {
        overlay.bottom -= pushFromBottom;
      } else {
        overlay.top! -= pushFromBottom;
      }
/*      this._isPushed = true;*/
    }
    if (pushFromLeft) {
      if (overlay.left != null) {
        overlay.left += pushFromLeft;
      } else {
        overlay.right! += pushFromRight;
      }
/*      this._isPushed = true;*/
    }
    if (shrinkHeight) {
      overlay.height = Math.max(overlayConfig.minHeight || 0, overlay.height! - shrinkHeight);
    }
    if (shrinkWidth) {
      overlay.width = Math.max(overlayConfig.minWidth || 0, overlay.width! - shrinkWidth);
    }
    
    return overlay;
  }

  private _applyPosition(inputOverlay: Partial<Rect>, adjustments: Partial<Rect>) {
    const overlay = this._adjustBoundingBox(inputOverlay, adjustments);

    this._setOverlayElementStyles(overlay);
    this._setBoundingBoxStyles(overlay);

    this._isInitialRender = false;
  }

  /**
   * Gets the position and size of the overlay's sizing container based on the origins
   * and the viewport.
   *
   * This method does no measuring and applies no styles so that we can cheaply compute the
   * bounds for all positions and choose the best fit based on these results.
   */
  private _calculateBoundingBoxRect(): Partial<Rect> {
    const viewport = this._viewportRect;
    const isRtl = this._isRtl();
    
    const boundingBox: Partial<Rect> = {};

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
      boundingBox.bottom = viewport.top + viewport.bottom - getOriginRect(this._bottomOrigin).bottom;
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
    }
    
    if (boundingBox.left == null) {
      boundingBox.width = viewport.left - boundingBox.right! - this._viewportMargin;
    } else if (boundingBox.right == null) {
      boundingBox.width = viewport.right - boundingBox.left + this._viewportMargin;
    }

    return boundingBox;
  }

  /**
   * Sets the position and size of the overlay's sizing wrapper. The wrapper is positioned on the
   * origin's connection point and stetches to the bounds of the viewport.
   */
  private _setBoundingBoxStyles(overlay: Partial<Rect>): void {
    const boundingBoxRect = {...overlay};
    
    // It's weird if the overlay *grows* while scrolling, so we take the last size into account
    // when applying a new size.
    if (!this._isInitialRender && !this._growAfterOpen) {
      // Todo: figure this out - need to handle that either value could be undefined
      /*if (boundingBoxRect != null) {

      }
      boundingBoxRect.height = Math.min(boundingBoxRect.height, this._lastBoundingBoxSize.height);
      boundingBoxRect.width = Math.min(boundingBoxRect.width, this._lastBoundingBoxSize.width);*/
    }

    const styles = {} as CSSStyleDeclaration;

/*    if (this._hasExactPosition()) {
      styles.top = styles.left = '0';
      styles.bottom = styles.right = '';
      styles.width = styles.height = '100%';
    } else {*/
      const maxHeight = this._overlayRef.getConfig().maxHeight;
      const maxWidth = this._overlayRef.getConfig().maxWidth;

      // todo: do we need to transform empty values to hit screen edges?

      styles.height = coerceCssPixelValue(boundingBoxRect.height);
      styles.top = coerceCssPixelValue(boundingBoxRect.top);
      styles.bottom = coerceCssPixelValue(boundingBoxRect.bottom);
      styles.width = coerceCssPixelValue(boundingBoxRect.width);
      styles.left = coerceCssPixelValue(boundingBoxRect.left);
      styles.right = coerceCssPixelValue(boundingBoxRect.right);

      // Push the pane content towards the proper direction.
      styles.alignItems = boundingBoxRect.left == null ? 'flex-end' : 'flex-start';
      styles.justifyContent = boundingBoxRect.top == null ? 'flex-end' : 'flex-start';

      if (maxHeight) {
        styles.maxHeight = coerceCssPixelValue(maxHeight);
      }

      if (maxWidth) {
        styles.maxWidth = coerceCssPixelValue(maxWidth);
      }
/*    }*/

/*    this._lastBoundingBoxSize = boundingBoxRect;*/

    extendStyles(this._boundingBox!.style, styles);
  }

  /** Resets the styles for the bounding box so that a new positioning can be computed. */
  private _resetBoundingBoxStyles() {
    extendStyles(this._boundingBox!.style, {
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      height: '',
      width: '',
      alignItems: '',
      justifyContent: '',
    } as CSSStyleDeclaration);
  }

  /** Resets the styles for the overlay pane so that a new positioning can be computed. */
  private _resetOverlayElementStyles() {
    extendStyles(this._pane.style, {
      top: '',
      left: '',
      bottom: '',
      right: '',
      position: '',
      transform: '',
    } as CSSStyleDeclaration);
  }

  /** Sets positioning styles to the overlay element. */
  private _setOverlayElementStyles(overlay: Partial<Rect>): void {
    const styles = {} as CSSStyleDeclaration;

    styles.position = 'static';

    if (overlay.top != null && overlay.bottom != null) {
      styles.height = '100%';
    }
    if (overlay.left != null && overlay.right != null) {
      styles.width = '100%';
    }

/*    if (this._hasExactPosition()) {
      const scrollPosition = this._viewportRuler.getViewportScrollPosition();
      extendStyles(styles, this._getExactOverlayY(position, originPoint, scrollPosition));
      extendStyles(styles, this._getExactOverlayX(position, originPoint, scrollPosition));
    } else {
      styles.position = 'static';
    }*/

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
  private _getViewportRect(): Rect {
    // We recalculate the viewport rect here ourselves, rather than using the ViewportRuler,
    // because we want to use the `clientWidth` and `clientHeight` as the base. The difference
    // being that the client properties don't include the scrollbar, as opposed to `innerWidth`
    // and `innerHeight` that do. This is necessary, because the overlay container uses
    // 100% `width` and `height` which don't include the scrollbar either.
    const width = this._document.documentElement!.clientWidth;
    const height = this._document.documentElement!.clientHeight;
/*    const scrollPosition = this._viewportRuler.getViewportScrollPosition();*/

    return {
      top:    /*scrollPosition.top +*/ this._viewportMargin,
      left:   /*scrollPosition.left +*/ this._viewportMargin,
      right:  /*scrollPosition.left +*/ width - this._viewportMargin,
      bottom: /*scrollPosition.top +*/ height - this._viewportMargin,
      width:  width  - (2 * this._viewportMargin),
      height: height - (2 * this._viewportMargin),
    };
  }

  /** Whether the we're dealing with an RTL context */
  private _isRtl() {
    return this._overlayRef.getDirection() === 'rtl';
  }

  /** Determines whether the overlay uses exact or flexible positioning. */
/*  private _hasExactPosition() {
    return !this._hasFlexibleDimensions || this._isPushed;
  }
*/
  /** Adds a single CSS class or an array of classes on the overlay panel. */
/*  private _addPanelClasses(cssClasses: string | string[]) {
    if (this._pane) {
      coerceArray(cssClasses).forEach(cssClass => {
        if (cssClass !== '' && this._appliedPanelClasses.indexOf(cssClass) === -1) {
          this._appliedPanelClasses.push(cssClass);
          this._pane.classList.add(cssClass);
        }
      });
    }
  }*/

  /** Clears the classes that the position strategy has applied from the overlay panel. */
  private _clearPanelClasses() {
    if (this._pane) {
      this._appliedPanelClasses.forEach(cssClass => {
        this._pane.classList.remove(cssClass);
      });
      this._appliedPanelClasses = [];
    }
  }
}
