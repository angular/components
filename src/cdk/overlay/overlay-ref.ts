/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Direction, Directionality} from '@angular/cdk/bidi';
import {ComponentPortal, Portal, PortalOutlet, TemplatePortal} from '@angular/cdk/portal';
import {
  AfterRenderRef,
  ComponentRef,
  EmbeddedViewRef,
  EnvironmentInjector,
  NgZone,
  Renderer2,
  afterNextRender,
  afterRender,
  untracked,
} from '@angular/core';
import {Location} from '@angular/common';
import {Observable, Subject, merge, SubscriptionLike, Subscription} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {OverlayKeyboardDispatcher} from './dispatchers/overlay-keyboard-dispatcher';
import {OverlayOutsideClickDispatcher} from './dispatchers/overlay-outside-click-dispatcher';
import {OverlayConfig} from './overlay-config';
import {coerceCssPixelValue, coerceArray} from '@angular/cdk/coercion';
import {PositionStrategy} from './position/position-strategy';
import {ScrollStrategy} from './scroll';

/** An object where all of its properties cannot be written. */
export type ImmutableObject<T> = {
  readonly [P in keyof T]: T[P];
};

/**
 * Reference to an overlay that has been created with the Overlay service.
 * Used to manipulate or dispose of said overlay.
 */
export class OverlayRef implements PortalOutlet {
  private _backdropElement: HTMLElement | null = null;
  private _backdropTimeout: ReturnType<typeof setTimeout> | undefined;
  private readonly _backdropClick = new Subject<MouseEvent>();
  private readonly _attachments = new Subject<void>();
  private readonly _detachments = new Subject<void>();
  private _positionStrategy: PositionStrategy | undefined;
  private _scrollStrategy: ScrollStrategy | undefined;
  private _locationChanges: SubscriptionLike = Subscription.EMPTY;
  private _cleanupBackdropClick: (() => void) | undefined;
  private _cleanupBackdropTransitionEnd: (() => void) | undefined;

  /**
   * Reference to the parent of the `_host` at the time it was detached. Used to restore
   * the `_host` to its original position in the DOM when it gets re-attached.
   */
  private _previousHostParent: HTMLElement;

  /** Stream of keydown events dispatched to this overlay. */
  readonly _keydownEvents = new Subject<KeyboardEvent>();

  /** Stream of mouse outside events dispatched to this overlay. */
  readonly _outsidePointerEvents = new Subject<MouseEvent>();

  private _renders = new Subject<void>();

  private _afterRenderRef: AfterRenderRef;

  /** Reference to the currently-running `afterNextRender` call. */
  private _afterNextRenderRef: AfterRenderRef | undefined;

  constructor(
    private _portalOutlet: PortalOutlet,
    private _host: HTMLElement,
    private _pane: HTMLElement,
    private _config: ImmutableObject<OverlayConfig>,
    private _ngZone: NgZone,
    private _keyboardDispatcher: OverlayKeyboardDispatcher,
    private _document: Document,
    private _location: Location,
    private _outsideClickDispatcher: OverlayOutsideClickDispatcher,
    private _animationsDisabled = false,
    private _injector: EnvironmentInjector,
    private _renderer: Renderer2,
  ) {
    if (_config.scrollStrategy) {
      this._scrollStrategy = _config.scrollStrategy;
      this._scrollStrategy.attach(this);
    }

    this._positionStrategy = _config.positionStrategy;

    // Users could open the overlay from an `effect`, in which case we need to
    // run the `afterRender` as `untracked`. We don't recommend that users do
    // this, but we also don't want to break users who are doing it.
    this._afterRenderRef = untracked(() =>
      afterRender(
        () => {
          this._renders.next();
        },
        {injector: this._injector},
      ),
    );
  }

  /** The overlay's HTML element */
  get overlayElement(): HTMLElement {
    return this._pane;
  }

