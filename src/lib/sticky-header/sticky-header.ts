/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Directive, Input,
  OnDestroy, AfterViewInit, ElementRef, Optional} from '@angular/core';
import {Platform} from '../core/platform';
import {Scrollable} from '../core/overlay/scroll/scrollable';
import {extendObject} from '../core/util/object-extend';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/debounceTime';


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
 * Set a debounce time which is used in debounce() function when adding event listeners.
 * Set is as 5. Because if the DEBOUNCE_TIME is set as a too large number. The sticky effect
 * during scroll will become vary strange and can not be scrolled smoothly.
 */
const DEBOUNCE_TIME: number = 5;

/**
 * Directive that marks an element as a sticky-header. Inside of a scrolling container (marked with
 * cdkScrollable), this header will "stick" to the top of the scrolling viewport while its sticky
 * region (see cdkStickyRegion) is in view.
 */
@Directive({
  selector: '[cdkStickyHeader]',
})
export class CdkStickyHeader implements OnDestroy, AfterViewInit {

  /**
   * Set the sticky-header's z-index as 10 in default. Make it as an input
   * variable to make user be able to customize the zIndex when
   * the sticky-header's zIndex is not the largest in current page.
   * Because if the sticky-header's zIndex is not the largest in current page,
   * it may be sheltered by other element when being stuck.
   */
  @Input('cdkStickyHeaderZIndex') zIndex: number = 10;

