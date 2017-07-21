/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Directive,
  ElementRef,
  Inject,
  InjectionToken,
  Input,
  NgZone,
  OnDestroy,
  Optional,
  Renderer2,
  ViewContainerRef,
  ViewEncapsulation
} from '@angular/core';
import {animate, AnimationEvent, state, style, transition, trigger} from '@angular/animations';
import {
  ComponentPortal,
  OriginConnectionPosition,
  Overlay,
  OverlayConnectionPosition,
  OverlayRef,
  OverlayState,
  RepositionScrollStrategy,
  ScrollStrategy
} from '../core';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {Directionality} from '../core/bidi/index';
import {Platform} from '../core/platform/index';
import {first} from '../core/rxjs/index';
import {ScrollDispatcher} from '../core/overlay/scroll/scroll-dispatcher';
import {coerceBooleanProperty} from '@angular/cdk';
import {ESCAPE} from '../core/keyboard/keycodes';

export type TooltipPosition = 'left' | 'right' | 'above' | 'below' | 'before' | 'after';

/** Time in ms to delay before changing the tooltip visibility to hidden */
export const TOUCHEND_HIDE_DELAY = 1500;

/** Time in ms to throttle repositioning after scroll events. */
export const SCROLL_THROTTLE_MS = 20;

/** CSS class that will be attached to the overlay panel. */
export const TOOLTIP_PANEL_CLASS = 'mat-tooltip-panel';

/** Creates an error to be thrown if the user supplied an invalid tooltip position. */
export function getMdTooltipInvalidPositionError(position: string) {
  return Error(`Tooltip position "${position}" is invalid.`);
}

/** Injection token that determines the scroll handling while a tooltip is visible. */
export const MD_TOOLTIP_SCROLL_STRATEGY =
    new InjectionToken<() => ScrollStrategy>('md-tooltip-scroll-strategy');

/** @docs-private */
export function MD_TOOLTIP_SCROLL_STRATEGY_PROVIDER_FACTORY(overlay: Overlay) {
  return () => overlay.scrollStrategies.reposition({ scrollThrottle: SCROLL_THROTTLE_MS });
}

/** @docs-private */
export const MD_TOOLTIP_SCROLL_STRATEGY_PROVIDER = {
  provide: MD_TOOLTIP_SCROLL_STRATEGY,
  deps: [Overlay],
  useFactory: MD_TOOLTIP_SCROLL_STRATEGY_PROVIDER_FACTORY
};


/**
 * Directive that attaches a material design tooltip to the host element. Animates the showing and
 * hiding of a tooltip provided position (defaults to below the element).
 *
 * https://material.google.com/components/tooltips.html
 */
@Directive({
  selector: '[md-tooltip], [mdTooltip], [mat-tooltip], [matTooltip]',
  host: {
    '(longpress)': 'show()',
    '(focus)': 'show()',
    '(blur)': 'hide(0)',
    '(keydown)': '_handleKeydown($event)',
    '(touchend)': 'hide(' + TOUCHEND_HIDE_DELAY + ')',
  },
  exportAs: 'mdTooltip',
})
export class MdTooltip implements OnDestroy {
  /** Reference to the overlay containing the tooltip component */
  _overlayRef: OverlayRef | null;

  /** Instance of the tooltip component that contains the tooltip content. */
  _tooltipInstance: TooltipComponent | null;

  /** Strategy used to reposition the tooltip. Used for enabling/disabling while shown/hidden. */
  _scrollStrategy: RepositionScrollStrategy | null;

  private _position: TooltipPosition = 'below';
  private _tooltipClass: string|string[]|Set<string>|{[key: string]: any};

  /** Allows the user to define the position of the tooltip relative to the parent element */
  @Input('mdTooltipPosition')
  get position(): TooltipPosition { return this._position; }
  set position(value: TooltipPosition) {
    if (value !== this._position) {
      this._position = value;

      // TODO(andrewjs): When the overlay's position can be dynamically changed, do not destroy
      // the tooltip.
      if (this._tooltipInstance) {
        this._disposeTooltip();
        this._createTooltip();
      }
    }
  }

