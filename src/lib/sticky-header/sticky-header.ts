/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Directive, Input,
  OnDestroy, AfterViewInit, ElementRef, Optional,
  InjectionToken, Injectable, Inject, Provider} from '@angular/core';
import {Platform} from '../core/platform/index';
import {Scrollable} from '../core/overlay/scroll/scrollable';
import {extendObject} from '../core/util/object-extend';
import {Subscription} from 'rxjs/Subscription';
import {fromEvent} from 'rxjs/observable/fromEvent';
import {RxChain, debounceTime} from '../core/rxjs/index';
import {isPositionStickySupported} from '@angular/cdk';


/**
 * Directive that marks an element as a "sticky region", meant to contain exactly one sticky-header
 * along with the content associated with that header. The sticky-header inside of the region will
 * "stick" to the top of the scrolling container as long as this region is within the scrolling
 * viewport.
 *
 * If a user does not explicitly define a sticky-region for a sticky-header, the direct
 * parent node of the sticky-header will be used as the sticky-region.
 */
@Directive({
  selector: '[cdkStickyRegion]',
})
export class CdkStickyRegion {
  constructor(public readonly _elementRef: ElementRef) { }
}

/** Class applied when the header is "stuck" */
const STICK_START_CLASS = 'cdk-sticky-header-start';

/** Class applied when the header is not "stuck" */
const STICK_END_CLASS = 'cdk-sticky-header-end';

/**
 * Debounce time in milliseconds for events that affect the sticky positioning (e.g. scroll, resize,
 * touch move). Set as 5 milliseconds which is the highest delay that doesn't drastically affect the
 * positioning adversely.
 */
const DEBOUNCE_TIME: number = 5;

export const STICKY_HEADER_SUPPORT_STRATEGY = new InjectionToken('sticky-header-support-strategy');

/** @docs-private
 * Create a factory for sticky-positioning check to make code more testable
 */
export const STICKY_HEADER_SUPPORT_STRATEGY_PROVIDER: Provider = {
  provide: STICKY_HEADER_SUPPORT_STRATEGY,
  useFactory: isPositionStickySupported
};

/**
 * Directive that marks an element as a sticky-header. Inside of a scrolling container (marked with
 * cdkScrollable), this header will "stick" to the top of the scrolling viewport while its sticky
 * region (see cdkStickyRegion) is in view.
 */
@Directive({
  selector: '[cdkStickyHeader]',
})
export class CdkStickyHeader implements OnDestroy, AfterViewInit {

  /** z-index to be applied to the sticky header (default is 10). */
  @Input('cdkStickyHeaderZIndex') zIndex: number = 10;

  /** boolean value to mark whether the current header is stuck*/
  isStuck: boolean = false;

  /** The element with the 'cdkStickyHeader' tag. */
  element: HTMLElement;
  /** The upper container element with the 'cdkStickyRegion' tag. */
  stickyParent: HTMLElement | null;
  /** The upper scrollable container. */
  upperScrollableContainer: HTMLElement;
  /**
   * The original css of the sticky element, used to reset the sticky element
   * when it is being unstuck
   */
  private _originalStyles = {} as CSSStyleDeclaration;
  /**
   * 'getBoundingClientRect().top' of CdkStickyRegion of current sticky header.
   * It is used with '_stickyRegionBottomThreshold' to judge whether the current header
   * need to be stuck.
   */
  private _stickyRegionTop: number;
  /**
   * Bottom of the sticky region offset by the height of the sticky header.
   * Once the sticky header is scrolled to this position it will stay in place
   * so that it will scroll naturally out of view with the rest of the sticky region.
   */
  private _stickyRegionBottomThreshold: number;

  private _onScrollSubscription: Subscription;

  private _onTouchSubscription: Subscription;

  private _onResizeSubscription: Subscription;

  constructor(element: ElementRef,
              scrollable: Scrollable,
              @Optional() public parentRegion: CdkStickyRegion,
              platform: Platform,
              @Inject(STICKY_HEADER_SUPPORT_STRATEGY) public _isPositionStickySupported) {
    if (platform.isBrowser) {
      this.element = element.nativeElement;
      this.upperScrollableContainer = scrollable.getElementRef().nativeElement;
      this._setStrategyAccordingToCompatibility();
    }
  }

  ngAfterViewInit(): void {
    if (!this._isPositionStickySupported) {

      this.stickyParent = this.parentRegion != null ?
        this.parentRegion._elementRef.nativeElement : this.element.parentElement;

      let headerStyles = window.getComputedStyle(this.element, '');
      this._originalStyles = {
        position: headerStyles.position,
        top: headerStyles.top,
        right: headerStyles.right,
        left: headerStyles.left,
        bottom: headerStyles.bottom,
        width: headerStyles.width,
        zIndex: headerStyles.zIndex
      } as CSSStyleDeclaration;

      this._attachEventListeners();
      this._updateStickyPositioning();
    }
  }

  ngOnDestroy(): void {
    [this._onScrollSubscription, this._onScrollSubscription, this._onResizeSubscription]
      .forEach(s => s && s.unsubscribe());
  }

  /**
   * Check if current browser supports sticky positioning. If yes, apply
   * sticky positioning. If not, use the original implementation.
   */
  private _setStrategyAccordingToCompatibility(): void {
    if (this._isPositionStickySupported) {
      this.element.style.top = '0';
      this.element.style.cssText += 'position: -webkit-sticky; position: sticky; ';
      // TODO(sllethe): add css class with both 'sticky' and '-webkit-sticky' on position
      // when @Directory supports adding CSS class
    }
  }

