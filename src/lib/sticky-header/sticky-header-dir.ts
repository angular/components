/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Component, Directive, Input, Output,
    OnDestroy, AfterViewInit, ElementRef, Injectable, Optional} from '@angular/core';
import {Scrollable} from '../core/overlay/scroll/scrollable';


/**
 * The 'cdkStickyRegion' is a region contains one sticky header and other
 * contents that user wants to put under the sticky-header. It can help There only can
 * be one sticky-header in one 'cdkStickyRegion'.
 * If a user does not define a 'cdkStickyRegion' for a sticky-header, the direct
 * parent node of the sticky-header will be set as the 'cdkStickyRegion'.
 */
@Directive({
    selector: '[cdkStickyRegion]',
})
export class StickyParentDirective {
    constructor(private _element: ElementRef) { }

    getElementRef(): ElementRef {
        return this._element;
    }
}


/**
 * The 'cdkStickyHeader' is the header which user wants to be stick at top of the
 * scrollable container.
 */
const STICK_START_CLASS = 'stick';
const STICK_END_CLASS = 'sticky-end';
@Directive({
    selector: '[cdkStickyHeader]',
})
export class StickyHeaderDirective implements OnDestroy, AfterViewInit {

    /**
     * Set the sticky-header's z-index as 10 in default. Make it as an input
     * variable to make user be able to customize the zIndex when
     * the sticky-header's zIndex is not the largest in current page.
     * Because if the sticky-header's zIndex is not the largest in current page,
     * it may be sheltered by other element when being stick.
     */
    @Input('cdkStickyHeaderZIndex') zIndex: number = 10;
    @Input('cdkStickyParentRegion') parentRegion: HTMLElement;
    @Input('cdkStickyScrollableRegion') scrollableRegion: HTMLElement;

    private _onScrollBind: EventListener = this.onScroll.bind(this);
    private _onResizeBind: EventListener = this.onResize.bind(this);
    private _onTouchMoveBind: EventListener = this.onTouchMove.bind(this);
    public isStuck: boolean = false;

    // the element with the 'md-sticky' tag
    public elem: any;

    // the uppercontainer element with the 'md-sticky-viewport' tag
    public stickyParent: any;

    // the upper scrollable container
    public upperScrollableContainer: any;

    /**
     * the original css of the sticky element, used to reset the sticky element
     * when it is being unstuck
     */
    public originalCss: any;
    public stickyCss: any;

    // the height of 'stickyParent'
    public containerHeight: number;

    // the height of 'elem'
    public elemHeight: number;

    private _containerStart: number;
    private _scrollFinish: number;

    private _scrollingWidth: number;
    private _scrollingRight: number;

    // the padding of 'elem'
    private _elementPadding: any;
    private _paddingNumber: number;

    // sticky element's width
    private _width: string = 'auto';

    constructor(private _element: ElementRef,
                public scrollable: Scrollable,
                @Optional() public parentReg: StickyParentDirective) {
        this.elem = _element.nativeElement;
        this.upperScrollableContainer = scrollable.getElementRef().nativeElement;
        this.scrollableRegion = scrollable.getElementRef().nativeElement;
        if (parentReg != null) {
            this.parentRegion = parentReg.getElementRef().nativeElement;
        }
    }

    ngAfterViewInit(): void {

        if (this.parentRegion != null) {
            this.stickyParent = this.parentRegion;
        }else {
            this.stickyParent = this.elem.parentNode;
        }

        this.originalCss = {
            zIndex: this.getCssValue(this.elem, 'zIndex'),
            position: this.getCssValue(this.elem, 'position'),
            top: this.getCssValue(this.elem, 'top'),
            right: this.getCssValue(this.elem, 'right'),
            left: this.getCssValue(this.elem, 'left'),
            bottom: this.getCssValue(this.elem, 'bottom'),
            width: this.getCssValue(this.elem, 'width'),
        };

        this.attach();

        if (this._width == 'auto') {
            this._width = this.originalCss.width;
        }

        this.defineRestrictions();
        this.sticker();
    }