  /** Disables the display of the tooltip. */
  @Input('mdTooltipDisabled')
  get disabled(): boolean { return this._disabled; }
  set disabled(value) {
    this._disabled = coerceBooleanProperty(value);

    // If tooltip is disabled, hide immediately.
    if (this._disabled) {
      this.hide(0);
    }
  }
  private _disabled: boolean = false;

  /** @deprecated */
  @Input('tooltip-position')
  get _positionDeprecated(): TooltipPosition { return this._position; }
  set _positionDeprecated(value: TooltipPosition) { this._position = value; }

  /** The default delay in ms before showing the tooltip after show is called */
  @Input('mdTooltipShowDelay') showDelay = 0;

  /** The default delay in ms before hiding the tooltip after hide is called */
  @Input('mdTooltipHideDelay') hideDelay = 0;

  private _message: string;

  /** The message to be displayed in the tooltip */
  @Input('mdTooltip') get message() { return this._message; }
  set message(value: string) {
    this._message = value;
    if (this._tooltipInstance) {
      this._setTooltipMessage(this._message);
    }
  }

  /** Classes to be passed to the tooltip. Supports the same syntax as `ngClass`. */
  @Input('mdTooltipClass')
  get tooltipClass() { return this._tooltipClass; }
  set tooltipClass(value: string|string[]|Set<string>|{[key: string]: any}) {
    this._tooltipClass = value;
    if (this._tooltipInstance) {
      this._setTooltipClass(this._tooltipClass);
    }
  }

  /** @deprecated */
  @Input('md-tooltip')
  get _deprecatedMessage(): string { return this.message; }
  set _deprecatedMessage(v: string) { this.message = v; }

  // Properties with `mat-` prefix for noconflict mode.
  @Input('matTooltip')
  get _matMessage() { return this.message; }
  set _matMessage(v) { this.message = v; }

  // Properties with `mat-` prefix for noconflict mode.
  @Input('matTooltipPosition')
  get _matPosition() { return this.position; }
  set _matPosition(v) { this.position = v; }

  // Properties with `mat-` prefix for noconflict mode.
  @Input('matTooltipDisabled')
  get _matDisabled() { return this.disabled; }
  set _matDisabled(v) { this.disabled = v; }

  // Properties with `mat-` prefix for noconflict mode.
  @Input('matTooltipHideDelay')
  get _matHideDelay() { return this.hideDelay; }
  set _matHideDelay(v) { this.hideDelay = v; }

  // Properties with `mat-` prefix for noconflict mode.
  @Input('matTooltipShowDelay')
  get _matShowDelay() { return this.showDelay; }
  set _matShowDelay(v) { this.showDelay = v; }

  // Properties with `mat-` prefix for nonconflict mode.
  @Input('matTooltipClass')
  get _matClass() { return this.tooltipClass; }
  set _matClass(v) { this.tooltipClass = v; }

  private _enterListener: Function;
  private _leaveListener: Function;

  constructor(
      private _overlay: Overlay,
      private _elementRef: ElementRef,
      private _scrollDispatcher: ScrollDispatcher,
      private _viewContainerRef: ViewContainerRef,
      private _ngZone: NgZone,
      private _renderer: Renderer2,
      private _platform: Platform,
      @Optional() private _dir: Directionality,
      @Inject(MD_TOOLTIP_SCROLL_STRATEGY) private _scrollStrategyProvider) {
    // The mouse events shouldn't be bound on iOS devices, because
    // they can prevent the first tap from firing its click event.
    if (!_platform.IOS) {
      this._enterListener =
        _renderer.listen(_elementRef.nativeElement, 'mouseenter', () => this.show());
      this._leaveListener =
        _renderer.listen(_elementRef.nativeElement, 'mouseleave', () => this.hide());
    }
  }

  /**
   * Create the tooltip after init. The tooltip should be in the DOM ready to be displayed so that
   * screen readers immediately have a reference to the tooltip content.
   */
  ngOnInit() {
    // Only create the tooltip if we are on the browser platform
    if (this._platform.isBrowser) {
      this._createTooltip();
    }
  }

  ngOnDestroy() {
    this._disposeTooltip();

    // Clean up the event listeners set in the constructor
    if (!this._platform.IOS) {
      this._enterListener();
      this._leaveListener();
    }
  }

