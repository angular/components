/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PositionStrategy} from './position-strategy';
import {OverlayReference} from '../overlay-reference';

/** Class to be added to the overlay pane wrapper. */
const wrapperClass = 'cdk-global-overlay-wrapper';

/**
 * A strategy for positioning overlays. Using this strategy, an overlay is given an
 * explicit position relative to the browser's viewport. We use flexbox, instead of
 * transforms, in order to avoid issues with subpixel rendering which can cause the
 * element to become blurry.
 */
export class GlobalPositionStrategy implements PositionStrategy {
  /** The overlay to which this strategy is attached. */
  private _overlayRef: OverlayReference;
  private _width: string = '';
  private _height: string = '';
  private _yPosition: 'top' | 'bottom' | 'center' = 'center';
  private _yOffset = '';
  private _xPosition: 'left' | 'right' | 'start' | 'end' | 'center' = 'center';
  private _xOffset = '';
  private _isDisposed: boolean;

  attach(overlayRef: OverlayReference): void {
    const config = overlayRef.getConfig();

    this._overlayRef = overlayRef;

    if (this._width && !config.width) {
      overlayRef.updateSize({width: this._width});
    }

    if (this._height && !config.height) {
      overlayRef.updateSize({height: this._height});
    }

    overlayRef.hostElement.classList.add(wrapperClass);
    this._isDisposed = false;
  }

  /**
   * Positions the overlay to the top of the viewport.
   * @param offset Offset from the top of the viewport.
   */
  top(offset: string = ''): this {
    this._yOffset = offset;
    this._yPosition = 'top';
    return this;
  }

  /**
   * Positions the overlay to the left of the viewport, no matter what layout direction it has.
   * @param offset Offset from the left of the viewport.
   */
  left(offset: string = ''): this {
    this._xOffset = offset;
    this._xPosition = 'left';
    return this;
  }

  /**
   * Positions the overlay to the bottom of the viewport.
   * @param offset Offset from the bottom of the viewport.
   */
  bottom(offset: string = ''): this {
    this._yOffset = offset;
    this._yPosition = 'bottom';
    return this;
  }

  /**
   * Positions the overlay to the right of the viewport, no matter what layout direction it has.
   * @param offset Offset from the right of the viewport.
   */
  right(offset: string = ''): this {
    this._xOffset = offset;
    this._xPosition = 'right';
    return this;
  }

  /**
   * Sets the overlay to the start of the viewport, depending on the overlay direction.
   * This will be to the left in LTR layouts and to the right in RTL.
   * @param offset Offset from the edge of the screen.
   */
  start(offset: string = ''): this {
    this._xOffset = offset;
    this._xPosition = 'start';
    return this;
  }

  /**
   * Sets the overlay to the end of the viewport, depending on the overlay direction.
   * This will be to the right in LTR layouts and to the left in RTL.
   * @param offset Offset from the edge of the screen.
   */
  end(offset: string = ''): this {
    this._xOffset = offset;
    this._xPosition = 'end';
    return this;
  }

  /**
   * Sets the overlay width and clears any previously set width.
   * @param value New width for the overlay
   * @deprecated Pass the `width` through the `OverlayConfig`.
   * @breaking-change 8.0.0
   */
  width(value: string = ''): this {
    if (this._overlayRef) {
      this._overlayRef.updateSize({width: value});
    } else {
      this._width = value;
    }

    return this;
  }

  /**
   * Sets the overlay height and clears any previously set height.
   * @param value New height for the overlay
   * @deprecated Pass the `height` through the `OverlayConfig`.
   * @breaking-change 8.0.0
   */
  height(value: string = ''): this {
    if (this._overlayRef) {
      this._overlayRef.updateSize({height: value});
    } else {
      this._height = value;
    }

    return this;
  }

  /**
   * Centers the overlay horizontally in the viewport.
   * @param offset Offset from the center of the viewport.
   */
  centerHorizontally(offset: string = ''): this {
    this._xOffset = offset;
    this._xPosition = 'center';
    return this;
  }

  /**
   * Centers the overlay vertically in the viewport.
   * @param offset Offset from the center of the viewport.
   */
  centerVertically(offset: string = ''): this {
    this._yPosition = 'center';
    this._yOffset = offset;
    return this;
  }