  /** The overlay's backdrop HTML element. */
  get backdropElement(): HTMLElement | null {
    return this._backdropElement;
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
    // Insert the host into the DOM before attaching the portal, otherwise
    // the animations module will skip animations on repeat attachments.
    if (!this._host.parentElement && this._previousHostParent) {
      this._previousHostParent.appendChild(this._host);
    }

    const attachResult = this._portalOutlet.attach(portal);

    if (this._positionStrategy) {
      this._positionStrategy.attach(this);
    }

    this._updateStackingOrder();
    this._updateElementSize();
    this._updateElementDirection();

    if (this._scrollStrategy) {
      this._scrollStrategy.enable();
    }

    // We need to clean this up ourselves, because we're passing in an
    // `EnvironmentInjector` below which won't ever be destroyed.
    // Otherwise it causes some callbacks to be retained (see #29696).
    this._afterNextRenderRef?.destroy();

    // Update the position once the overlay is fully rendered before attempting to position it,
    // as the position may depend on the size of the rendered content.
    this._afterNextRenderRef = afterNextRender(
      () => {
        // The overlay could've been detached before the callback executed.
        if (this.hasAttached()) {
          this.updatePosition();
        }
      },
      {injector: this._injector},
    );

    // Enable pointer events for the overlay pane element.
    this._togglePointerEvents(true);

    if (this._config.hasBackdrop) {
      this._attachBackdrop();
    }

    if (this._config.panelClass) {
      this._toggleClasses(this._pane, this._config.panelClass, true);
    }

    // Only emit the `attachments` event once all other setup is done.
    this._attachments.next();

    // Track this overlay by the keyboard dispatcher
    this._keyboardDispatcher.add(this);

    if (this._config.disposeOnNavigation) {
      this._locationChanges = this._location.subscribe(() => this.dispose());
    }

    this._outsideClickDispatcher.add(this);

    // TODO(crisbeto): the null check is here, because the portal outlet returns `any`.
    // We should be guaranteed for the result to be `ComponentRef | EmbeddedViewRef`, but
    // `instanceof EmbeddedViewRef` doesn't appear to work at the moment.
    if (typeof attachResult?.onDestroy === 'function') {
      // In most cases we control the portal and we know when it is being detached so that
      // we can finish the disposal process. The exception is if the user passes in a custom
      // `ViewContainerRef` that isn't destroyed through the overlay API. Note that we use
      // `detach` here instead of `dispose`, because we don't know if the user intends to
      // reattach the overlay at a later point. It also has the advantage of waiting for animations.
      attachResult.onDestroy(() => {
        if (this.hasAttached()) {
          // We have to delay the `detach` call, because detaching immediately prevents
          // other destroy hooks from running. This is likely a framework bug similar to
          // https://github.com/angular/angular/issues/46119
          this._ngZone.runOutsideAngular(() => Promise.resolve().then(() => this.detach()));
        }
      });
    }

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

    this.detachBackdrop();

    // When the overlay is detached, the pane element should disable pointer events.
    // This is necessary because otherwise the pane element will cover the page and disable
    // pointer events therefore. Depends on the position strategy and the applied pane boundaries.
    this._togglePointerEvents(false);

    if (this._positionStrategy && this._positionStrategy.detach) {
      this._positionStrategy.detach();
    }

    if (this._scrollStrategy) {
      this._scrollStrategy.disable();
    }

    const detachmentResult = this._portalOutlet.detach();

    // Only emit after everything is detached.
    this._detachments.next();

    // Remove this overlay from keyboard dispatcher tracking.
    this._keyboardDispatcher.remove(this);

    // Keeping the host element in the DOM can cause scroll jank, because it still gets
    // rendered, even though it's transparent and unclickable which is why we remove it.
    this._detachContentWhenEmpty();
    this._locationChanges.unsubscribe();
    this._outsideClickDispatcher.remove(this);
    return detachmentResult;
  }

  /** Cleans up the overlay from the DOM. */
  dispose(): void {
    const isAttached = this.hasAttached();

    if (this._positionStrategy) {
      this._positionStrategy.dispose();
    }

    this._disposeScrollStrategy();
    this._disposeBackdrop(this._backdropElement);
    this._locationChanges.unsubscribe();
    this._keyboardDispatcher.remove(this);
    this._portalOutlet.dispose();
    this._attachments.complete();
    this._backdropClick.complete();
    this._keydownEvents.complete();
    this._outsidePointerEvents.complete();
    this._outsideClickDispatcher.remove(this);
    this._host?.remove();
    this._afterNextRenderRef?.destroy();

    this._previousHostParent = this._pane = this._host = null!;

    if (isAttached) {
      this._detachments.next();
    }

    this._detachments.complete();
    this._afterRenderRef.destroy();
    this._renders.complete();
  }

  /** Whether the overlay has attached content. */
  hasAttached(): boolean {
    return this._portalOutlet.hasAttached();
  }

  /** Gets an observable that emits when the backdrop has been clicked. */
  backdropClick(): Observable<MouseEvent> {
    return this._backdropClick;
  }