  /** Add listeners for events that affect sticky positioning. */
  private _attachEventListeners() {
    this._onScrollSubscription = RxChain.from(fromEvent(this.upperScrollableContainer, 'scroll'))
      .call(debounceTime, DEBOUNCE_TIME).subscribe(() => this._updateStickyPositioning());

    // Have to add a 'onTouchMove' listener to make sticky header work on mobile phones
    this._onTouchSubscription = RxChain.from(fromEvent(this.upperScrollableContainer, 'touchmove'))
      .call(debounceTime, DEBOUNCE_TIME).subscribe(() => this._updateStickyPositioning());

    this._onResizeSubscription = RxChain.from(fromEvent(this.upperScrollableContainer, 'resize'))
      .call(debounceTime, DEBOUNCE_TIME).subscribe(() => this.onResize());
  }

  onResize(): void {
    this._updateStickyPositioning();
     // If there's already a header being stick when the page is
     // resized. The CSS style of the cdkStickyHeader element may be not fit
     // the resized window. So we need to unstuck it then re-stick it.
     // unstuck() can set 'isStuck' to FALSE. Then _stickElement() can work.
    if (this.isStuck) {
      this._unstickElement();
      this._stickElement();
    }
  }

  /** Measures the boundaries of the sticky regions to be used in subsequent positioning. */
  private _measureStickyRegionBounds(): void {
    if (!this.stickyParent) {
      return;
    }
    const boundingClientRect: any = this.stickyParent.getBoundingClientRect();
    this._stickyRegionTop = boundingClientRect.top;
    let stickRegionHeight = boundingClientRect.height;

    this._stickyRegionBottomThreshold = this._stickyRegionTop +
      (stickRegionHeight - this.element.offsetHeight);
  }

  /** Reset element to its original CSS. */
  private _resetElementStyles(): void {
    this.element.classList.remove(STICK_START_CLASS);
    extendObject(this.element.style, this._originalStyles);
  }

  /** Stuck element, make the element stick to the top of the scrollable container. */
  private _stickElement(): void {
    this.isStuck = true;

    this.element.classList.remove(STICK_END_CLASS);
    this.element.classList.add(STICK_START_CLASS);

    // Have to add the translate3d function for the sticky element's css style.
    // Because iPhone and iPad's browser is using its owning rendering engine. And
    // even if you are using Chrome on an iPhone, you are just using Safari with
    // a Chrome skin around it.
    //
    // Safari on iPad and Safari on iPhone do not have resizable windows.
    // In Safari on iPhone and iPad, the window size is set to the size of
    // the screen (minus Safari user interface controls), and cannot be changed
    // by the user. To move around a webpage, the user changes the zoom level and position
    // of the viewport as they double tap or pinch to zoom in or out, or by touching
    // and dragging to pan the page. As a user changes the zoom level and position of the
    // viewport they are doing so within a viewable content area of fixed size
    // (that is, the window). This means that webpage elements that have their position
    // "fixed" to the viewport can end up outside the viewable content area, offscreen.
    //
    // So the 'position: fixed' does not work on iPhone and iPad. To make it work,
    // 'translate3d(0,0,0)' needs to be used to force Safari re-rendering the sticky element.
    this.element.style.transform = 'translate3d(0px,0px,0px)';

    let stuckRight: number = this.upperScrollableContainer.getBoundingClientRect().right;

    let stickyCss = {
      position: 'fixed',
      top: this.upperScrollableContainer.offsetTop + 'px',
      right: stuckRight + 'px',
      left: this.upperScrollableContainer.offsetLeft + 'px',
      bottom: 'auto',
      width: this._originalStyles.width,
      zIndex: this.zIndex + ''
    };
    extendObject(this.element.style, stickyCss);
  }

  /**
   * Unsticks the header so that it goes back to scrolling normally.
   *
   * This should be called when the element reaches the bottom of its cdkStickyRegion so that it
   * smoothly scrolls out of view as the next sticky-header moves in.
   */
  private _unstickElement(): void {
    this.isStuck = false;

    if (!this.stickyParent) {
      return;
    }

    this.element.classList.add(STICK_END_CLASS);
    this.stickyParent.style.position = 'relative';
    let unstuckCss = {
      position: 'absolute',
      top: 'auto',
      right: '0',
      left: 'auto',
      bottom: '0',
      width: this._originalStyles.width
    };
    extendObject(this.element.style, unstuckCss);
  }


  /**
   * '_applyStickyPositionStyles()' function contains the main logic of sticky-header.
   * It decides when a header should be stick and when should it be unstuck by comparing
   * the offsetTop of scrollable container with the top and bottom of the sticky region.
   */
  _applyStickyPositionStyles(): void {
    let currentPosition: number = this.upperScrollableContainer.offsetTop;

    // unstuck when the element is scrolled out of the sticky region
    if (this.isStuck &&
      (currentPosition < this._stickyRegionTop ||
      currentPosition > this._stickyRegionBottomThreshold) ||
      currentPosition >= this._stickyRegionBottomThreshold) {
      this._resetElementStyles();
      if (currentPosition >= this._stickyRegionBottomThreshold) {
        this._unstickElement();
      }
      this.isStuck = false;    // stick when the element is within the sticky region
    } else if ( this.isStuck === false &&
      currentPosition > this._stickyRegionTop &&
      currentPosition < this._stickyRegionBottomThreshold) {
      this._stickElement();
    }
  }

  _updateStickyPositioning(): void {
    this._measureStickyRegionBounds();
    this._applyStickyPositionStyles();
  }
}