  /** Shows the tooltip after the delay in ms, defaults to tooltip-delay-show or 0ms if no input */
  show(delay: number = this.showDelay): void {
    if (this.disabled || !this._message || !this._message.trim()) { return; }

    this._scrollStrategy!.enable();
    this._tooltipInstance!.show(this._position, delay);
    this._overlayRef!.overlayElement.classList.remove('cdk-visually-hidden');
    this._overlayRef!.updatePosition();
  }

  /** Hides the tooltip after the delay in ms, defaults to tooltip-delay-hide or 0ms if no input */
  hide(delay: number = this.hideDelay): void {
    this._tooltipInstance!.hide(delay);
  }

  /** Shows/hides the tooltip */
  toggle(): void {
    this._isTooltipVisible() ? this.hide() : this.show();
  }

  /** Returns true if the tooltip is currently visible to the user */
  _isTooltipVisible(): boolean {
    return this._tooltipInstance!.isVisible();
  }

  /** Handles the keydown events on the host element. */
  _handleKeydown(e: KeyboardEvent) {
    if (this._tooltipInstance!.isVisible() && e.keyCode === ESCAPE) {
      e.stopPropagation();
      this.hide(0);
    }
  }

  /** Returns the trigger's aria-describedby attribute. */
  private _getAriaDescribedby(): string {
    return this._elementRef.nativeElement.getAttribute('aria-describedby');
  }

  /** Sets the trigger's aria-describedby attribute. */
  private _setAriaDescribedBy(describedBy: string) {
    this._renderer.setAttribute(this._elementRef.nativeElement, 'aria-describedby', describedBy);
  }

  /**
   * Create the tooltip to display. Uses the trigger's view container reference and should not be
   * called within the change detection after the view has already been checked.
   */
  private _createTooltip(): void {
    let portal = new ComponentPortal(TooltipComponent, this._viewContainerRef);
    this._overlayRef = this._createTooltipOverlay();
    this._tooltipInstance = this._overlayRef.attach(portal).instance;

    // Hide the overlay since the tooltip is not yet shown to the user.
    this._hideOverlay();

    // If the user has not already set an aria-describedby, then use the tooltip's id.
    if (!this._getAriaDescribedby() && this._tooltipInstance) {
      this._setAriaDescribedBy(this._tooltipInstance.id);
    }

    this._tooltipInstance!.afterHidden().subscribe(() => {
      // After the tooltip is hidden, hide the overlay so that it does not block interaction
      // with nearby existing elements.
      this._hideOverlay();
    });

    this._setTooltipClass(this._tooltipClass);
    this._setTooltipMessage(this._message);
  }

  /** Returns a newly created overlay with a position strategy suited for the tooltip. */
  private _createTooltipOverlay(): OverlayRef {
    let origin = this._getOrigin();
    let position = this._getOverlayPosition();

    // Create connected position strategy that listens for scroll events to reposition.
    // After position changes occur and the overlay is clipped by a parent scrollable then
    // close the tooltip.
    let strategy = this._overlay.position().connectedTo(this._elementRef, origin, position);
    strategy.withScrollableContainers(this._scrollDispatcher.getScrollContainers(this._elementRef));
    strategy.onPositionChange.subscribe(change => {
      if (change.scrollableViewProperties.isOverlayClipped && this._tooltipInstance &&
          this._tooltipInstance.isVisible()) {
        this.hide(0);
      }
    });

    let config = new OverlayState();

    config.direction = this._dir ? this._dir.value : 'ltr';
    config.positionStrategy = strategy;
    config.panelClass = TOOLTIP_PANEL_CLASS;

    this._scrollStrategy = this._scrollStrategyProvider();
    config.scrollStrategy = this._scrollStrategy!;

    return this._overlay.create(config);
  }

  /** Visually hides the overlay and disables the scrolling strategy. */
  private _hideOverlay(): void {
    // Check if the overlay and scroll strategy are not null since this may be called after
    // the tooltip is disposed.
    if (this._overlayRef) {
      this._overlayRef.overlayElement.classList.add('cdk-visually-hidden');
    }

    if (this._scrollStrategy) {
      this._scrollStrategy.disable();
    }
  }