  /** Gets an observable that emits when the overlay has been attached. */
  attachments(): Observable<void> {
    return this._attachments;
  }

  /** Gets an observable that emits when the overlay has been detached. */
  detachments(): Observable<void> {
    return this._detachments;
  }

  /** Gets an observable of keydown events targeted to this overlay. */
  keydownEvents(): Observable<KeyboardEvent> {
    return this._keydownEvents;
  }

  /** Gets an observable of pointer events targeted outside this overlay. */
  outsidePointerEvents(): Observable<MouseEvent> {
    return this._outsidePointerEvents;
  }

  /** Gets the current overlay configuration, which is immutable. */
  getConfig(): OverlayConfig {
    return this._config;
  }

  /** Updates the position of the overlay based on the position strategy. */
  updatePosition(): void {
    if (this._positionStrategy) {
      this._positionStrategy.apply();
    }
  }

  /** Switches to a new position strategy and updates the overlay position. */
  updatePositionStrategy(strategy: PositionStrategy): void {
    if (strategy === this._positionStrategy) {
      return;
    }

    if (this._positionStrategy) {
      this._positionStrategy.dispose();
    }

    this._positionStrategy = strategy;

    if (this.hasAttached()) {
      strategy.attach(this);
      this.updatePosition();
    }
  }

  /** Update the size properties of the overlay. */
  updateSize(sizeConfig: OverlaySizeConfig): void {
    this._config = {...this._config, ...sizeConfig};
    this._updateElementSize();
  }

  /** Sets the LTR/RTL direction for the overlay. */
  setDirection(dir: Direction | Directionality): void {
    this._config = {...this._config, direction: dir};
    this._updateElementDirection();
  }

  /** Add a CSS class or an array of classes to the overlay pane. */
  addPanelClass(classes: string | string[]): void {
    if (this._pane) {
      this._toggleClasses(this._pane, classes, true);
    }
  }

  /** Remove a CSS class or an array of classes from the overlay pane. */
  removePanelClass(classes: string | string[]): void {
    if (this._pane) {
      this._toggleClasses(this._pane, classes, false);
    }
  }

  /**
   * Returns the layout direction of the overlay panel.
   */
  getDirection(): Direction {
    const direction = this._config.direction;

    if (!direction) {
      return 'ltr';
    }

    return typeof direction === 'string' ? direction : direction.value;
  }

  /** Switches to a new scroll strategy. */
  updateScrollStrategy(strategy: ScrollStrategy): void {
    if (strategy === this._scrollStrategy) {
      return;
    }

    this._disposeScrollStrategy();
    this._scrollStrategy = strategy;

    if (this.hasAttached()) {
      strategy.attach(this);
      strategy.enable();
    }
  }

  /** Updates the text direction of the overlay panel. */
  private _updateElementDirection() {
    this._host.setAttribute('dir', this.getDirection());
  }

  /** Updates the size of the overlay element based on the overlay config. */
  private _updateElementSize() {
    if (!this._pane) {
      return;
    }

    const style = this._pane.style;

    style.width = coerceCssPixelValue(this._config.width);
    style.height = coerceCssPixelValue(this._config.height);
    style.minWidth = coerceCssPixelValue(this._config.minWidth);
    style.minHeight = coerceCssPixelValue(this._config.minHeight);
    style.maxWidth = coerceCssPixelValue(this._config.maxWidth);
    style.maxHeight = coerceCssPixelValue(this._config.maxHeight);
  }

  /** Toggles the pointer events for the overlay pane element. */
  private _togglePointerEvents(enablePointer: boolean) {
    this._pane.style.pointerEvents = enablePointer ? '' : 'none';
  }