  /**
   * Apply the position to the element.
   * @docs-private
   */
  apply(): void {
    // Since the overlay ref applies the strategy asynchronously, it could
    // have been disposed before it ends up being applied. If that is the
    // case, we shouldn't do anything.
    if (!this._overlayRef || !this._overlayRef.hasAttached()) {
      return;
    }

    this._overlayRef.overlayElement.style.position = 'static';
    this._applyYPosition();
    this._applyXPosition();
  }

  private _applyYPosition() {
    const styles = this._overlayRef.overlayElement.style;
    const parentStyles = this._overlayRef.hostElement.style;
    const config = this._overlayRef.getConfig();
    const {height, maxHeight} = config;
    const shouldBeFlushVertically = (height === '100%' || height === '100vh') &&
                                    (!maxHeight || maxHeight === '100%' || maxHeight === '100vh');

    if (shouldBeFlushVertically) {
      parentStyles.alignItems = 'flex-start';
      styles.marginTop = styles.marginBottom = '0';
      return;
    }

    switch (this._yPosition) {
      case 'top':
      case 'center':
        parentStyles.alignItems = this._yPosition === 'center' ? 'center' : 'flex-start';
        styles.marginTop = shouldBeFlushVertically ? '0' : this._yOffset;
        styles.marginBottom = '';
        break;

      case 'bottom':
        parentStyles.alignItems = 'flex-end';
        styles.marginTop = '';
        styles.marginBottom = shouldBeFlushVertically ? '0' : this._yOffset;
        break;

      default:
        throw Error(`Unsupported Y axis position ${this._yPosition}.`);
    }
  }

  private _applyXPosition() {
    const styles = this._overlayRef.overlayElement.style;
    const parentStyles = this._overlayRef.hostElement.style;
    const config = this._overlayRef.getConfig();
    const {width, maxWidth} = config;
    const isRtl = this._overlayRef.getConfig().direction === 'rtl';
    const shouldBeFlushHorizontally = (width === '100%' || width === '100vw') &&
                                      (!maxWidth || maxWidth === '100%' || maxWidth === '100vw');

    if (shouldBeFlushHorizontally) {
      parentStyles.justifyContent = 'flex-start';
      styles.marginLeft = styles.marginRight = '0';
      return;
    }

    switch (this._xPosition) {
      // In RTL the browser will invert `flex-start` and `flex-end` automatically, but we don't
      // want that if the positioning is explicitly `left` and `right`, hence why we do another
      // inversion to ensure that the overlay stays in the same position.
      case 'left':
        parentStyles.justifyContent = isRtl ? 'flex-end' : 'flex-start';
        styles.marginLeft = this._xOffset;
        styles.marginRight = '';
        break;

      case 'right':
        parentStyles.justifyContent = isRtl ? 'flex-start' : 'flex-end';
        styles.marginRight = this._xOffset;
        styles.marginLeft = '';
        break;

      case 'center':
        parentStyles.justifyContent = 'center';
        styles.marginLeft = isRtl ? '' : this._xOffset;
        styles.marginRight = isRtl ? this._xOffset : '';
        break;

      case 'start':
        parentStyles.justifyContent = 'flex-start';
        styles.marginLeft = isRtl ? '' : this._xOffset;
        styles.marginRight = isRtl ? this._xOffset : '';
        break;

      case 'end':
        parentStyles.justifyContent = 'flex-end';
        styles.marginLeft = isRtl ? this._xOffset : '';
        styles.marginRight = isRtl ? '' : this._xOffset;
        break;

      default:
        throw Error(`Unsupported X axis position ${this._xPosition}.`);
    }
  }

  /**
   * Cleans up the DOM changes from the position strategy.
   * @docs-private
   */
  dispose(): void {
    if (this._isDisposed || !this._overlayRef) {
      return;
    }

    const styles = this._overlayRef.overlayElement.style;
    const parent = this._overlayRef.hostElement;
    const parentStyles = parent.style;

    parent.classList.remove(wrapperClass);
    parentStyles.justifyContent = parentStyles.alignItems = styles.marginTop =
      styles.marginBottom = styles.marginLeft = styles.marginRight = styles.position = '';

    this._overlayRef = null!;
    this._isDisposed = true;
  }
}