    ngOnDestroy(): void {
        this.upperScrollableContainer.removeEventListener('scroll', this._onScrollBind);
        this.upperScrollableContainer.removeEventListener('resize', this._onResizeBind);
        this.upperScrollableContainer.removeEventListener('touchmove', this._onTouchMoveBind);
    }

    attach() {
        this.upperScrollableContainer.addEventListener('scroll', this._onScrollBind, false);
        this.upperScrollableContainer.addEventListener('resize', this._onResizeBind, false);

        // Have to add a 'onTouchMove' listener to make sticky header work on mobile phones
        this.upperScrollableContainer.addEventListener('touchmove', this._onTouchMoveBind, false);
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
         * resized. The CSS style of the sticky-header may be not fit
         * the resized window. So we need to unstuck it then re-stick it.
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
        let containerTop: any = this.stickyParent.getBoundingClientRect();
        this.elemHeight = this.elem.offsetHeight;
        this.containerHeight = this.getCssNumber(this.stickyParent, 'height');
        this._containerStart = containerTop.top;

        // the padding of the element being sticked
        this._elementPadding = this.getCssValue(this.elem, 'padding');

        this._paddingNumber = Number(this._elementPadding.slice(0, -2));
        this._scrollingWidth = this.upperScrollableContainer.clientWidth -
            this._paddingNumber - this._paddingNumber;

        this._scrollFinish = this._containerStart + (this.containerHeight - this.elemHeight);
    }

    /**
     * Reset element to its original CSS
     */
    resetElement(): void {
        this.elem.classList.remove(STICK_START_CLASS);
        Object.assign(this.elem.style, this.originalCss);
    }

    /**
     * Stuck element, make the element stick to the top of the scrollable container.
     */
    stickElement(): void {
        this.isStuck = true;

        this.elem.classList.remove(STICK_END_CLASS);
        this.elem.classList.add(STICK_START_CLASS);

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

        this._scrollingRight = this.upperScrollableContainer.offsetLeft +
            this.upperScrollableContainer.offsetWidth;
        let stuckRight: any = this.upperScrollableContainer.getBoundingClientRect().right;

        this.stickyCss = {
            zIndex: this.zIndex,
            position: 'fixed',
            top: this.upperScrollableContainer.offsetTop + 'px',
            right: stuckRight + 'px',
            left: this.upperScrollableContainer.offsetLeft + 'px',
            bottom: 'auto',
            width: this._scrollingWidth + 'px',
        };
        Object.assign(this.elem.style, this.stickyCss);
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

        this.elem.classList.add(STICK_END_CLASS);

        this.stickyParent.style.position = 'relative';
        this.elem.style.position = 'absolute';
        this.elem.style.top = 'auto';
        this.elem.style.right = 0;
        this.elem.style.left = 'auto';
        this.elem.style.bottom = 0;
        this.elem.style.width = this._width;
    }


    sticker(): void {
        let currentPosition: number = this.upperScrollableContainer.offsetTop;

        // unstuck when the element is scrolled out of the sticky region
        if (this.isStuck &&
            (currentPosition < this._containerStart || currentPosition > this._scrollFinish) ||
            currentPosition >= this._scrollFinish) {
            this.resetElement();
            if (currentPosition >= this._scrollFinish) {
                this.unstuckElement();
            }
            this.isStuck = false;    // stick when the element is within the sticky region
        }else if ( this.isStuck === false &&
            currentPosition > this._containerStart && currentPosition < this._scrollFinish) {
            this.stickElement();
        }
    }

    defineRestrictionsAndStick(): void {
        this.defineRestrictions();
        this.sticker();
    }


    private getCssValue(element: any, property: string): any {
        let result: any = '';
        if (typeof window.getComputedStyle !== 'undefined') {
            result = window.getComputedStyle(element, '').getPropertyValue(property);
        }else if (typeof element.currentStyle !== 'undefined')  {
            result = element.currentStyle.property;
        }
        return result;
    }

    private getCssNumber(element: any, property: string): number {
        return parseInt(this.getCssValue(element, property), 10) || 0;
    }
}