  /** Attaches a backdrop for this overlay. */
  private _attachBackdrop() {
    const showingClass = 'cdk-overlay-backdrop-showing';

    this._backdropElement = this._document.createElement('div');
    this._backdropElement.classList.add('cdk-overlay-backdrop');

    if (this._animationsDisabled) {
      this._backdropElement.classList.add('cdk-overlay-backdrop-noop-animation');
    }

    if (this._config.backdropClass) {
      this._toggleClasses(this._backdropElement, this._config.backdropClass, true);
    }

    // Insert the backdrop before the pane in the DOM order,
    // in order to handle stacked overlays properly.
    this._host.parentElement!.insertBefore(this._backdropElement, this._host);

    // Forward backdrop clicks such that the consumer of the overlay can perform whatever
    // action desired when such a click occurs (usually closing the overlay).
    this._cleanupBackdropClick?.();
    this._cleanupBackdropClick = this._renderer.listen(
      this._backdropElement,
      'click',
      (event: MouseEvent) => this._backdropClick.next(event),
    );

    // Add class to fade-in the backdrop after one frame.
    if (!this._animationsDisabled && typeof requestAnimationFrame !== 'undefined') {
      this._ngZone.runOutsideAngular(() => {
        requestAnimationFrame(() => {
          if (this._backdropElement) {
            this._backdropElement.classList.add(showingClass);
          }
        });
      });
    } else {
      this._backdropElement.classList.add(showingClass);
    }
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

  /** Detaches the backdrop (if any) associated with the overlay. */
  detachBackdrop(): void {
    const backdropToDetach = this._backdropElement;

    if (!backdropToDetach) {
      return;
    }

    if (this._animationsDisabled) {
      this._disposeBackdrop(backdropToDetach);
      return;
    }

    backdropToDetach.classList.remove('cdk-overlay-backdrop-showing');

    this._ngZone.runOutsideAngular(() => {
      this._cleanupBackdropTransitionEnd?.();
      this._cleanupBackdropTransitionEnd = this._renderer.listen(
        backdropToDetach,
        'transitionend',
        (event: TransitionEvent) => {
          this._disposeBackdrop(event.target as HTMLElement | null);
        },
      );
    });

    // If the backdrop doesn't have a transition, the `transitionend` event won't fire.
    // In this case we make it unclickable and we try to remove it after a delay.
    backdropToDetach.style.pointerEvents = 'none';

    // Run this outside the Angular zone because there's nothing that Angular cares about.
    // If it were to run inside the Angular zone, every test that used Overlay would have to be
    // either async or fakeAsync.
    this._backdropTimeout = this._ngZone.runOutsideAngular(() =>
      setTimeout(() => {
        this._disposeBackdrop(backdropToDetach);
      }, 500),
    );
  }

  /** Toggles a single CSS class or an array of classes on an element. */
  private _toggleClasses(element: HTMLElement, cssClasses: string | string[], isAdd: boolean) {
    const classes = coerceArray(cssClasses || []).filter(c => !!c);

    if (classes.length) {
      isAdd ? element.classList.add(...classes) : element.classList.remove(...classes);
    }
  }

  /** Detaches the overlay content next time the zone stabilizes. */
  private _detachContentWhenEmpty() {
    // Normally we wouldn't have to explicitly run this outside the `NgZone`, however
    // if the consumer is using `zone-patch-rxjs`, the `Subscription.unsubscribe` call will
    // be patched to run inside the zone, which will throw us into an infinite loop.
    this._ngZone.runOutsideAngular(() => {
      // We can't remove the host here immediately, because the overlay pane's content
      // might still be animating. This stream helps us avoid interrupting the animation
      // by waiting for the pane to become empty.
      const subscription = this._renders
        .pipe(takeUntil(merge(this._attachments, this._detachments)))
        .subscribe(() => {
          // Needs a couple of checks for the pane and host, because
          // they may have been removed by the time the zone stabilizes.
          if (!this._pane || !this._host || this._pane.children.length === 0) {
            if (this._pane && this._config.panelClass) {
              this._toggleClasses(this._pane, this._config.panelClass, false);
            }

            if (this._host && this._host.parentElement) {
              this._previousHostParent = this._host.parentElement;
              this._host.remove();
            }

            subscription.unsubscribe();
          }
        });
    });
  }

  /** Disposes of a scroll strategy. */
  private _disposeScrollStrategy() {
    const scrollStrategy = this._scrollStrategy;

    if (scrollStrategy) {
      scrollStrategy.disable();

      if (scrollStrategy.detach) {
        scrollStrategy.detach();
      }
    }
  }

  /** Removes a backdrop element from the DOM. */
  private _disposeBackdrop(backdrop: HTMLElement | null) {
    this._cleanupBackdropClick?.();
    this._cleanupBackdropTransitionEnd?.();

    if (backdrop) {
      backdrop.remove();

      // It is possible that a new portal has been attached to this overlay since we started
      // removing the backdrop. If that is the case, only clear the backdrop reference if it
      // is still the same instance that we started to remove.
      if (this._backdropElement === backdrop) {
        this._backdropElement = null;
      }
    }

    if (this._backdropTimeout) {
      clearTimeout(this._backdropTimeout);
      this._backdropTimeout = undefined;
    }
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
