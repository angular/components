import {
    Component,
    Directive,
    Input,
    Output,
    EventEmitter,
    OnInit,
    OnDestroy,
    AfterViewInit,
    ElementRef,
    Injectable,
    Renderer2,
    ViewContainerRef,} from '@angular/core';

import {Observable} from 'rxjs/Observable';
import {ScrollDispatcher} from '../core/overlay/scroll/scroll-dispatcher';
import {Scrollable} from '../core/overlay/scroll/scrollable';
import {Subject} from 'rxjs/Subject';


@Directive({
    selector: '[md-sticky-viewport]',
})


@Injectable()
export class StickyParentDirective implements OnInit, OnDestroy, AfterViewInit {

    private pelem: any;

    constructor(private element: ElementRef) {
        this.pelem = element.nativeElement;
    }

    ngOnInit(): void {
        this.pelem.classList.add('sticky-parent');
    }

    ngAfterViewInit(): void {

    }

    ngOnDestroy(): void {
        this.pelem.classList.remove('sticky-parent');
    }
}



@Directive({
    selector: '[md-sticky]',
})


@Injectable()
export class StickyHeaderDirective implements OnInit, OnDestroy, AfterViewInit {

    @Input('sticky-zIndex') zIndex: number = 10;

    private activated = new EventEmitter();
    private deactivated = new EventEmitter();

    private onScrollBind: EventListener = this.onScroll.bind(this);
    private onResizeBind: EventListener = this.onResize.bind(this);

    private stickStartClass: string = 'sticky';
    private stickEndClass: string = 'sticky-end';
    private isStuck: boolean = false;

    // the element with the 'md-sticky' tag
    private elem: any;

    // the uppercontainer element with the 'md-sticky-viewport' tag
    private stickyParent: any;

    // the upper scrollable container
    private upperScrollableContainer: any;

    // the original css of the sticky element, used to reset the sticky element when it is being unstick
    private originalCss: any;

    // the height of 'stickyParent'
    private containerHeight: number;

    // the height of 'elem'
    private elemHeight: number;

    private containerStart: number;
    private scrollFinish: number;

    private scrollingWidth: any;
    private scrollingRight: any;

    // the padding of 'elem'
    private elementPadding: any;
    private paddingNumber: any;

    // sticky element's width
    private width: string = 'auto';

    constructor(private element: ElementRef, public findScroll: Scrollable) {
        this.elem = element.nativeElement;
        this.upperScrollableContainer = findScroll.getElementRef().nativeElement;
    }

    ngOnInit(): void {

    }

    ngAfterViewInit(): void {

        // define parent scrollable container as parent element
        this.stickyParent = this.elem.parentNode;

        // make sure this.stickyParent is the element with 'sticky-parent' tag
        while (!this.stickyParent.classList.contains('sticky-parent')) {
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

        this.scrollingWidth = this.upperScrollableContainer.scrollWidth;

        this.attach();

        if (this.width == 'auto') {
            this.width = this.originalCss.width;
        }

        this.defineRestrictions();
        this.sticker();
    }

    ngOnDestroy(): void {
        this.detach();
    }

    attach() {
        this.upperScrollableContainer.addEventListener('scroll', this.onScrollBind);
        this.upperScrollableContainer.addEventListener('resize', this.onResizeBind);

        // Observable.fromEvent(this.upperScrollableContainer, 'scroll')
        //     .subscribe(() => this.onScroll());
    }

    detach() {
        this.upperScrollableContainer.removeEventListener('scroll', this.onScrollBind);
        this.upperScrollableContainer.removeEventListener('resize', this.onResizeBind);
    }

    onScroll(): void {
        this.defineRestrictions();
        this.sticker();
    }

    onResize(): void {
        this.defineRestrictions();
        this.sticker();

        if (this.isStuck) {
            this.unstickElement();
            this.stickElement();
        }
    }


    // define the restrictions of the sticky header(including stickyWidth, when to start, when to finish)
    defineRestrictions(): void {
        let containerTop: any = this.stickyParent.getBoundingClientRect();
        this.elemHeight = this.getCssNumber(this.elem, 'height');
        this.containerHeight = this.getCssNumber(this.stickyParent, 'height');
        this.containerStart = containerTop['top'];

        // the padding of the element being sticked
        this.elementPadding = this.getCssValue(this.elem, 'padding');

        this.paddingNumber = Number(this.elementPadding.slice(0,-2));
        this.scrollingWidth = this.upperScrollableContainer.clientWidth - this.paddingNumber - this.paddingNumber;

        this.scrollFinish = this.containerStart + (this.containerHeight - this.elemHeight);
    }

    // reset element to its original CSS
    resetElement(): void {
        this.elem.classList.remove(this.stickStartClass);
        Object.assign(this.elem.style, this.originalCss);
    }

    // stuck element, make the element stick to the top of the scrollable container.
    stickElement(): void {
        this.isStuck = true;

        this.elem.classList.remove(this.stickEndClass);
        this.elem.classList.add(this.stickStartClass);

        this.elem.style.zIndex = this.zIndex;
        this.elem.style.position = 'fixed';
        this.elem.style.top = this.upperScrollableContainer.offsetTop + 'px';
        this.scrollingRight = this.upperScrollableContainer.offsetLeft + this.upperScrollableContainer.offsetWidth;
        let stuckRight: any = this.upperScrollableContainer.getBoundingClientRect()['right'];
        this.elem.style.right = stuckRight + 'px';

        this.elem.style.left = this.upperScrollableContainer.offsetLeft + 'px';
        this.elem.style.bottom = 'auto';
        this.elem.style.width = this.scrollingWidth + 'px';

        this.activated.next(this.elem);
    }

    // unstuck element
    unstickElement(): void {
        this.isStuck = false;

        this.elem.classList.add(this.stickEndClass);

        this.stickyParent.style.position = 'relative';
        this.elem.style.position = 'absolute';
        this.elem.style.top = 'auto';
        this.elem.style.right = 0;
        this.elem.style.left = 'auto';
        this.elem.style.bottom = 'auto';
        this.elem.style.width = this.width;

        this.deactivated.next(this.elem);
    }


    sticker(): void {
        // detecting when a container's height changes
        let currentContainerHeight: number = this.getCssNumber(this.stickyParent, 'height');
        if (currentContainerHeight !== this.containerHeight) {
            this.defineRestrictions();
        }


        let currentPosition: number = this.upperScrollableContainer.offsetTop;

        // unstick when the element is scrolled out of the sticky region
        if (this.isStuck && (currentPosition < this.containerStart || currentPosition > this.scrollFinish) || currentPosition > this.scrollFinish) {
            this.resetElement();
            if (currentPosition > this.scrollFinish) this.unstickElement();
            this.isStuck = false;
        }
        // stick when the element is within the sticky region
        else if (this.isStuck === false && currentPosition > this.containerStart && currentPosition < this.scrollFinish) {
            this.stickElement();
        }
    }


    private getCssValue(element: any, property: string): any {
        let result: any = '';
        if (typeof window.getComputedStyle !== 'undefined') {
            result = window.getComputedStyle(element, null).getPropertyValue(property);
        }
        else if (typeof element.currentStyle !== 'undefined')  {
            result = element.currentStyle[property];
        }
        return result;
    }

    private getCssNumber(element: any, property: string): number {
        return parseInt(this.getCssValue(element, property), 10) || 0;
    }
}