  isStuck: boolean = false;
  /** Whether the browser support CSS sticky positioning. */
  private _isStickyPositionSupported: boolean = true;


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
              platform: Platform) {
    if (platform.isBrowser) {
      this.element = element.nativeElement;
      this.upperScrollableContainer = scrollable.getElementRef().nativeElement;
      this.setStrategyAccordingToCompatibility();
    }
  }

  ngAfterViewInit(): void {
    if (!this._isStickyPositionSupported) {
      this.stickyParent = this.parentRegion != null ?
        this.parentRegion._elementRef.nativeElement : this.element.parentElement;
      let values = window.getComputedStyle(this.element, '');
      this._originalStyles = {
        position: values.position,
        top: values.top,
        right: values.right,
        left: values.left,
        bottom: values.bottom,
        width: values.width,
        zIndex: values.zIndex} as CSSStyleDeclaration;
      this.attach();
      this.defineRestrictionsAndStick();
    }
  }

  ngOnDestroy(): void {
    if (this._onScrollSubscription) {
      this._onScrollSubscription.unsubscribe();
    }

    if (this._onResizeSubscription) {
      this._onResizeSubscription.unsubscribe();
    }

    if (this._onTouchSubscription) {
      this._onTouchSubscription.unsubscribe();
    }
  }

  /**
   * getSupportList() is used to get a list of string which can be set to
   * sticky-header's style.position and make Sticky positioning work.
   * It returns a list of string.
   *
   * According to the "Position:sticky Browser compatibility" in
   * "https://developer.mozilla.org/en-US/docs/Web/CSS/position".
   *
   * For Desktop: Sticky positioning works well on Chrome, Edge, Firefox and Opera. And can
   * also work well on Safari with a "-webkit-" prefix. It only does not work on IE.
   *
   * For Mobile: Sticky positioning works well on Android Webview, Chrome for Android, Edge,
   * Firefox Mobile, Opera Mobile. And can also work well on Safari Mobile with a "-webkit-" prefix.
   * It won't always work on IE phone.
   *
   * The implementation references the compatibility checking in Modernizer
   * (https://github.com/Modernizr/Modernizr/blob/master/feature-detects/css/positionsticky.js).
   */
  getSupportList(): string[] {
    let prefixTestList = ['', '-webkit-', '-ms-', '-moz-', '-o-'];
    let supportList: Array<string> = new Array<string>();
    let stickyText = '';
    for (let i = 0; i < prefixTestList.length; i++ ) {
      stickyText = 'position:' + prefixTestList[i] + 'sticky;';
      // Create a DOM to check if the browser support current prefix for sticky-position.
      let div = document.createElement('div');
      let body = document.body;
      div.style.cssText = 'display:none;' + stickyText;
      body.appendChild(div);
      let values = window.getComputedStyle(div).position;
      if (values != null) {
        let isSupport = /sticky/i.test(values);
        body.removeChild(div);
        if (isSupport == true) {
          supportList.push(prefixTestList[i]);
        }
      }
    }
    return supportList;
  }

  /**
   * Get the first element from this._supportList. Set it as a prefix of
   * sticky positioning.
   *
   * If the this._supportList is empty, which means the browser does not support
   * sticky positioning. Set isStickyPositionSupported as 'true' and use the original
   * implementation of sticky-header.
   */
  setStrategyAccordingToCompatibility(): void {
    let supportList = this.getSupportList();
    if (supportList.length === 0) {
      this._isStickyPositionSupported = false;
    } else {
      // Only need supportList[0], Because supportList contains all the prefix
      // that can make sticky positioning work in the current browser.
      // We only need to get one prefix and make position: prefix + 'sticky',
      // then sticky position will work.
      let prefix: string = supportList[0];

      this.element.style.top = '0px';
      this.element.style.position = prefix + 'sticky';
    }
  }

  attach() {
    this._onScrollSubscription = Observable.fromEvent(this.upperScrollableContainer, 'scroll')
      .debounceTime(DEBOUNCE_TIME).subscribe(() => this.defineRestrictionsAndStick());

    // Have to add a 'onTouchMove' listener to make sticky header work on mobile phones
    this._onTouchSubscription = Observable.fromEvent(this.upperScrollableContainer, 'touchmove')
      .debounceTime(DEBOUNCE_TIME).subscribe(() => this.defineRestrictionsAndStick());

    this._onResizeSubscription = Observable.fromEvent(this.upperScrollableContainer, 'resize')
      .debounceTime(DEBOUNCE_TIME).subscribe(() => this.onResize());
  }

  onScroll(): void {
    this.defineRestrictionsAndStick();
  }

  onTouchMove(): void {
    this.defineRestrictionsAndStick();
  }

  onResize(): void {
    this.defineRestrictionsAndStick();
    /**
     * If there's already a header being stick when the page is
     * resized. The CSS style of the cdkStickyHeader element may be not fit
     * the resized window. So we need to unstuck it then re-stick it.
     * unstuck() can set 'isStuck' to FALSE. Then stickElement() can work.
     */
    if (this.isStuck) {
      this.unstuckElement();
      this.stickElement();
    }
  }

  /**
   * define the restrictions of the sticky header(including stickyWidth,
   * when to start, when to finish)
   */
  defineRestrictions(): void {
    if (!this.stickyParent) {
      return;
    }
    let boundingClientRect: any = this.stickyParent.getBoundingClientRect();
    let elemHeight: number = this.element.offsetHeight;
    this._stickyRegionTop = boundingClientRect.top;
    let stickRegionHeight = boundingClientRect.height;

    this._stickyRegionBottomThreshold = this._stickyRegionTop + (stickRegionHeight - elemHeight);
  }

  /** Reset element to its original CSS. */
  resetElement(): void {
    this.element.classList.remove(STICK_START_CLASS);
    extendObject(this.element.style, this._originalStyles);
  }

  /** Stuck element, make the element stick to the top of the scrollable container. */
  stickElement(): void {
    this.isStuck = true;

    this.element.classList.remove(STICK_END_CLASS);
    this.element.classList.add(STICK_START_CLASS);

    /**
     * Have to add the translate3d function for the sticky element's css style.
     * Because iPhone and iPad's browser is using its owning rendering engine. And
     * even if you are using Chrome on an iPhone, you are just using Safari with
     * a Chrome skin around it.
     *
     * Safari on iPad and Safari on iPhone do not have resizable windows.
     * In Safari on iPhone and iPad, the window size is set to the size of
     * the screen (minus Safari user interface controls), and cannot be changed
     * by the user. To move around a webpage, the user changes the zoom level and position
     * of the viewport as they double tap or pinch to zoom in or out, or by touching
     * and dragging to pan the page. As a user changes the zoom level and position of the
     * viewport they are doing so within a viewable content area of fixed size
     * (that is, the window). This means that webpage elements that have their position
     * "fixed" to the viewport can end up outside the viewable content area, offscreen.
     *
     * So the 'position: fixed' does not work on iPhone and iPad. To make it work,
     * 'translate3d(0,0,0)' needs to be used to force Safari re-rendering the sticky element.
     **/
    this.element.style.transform = 'translate3d(0px,0px,0px)';

    let stuckRight: any = this.upperScrollableContainer.getBoundingClientRect().right;

    let stickyCss = {
      position: 'fixed',
      top: this.upperScrollableContainer.offsetTop + 'px',
      right: stuckRight + 'px',
      left: this.upperScrollableContainer.offsetLeft + 'px',
      bottom: 'auto',
      width: this._originalStyles.width,
      zIndex: this.zIndex + '',};
    extendObject(this.element.style, stickyCss);
  }

  /**
   * Unstuck element: When an element reaches the bottom of its cdkStickyRegion,
   * It should be unstuck. And its position will be set as 'relative', its bottom
   * will be set as '0'. So it will be stick at the bottom of its cdkStickyRegion and
   * will be scrolled up with its cdkStickyRegion element. In this way, the sticky header
   * can be changed smoothly when two sticky header meet and the later one need to replace
   * the former one.
   */
  unstuckElement(): void {
    this.isStuck = false;

    if (this.stickyParent == null) {
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
      width: this.upperScrollableContainer.clientWidth};
    extendObject(this.element.style, unstuckCss);
  }


  /**
   * 'sticker()' function contains the main logic of sticky-header. It decides when
   * a header should be stick and when should it be unstuck. It will first get
   * the offsetTop of the upper scrollable container. And then get the Start and End
   * of the sticky-header's stickyRegion.
   * The header will be stick if 'stickyRegion Start < container offsetTop < stickyRegion End'.
   * And when 'stickyRegion End < container offsetTop', the header will be unstuck. It will be
   * stick to the bottom of its stickyRegion container and being scrolled up with its stickyRegion
   * container.
   * When 'stickyRegion Start > container offsetTop', which means the header come back to the
   * middle of the scrollable container, the header will be reset to its
   * original CSS.
   * A flag, isStuck. is used in this function. When a header is stick, isStuck = true.
   * And when the 'isStuck' flag is TRUE, the sticky-header will not be repaint, which
   * decreases the times on repainting sticky-header.
   */
  sticker(): void {
    let currentPosition: number = this.upperScrollableContainer.offsetTop;

    // unstuck when the element is scrolled out of the sticky region
    if (this.isStuck &&
      (currentPosition < this._stickyRegionTop || currentPosition > this._stickyRegionBottomThreshold) ||
      currentPosition >= this._stickyRegionBottomThreshold) {
      this.resetElement();
      if (currentPosition >= this._stickyRegionBottomThreshold) {
        this.unstuckElement();
      }
      this.isStuck = false;    // stick when the element is within the sticky region
    } else if ( this.isStuck === false &&
      currentPosition > this._stickyRegionTop && currentPosition < this._stickyRegionBottomThreshold) {
      this.stickElement();
    }
  }

  defineRestrictionsAndStick(): void {
    this.defineRestrictions();
    this.sticker();
  }
}
