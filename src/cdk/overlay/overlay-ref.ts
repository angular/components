/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Direction} from '@angular/cdk/bidi';
import {ComponentPortal, Portal, PortalOutlet, TemplatePortal} from '@angular/cdk/portal';
import {ComponentRef, EmbeddedViewRef, NgZone} from '@angular/core';
import {Observable, Subject, empty} from 'rxjs';
import {take} from 'rxjs/operators';
import {OverlayKeyboardDispatcher} from './keyboard/overlay-keyboard-dispatcher';
import {OverlayConfig} from './overlay-config';
import {coerceCssPixelValue} from '@angular/cdk/coercion';
import {CdkOverlayBackdrop} from './backdrop';


/** An object where all of its properties cannot be written. */
export type ImmutableObject<T> = {
  readonly [P in keyof T]: T[P];
};

/**
 * Reference to an overlay that has been created with the Overlay service.
 * Used to manipulate or dispose of said overlay.
 */
export class OverlayRef implements PortalOutlet {
  private _backdropClick = new Subject<MouseEvent>();
  private _attachments = new Subject<void>();
  private _detachments = new Subject<void>();
  private _backdropInstance: CdkOverlayBackdrop | null;

  /** Stream of keydown events dispatched to this overlay. */
  _keydownEvents = new Subject<KeyboardEvent>();

  constructor(
      private _portalOutlet: PortalOutlet,
      private _host: HTMLElement,
      private _pane: HTMLElement,
      private _backdropHost: PortalOutlet | null,
      private _config: ImmutableObject<OverlayConfig>,
      private _ngZone: NgZone,
      private _keyboardDispatcher: OverlayKeyboardDispatcher) {

    if (_config.scrollStrategy) {
      _config.scrollStrategy.attach(this);
    }
  }

  /** The overlay's HTML element */
  get overlayElement(): HTMLElement {
    return this._pane;
  }

  /** The overlay's backdrop HTML element. */
  get backdropElement(): HTMLElement | null {
    return this._backdropInstance ? this._backdropInstance._element.nativeElement : null;
  }

  /**
   * Wrapper around the panel element. Can be used for advanced
   * positioning where a wrapper with specific styling is
   * required around the overlay pane.
   */
  get hostElement(): HTMLElement {
    return this._host;
  }

  attach<T>(portal: ComponentPortal<T>): ComponentRef<T>;
  attach<T>(portal: TemplatePortal<T>): EmbeddedViewRef<T>;
  attach(portal: any): any;

  /**
   * Attaches content, given via a Portal, to the overlay.
   * If the overlay is configured to have a backdrop, it will be created.
   *
   * @param portal Portal instance to which to attach the overlay.
   * @returns The portal attachment result.
   */
  attach(portal: Portal<any>): any {
    const attachResult = this._portalOutlet.attach(portal);

    if (this._config.positionStrategy) {
      this._config.positionStrategy.attach(this);
    }

    // Update the pane element with the given configuration.
    this._updateStackingOrder();
    this._updateElementSize();
    this._updateElementDirection();

    if (this._config.scrollStrategy) {
      this._config.scrollStrategy.enable();
    }

    // Update the position once the zone is stable so that the overlay will be fully rendered
    // before attempting to position it, as the position may depend on the size of the rendered
    // content.
    this._ngZone.onStable
      .asObservable()
      .pipe(take(1))
      .subscribe(() => {
        // The overlay could've been detached before the zone has stabilized.
        if (this.hasAttached()) {
          this.updatePosition();
        }
      });

    // Enable pointer events for the overlay pane element.
    this._togglePointerEvents(true);

    if (this._backdropHost) {
      this._backdropInstance =
          this._backdropHost.attach(new ComponentPortal(CdkOverlayBackdrop)).instance;
      this._backdropInstance!._setClass(this._config.backdropClass!);
    }

    if (this._config.panelClass) {
      // We can't do a spread here, because IE doesn't support setting multiple classes.
      if (Array.isArray(this._config.panelClass)) {
        this._config.panelClass.forEach(cssClass => this._pane.classList.add(cssClass));
      } else {
        this._pane.classList.add(this._config.panelClass);
      }
    }

    // Only emit the `attachments` event once all other setup is done.
    this._attachments.next();

    // Track this overlay by the keyboard dispatcher
    this._keyboardDispatcher.add(this);

    return attachResult;
  }

  /**
   * Detaches an overlay from a portal.
   * @returns The portal detachment result.
   */
  detach(): any {
    if (!this.hasAttached()) {
      return;
    }

    if (this._backdropHost && this._backdropHost.hasAttached()) {
      this._backdropHost.detach();
    }

    // When the overlay is detached, the pane element should disable pointer events.
    // This is necessary because otherwise the pane element will cover the page and disable
    // pointer events therefore. Depends on the position strategy and the applied pane boundaries.
    this._togglePointerEvents(false);

    if (this._config.positionStrategy && this._config.positionStrategy.detach) {
      this._config.positionStrategy.detach();
    }

    if (this._config.scrollStrategy) {
      this._config.scrollStrategy.disable();
    }

    const detachmentResult = this._portalOutlet.detach();

    // Only emit after everything is detached.
    this._detachments.next();

    // Remove this overlay from keyboard dispatcher tracking
    this._keyboardDispatcher.remove(this);

    return detachmentResult;
  }