  /** Disposes the current tooltip and the overlay it is attached to */
  private _disposeTooltip(): void {
    if (this._overlayRef) {
      this._overlayRef!.dispose();
      this._overlayRef = null;
    }

    if (this._scrollStrategy) {
      this._scrollStrategy!.disable();
      this._scrollStrategy = null;
    }

    // If the aria-describedby was set to the tooltip (e.g. not user-defined), then remove it.
    if (this._tooltipInstance && this._getAriaDescribedby() == this._tooltipInstance!.id) {
      this._setAriaDescribedBy('');
    }

    this._tooltipInstance = null;
  }

  /** Returns the origin position based on the user's position preference */
  _getOrigin(): OriginConnectionPosition {
    if (this.position == 'above' || this.position == 'below') {
      return {originX: 'center', originY: this.position == 'above' ? 'top' : 'bottom'};
    }

    const isDirectionLtr = !this._dir || this._dir.value == 'ltr';
    if (this.position == 'left' ||
        this.position == 'before' && isDirectionLtr ||
        this.position == 'after' && !isDirectionLtr) {
      return {originX: 'start', originY: 'center'};
    }

    if (this.position == 'right' ||
        this.position == 'after' && isDirectionLtr ||
        this.position == 'before' && !isDirectionLtr) {
      return {originX: 'end', originY: 'center'};
    }

    throw getMdTooltipInvalidPositionError(this.position);
  }

  /** Returns the overlay position based on the user's preference */
  _getOverlayPosition(): OverlayConnectionPosition {
    if (this.position == 'above') {
      return {overlayX: 'center', overlayY: 'bottom'};
    }

    if (this.position == 'below') {
      return {overlayX: 'center', overlayY: 'top'};
    }

    const isLtr = !this._dir || this._dir.value == 'ltr';
    if (this.position == 'left' ||
        this.position == 'before' && isLtr ||
        this.position == 'after' && !isLtr) {
      return {overlayX: 'end', overlayY: 'center'};
    }

    if (this.position == 'right' ||
        this.position == 'after' && isLtr ||
        this.position == 'before' && !isLtr) {
      return {overlayX: 'start', overlayY: 'center'};
    }

    throw getMdTooltipInvalidPositionError(this.position);
  }

  /** Updates the tooltip message and repositions the overlay according to the new message length */
  private _setTooltipMessage(message: string) {
    // Must wait for the message to be painted to the tooltip so that the overlay can properly
    // calculate the correct positioning based on the size of the text.
    this._tooltipInstance!.message = message;
    this._tooltipInstance!._markForCheck();

    first.call(this._ngZone.onMicrotaskEmpty).subscribe(() => {
      if (this._overlayRef) {
        this._overlayRef!.updatePosition();
      }
    });
  }

  /** Updates the tooltip class */
  private _setTooltipClass(tooltipClass: string|string[]|Set<string>|{[key: string]: any}) {
    this._tooltipInstance!.tooltipClass = tooltipClass;
    this._tooltipInstance!._markForCheck();
  }
}

export type TooltipVisibility = 'initial' | 'visible' | 'hidden';

/** Tooltip IDs need to be unique, so this counter exists outside of the component definition. */
let _uniqueTooltipIdCounter = 0;

/**
 * Internal component that wraps the tooltip's content.
 * @docs-private
 */
@Component({
  moduleId: module.id,
  selector: 'md-tooltip-component, mat-tooltip-component',
  templateUrl: 'tooltip.html',
  styleUrls: ['tooltip.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('state', [
      state('void, initial, hidden', style({transform: 'scale(0)'})),
      state('visible', style({transform: 'scale(1)'})),
      transition('* => visible', animate('150ms cubic-bezier(0.0, 0.0, 0.2, 1)')),
      transition('* => hidden', animate('150ms cubic-bezier(0.4, 0.0, 1, 1)')),
    ]),
  ],
  host: {
    // Forces the element to have a layout in IE and Edge. This fixes issues where the element
    // won't be rendered if the animations are disabled or there is no web animations polyfill.
    '[style.zoom]': '_visibility === "visible" ? 1 : null',
    '(body:click)': '_handleBodyInteraction()',
    '[attr.aria-hidden]': 'isVisible()',
  }
})
export class TooltipComponent {
  /** Message to display in the tooltip */
  message: string;

  /** Classes to be added to the tooltip. Supports the same syntax as `ngClass`. */
  tooltipClass: string|string[]|Set<string>|{[key: string]: any};