  /** Cleans up the overlay from the DOM. */
  dispose(): void {
    const isAttached = this.hasAttached();

    if (this._config.positionStrategy) {
      this._config.positionStrategy.dispose();
    }

    if (this._config.scrollStrategy) {
      this._config.scrollStrategy.disable();
    }

    this.disposeBackdrop();
    this._keyboardDispatcher.remove(this);
    this._portalOutlet.dispose();
    this._attachments.complete();
    this._backdropClick.complete();
    this._keydownEvents.complete();

    if (this._host && this._host.parentNode) {
      this._host.parentNode.removeChild(this._host);
      this._host = null!;
    }

    if (isAttached) {
      this._detachments.next();
    }

    this._detachments.complete();
  }

  /** Whether the overlay has attached content. */
  hasAttached(): boolean {
    return this._portalOutlet.hasAttached();
  }

  /** Gets an observable that emits when the backdrop has been clicked. */
  backdropClick(): Observable<MouseEvent> {
    return this._backdropInstance ? this._backdropInstance._clickStream : empty();
  }

  /** Gets an observable that emits when the overlay has been attached. */
  attachments(): Observable<void> {
    return this._attachments.asObservable();
  }

  /** Gets an observable that emits when the overlay has been detached. */
  detachments(): Observable<void> {
    return this._detachments.asObservable();
  }

  /** Gets an observable of keydown events targeted to this overlay. */
  keydownEvents(): Observable<KeyboardEvent> {
    return this._keydownEvents.asObservable();
  }

  /** Gets the the current overlay configuration, which is immutable. */
  getConfig(): OverlayConfig {
    return this._config;
  }

  /** Updates the position of the overlay based on the position strategy. */
  updatePosition() {
    if (this._config.positionStrategy) {
      this._config.positionStrategy.apply();
    }
  }

  /** Update the size properties of the overlay. */
  updateSize(sizeConfig: OverlaySizeConfig) {
    this._config = {...this._config, ...sizeConfig};
    this._updateElementSize();
  }

  /** Sets the LTR/RTL direction for the overlay. */
  setDirection(dir: Direction) {
    this._config = {...this._config, direction: dir};
    this._updateElementDirection();
  }

  /** Updates the text direction of the overlay panel. */
  private _updateElementDirection() {
    this._pane.setAttribute('dir', this._config.direction!);
  }

  /** Updates the size of the overlay element based on the overlay config. */
  private _updateElementSize() {
    if (this._config.width || this._config.width === 0) {
      this._pane.style.width = coerceCssPixelValue(this._config.width);
    }

    if (this._config.height || this._config.height === 0) {
      this._pane.style.height = coerceCssPixelValue(this._config.height);
    }

    if (this._config.minWidth || this._config.minWidth === 0) {
      this._pane.style.minWidth = coerceCssPixelValue(this._config.minWidth);
    }

    if (this._config.minHeight || this._config.minHeight === 0) {
      this._pane.style.minHeight = coerceCssPixelValue(this._config.minHeight);
    }

    if (this._config.maxWidth || this._config.maxWidth === 0) {
      this._pane.style.maxWidth = coerceCssPixelValue(this._config.maxWidth);
    }

    if (this._config.maxHeight || this._config.maxHeight === 0) {
      this._pane.style.maxHeight = coerceCssPixelValue(this._config.maxHeight);
    }
  }

  /** Toggles the pointer events for the overlay pane element. */
  private _togglePointerEvents(enablePointer: boolean) {
    this._pane.style.pointerEvents = enablePointer ? 'auto' : 'none';
  }

  /**
   * Updates the stacking order of the element, moving it to the top if necessary.
   * This is required in cases where one overlay was detached, while another one,
   * that should be behind it, was destroyed. The next time both of them are opened,
   * the stacking will be wrong, because the detached element's pane will still be
   * in its original DOM position.
   */
  private _updateStackingOrder() {
    if (this._host.nextSibling) {
      this._host.parentNode!.appendChild(this._host);
    }
  }

  /** Animates out and disposes of the backdrop. */
  disposeBackdrop(): void {
    if (this._backdropHost) {
      if (this._backdropHost.hasAttached()) {
        this._backdropHost.detach();

        this._backdropInstance!._animationStream.pipe(take(1)).subscribe(() => {
          this._backdropHost!.dispose();
          this._backdropHost = this._backdropInstance = null;
        });
      } else {
        this._backdropHost.dispose();
      }
    }
  }

  /**
   * Detaches the backdrop (if any) associated with the overlay.
   * @deprecated Use `disposeBackdrop` instead.
   * @deletion-target 7.0.0
   */
  detachBackdrop(): void {
    this.disposeBackdrop();
  }
}


/** Size properties for an overlay. */
export interface OverlaySizeConfig {
  width?: number | string;
  height?: number | string;
  minWidth?: number | string;
  minHeight?: number | string;
  maxWidth?: number | string;
  maxHeight?: number | string;
}