  /** The timeout ID of any current timer set to show the tooltip */
  _showTimeoutId: number;

  /** The timeout ID of any current timer set to hide the tooltip */
  _hideTimeoutId: number;

  /** Property watched by the animation framework to show or hide the tooltip */
  _visibility: TooltipVisibility = 'initial';

  /** Whether interactions on the page should close the tooltip */
  _closeOnInteraction: boolean = false;

  /** The transform origin used in the animation for showing and hiding the tooltip */
  _transformOrigin: string = 'bottom';

  /** Unique ID to be used by the tooltip trigger's "aria-describedby" property. */
  id: string = `md-tooltip-${_uniqueTooltipIdCounter++}`;

  /** Subject for notifying that the tooltip has been hidden from the view */
  private _onHide: Subject<any> = new Subject();

  constructor(@Optional() private _dir: Directionality,
              private _changeDetectorRef: ChangeDetectorRef) {}

  /**
   * Shows the tooltip with an animation originating from the provided origin
   * @param position Position of the tooltip.
   * @param delay Amount of milliseconds to the delay showing the tooltip.
   */
  show(position: TooltipPosition, delay: number): void {
    // Cancel the delayed hide if it is scheduled
    if (this._hideTimeoutId) {
      clearTimeout(this._hideTimeoutId);
    }

    // Body interactions should cancel the tooltip if there is a delay in showing.
    this._closeOnInteraction = true;

    this._setTransformOrigin(position);
    this._showTimeoutId = setTimeout(() => {
      this._visibility = 'visible';

      // If this was set to true immediately, then a body click that triggers show() would
      // trigger interaction and close the tooltip right after it was displayed.
      this._closeOnInteraction = false;

      // Mark for check so if any parent component has set the
      // ChangeDetectionStrategy to OnPush it will be checked anyways
      this._markForCheck();
      setTimeout(() => this._closeOnInteraction = true, 0);
    }, delay);
  }

  /**
   * Begins the animation to hide the tooltip after the provided delay in ms.
   * @param delay Amount of milliseconds to delay showing the tooltip.
   */
  hide(delay: number): void {
    // Cancel the delayed show if it is scheduled
    if (this._showTimeoutId) {
      clearTimeout(this._showTimeoutId);
    }

    this._hideTimeoutId = setTimeout(() => {
      this._visibility = 'hidden';
      this._closeOnInteraction = false;

      // Mark for check so if any parent component has set the
      // ChangeDetectionStrategy to OnPush it will be checked anyways
      this._markForCheck();
    }, delay);
  }

  /** Returns an observable that notifies when the tooltip has been hidden from view */
  afterHidden(): Observable<void> {
    return this._onHide.asObservable();
  }

  /** Whether the tooltip is being displayed */
  isVisible(): boolean {
    return this._visibility === 'visible';
  }

  /** Sets the tooltip transform origin according to the tooltip position */
  _setTransformOrigin(value: TooltipPosition) {
    const isLtr = !this._dir || this._dir.value == 'ltr';
    switch (value) {
      case 'before': this._transformOrigin = isLtr ? 'right' : 'left'; break;
      case 'after':  this._transformOrigin = isLtr ? 'left' : 'right'; break;
      case 'left':   this._transformOrigin = 'right'; break;
      case 'right':  this._transformOrigin = 'left'; break;
      case 'above':  this._transformOrigin = 'bottom'; break;
      case 'below':  this._transformOrigin = 'top'; break;
      default: throw getMdTooltipInvalidPositionError(value);
    }
  }

  _afterVisibilityAnimation(e: AnimationEvent): void {
    if (e.toState === 'hidden' && !this.isVisible()) {
      this._onHide.next();
    }
  }

  /**
   * Interactions on the HTML body should close the tooltip immediately as defined in the
   * material design spec.
   * https://material.google.com/components/tooltips.html#tooltips-interaction
   */
  _handleBodyInteraction(): void {
    if (this._closeOnInteraction) {
      this.hide(0);
    }
  }

  /**
   * Marks that the tooltip needs to be checked in the next change detection run.
   * Mainly used for rendering the initial text before positioning a tooltip, which
   * can be problematic in components with OnPush change detection.
   */
  _markForCheck(): void {
    this._changeDetectorRef.markForCheck();
  }
}
