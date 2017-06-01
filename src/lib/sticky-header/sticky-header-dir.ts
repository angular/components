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
    ViewContainerRef,} from '@angular/core';

import {Observable} from 'rxjs/Observable';

@Directive({
    selector: '[md-sticky-viewport]',
})

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



export class StickyHeaderDirective implements OnInit, OnDestroy, AfterViewInit {

    @Input('sticky-zIndex') zIndex: number = 10;
    @Input('sticky-width') width: string = 'auto'; //sticky's width
    @Input('sticky-offset-top') offsetTop: number = 0; //sticky距离页面顶端多远
    @Input('sticky-offset-bottom') offsetBottom: number = 0;
    @Input('sticky-start') start: number = 0;
    @Input('sticky-class') stickClass: string = 'sticky';
    @Input('sticky-end-class') endStickClass: string = 'sticky-end';
    @Input('sticky-media-query') mediaQuery: string = '';
    @Input('sticky-parent') parentMode: boolean = true;

    @Output() activated = new EventEmitter();
    @Output() deactivated = new EventEmitter();

    private onScrollBind: EventListener = this.onScroll.bind(this);
    private onResizeBind: EventListener = this.onResize.bind(this);

    private isStuck: boolean = false;

    private elem: any;
    private container: any;
    private originalCss: any;

    private windowHeight: number;
    private containerHeight: number;
    private elemHeight: number;
    private containerStart: number;
    private scrollFinish: number;

    private stickyParent: any;

    constructor(private element: ElementRef) {
        this.elem = element.nativeElement;
    }

    ngOnInit(): void {

    }

    ngAfterViewInit(): void {

        // define scroll container as parent element
        this.container = this.elem.parentNode;

        //this.container = document.querySelector('.sticky-parent');
        this.stickyParent = document.querySelector('.sticky-parent');

        while (!this.container.classList.contains('sticky-parent')) {
            this.container = this.elem.parentNode;
        }

        console.log('original container: ' + this.container);
        console.log('original container class: ' + this.container.classList.contains('sticky-parent'));

        console.log('my stickyParent: ' + this.stickyParent);

        console.log('this is: ' + this);

        this.originalCss = {
            zIndex: this.getCssValue(this.elem, 'zIndex'),
            position: this.getCssValue(this.elem, 'position'),
            top: this.getCssValue(this.elem, 'top'),
            right: this.getCssValue(this.elem, 'right'),
            left: this.getCssValue(this.elem, 'left'),
            bottom: this.getCssValue(this.elem, 'bottom'),
            width: this.getCssValue(this.elem, 'width'),
        };
        console.log('===================');
        console.log('this element this.zIndex : ' + this.zIndex);
        console.log('this element originalCss.top : ' + this.originalCss.top);
        console.log('this element originalCss.right : ' + this.originalCss.right);

        this.attach();
        this.attachDocument();


        if (this.width == 'auto') {
            this.width = this.originalCss.width;
        }

        this.defineDimensions();
        this.sticker();
    }

    ngOnDestroy(): void {
        this.detach();
        this.detachDocument();
    }

    attach() {
        window.addEventListener('scroll', this.onScrollBind);
        window.addEventListener('resize', this.onResizeBind);

        Observable.fromEvent(this.elem, 'scroll')
            .subscribe(() => this.onScroll());
    }
    attachDocument() {
        this.container.addEventListener('scroll', this.onScrollBind);
        this.container.addEventListener('resize', this.onResizeBind);
    }


    detach() {
        window.removeEventListener('scroll', this.onScrollBind);
        window.removeEventListener('resize', this.onResizeBind);
    }
    detachDocument() {
        document.removeEventListener('scroll', this.onScrollBind);
        document.removeEventListener('resize', this.onResizeBind);
    }

    onScroll(): void {
        this.defineDimensions();
        this.sticker();
    }

    onResize(): void {
        this.defineDimensions();
        this.sticker();

        if (this.isStuck) {
            this.unstuckElement();
            this.stuckElement();
        }
    }


    //getBoundingClientRect用于获得页面中某个元素的左，上，右和下分别相对浏览器视窗的位置。
    // getBoundingClientRect是DOM元素到浏览器可视范围的距离（不包含文档卷起的部分）。
    // 该函数返回一个Object对象，该对象有6个属性：top,lef,right,bottom,width,height；
    // 这里的top、left和css中的理解很相似，width、height是元素自身的宽高，
    // 但是right，bottom和css中的理解有点不一样。right是指元素右边界距窗口最左边的距离，
    // bottom是指元素下边界距窗口最上面的距离。

    defineDimensions(): void {
        let containerTop: number = this.getBoundingClientRectValue(this.container, 'top');
        this.windowHeight = window.innerHeight;
        this.elemHeight = this.getCssNumber(this.elem, 'height');
        this.containerHeight = this.getCssNumber(this.container, 'height');
        this.containerStart = containerTop + this.scrollbarYPos() - this.offsetTop + this.start;

        console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
        console.log('containerTop: ' + containerTop);
        console.log('this.windowHeight: ' + this.windowHeight);
        console.log('this.elemHeight: ' + this.elemHeight);
        console.log('this.scrollbarYPos(): ' + this.scrollbarYPos());
        console.log('this.containerHeight: ' + this.containerHeight);
        console.log('this.containerStart: ' + this.containerStart);
        console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~');

        if (this.parentMode) {
            this.scrollFinish = this.containerStart - this.start - this.offsetBottom + (this.containerHeight - this.elemHeight);
        } else {
            this.scrollFinish = document.body.offsetHeight;
        }
    }

    resetElement(): void {
        this.elem.classList.remove(this.stickClass);
        Object.assign(this.elem.style, this.originalCss);
    }

    stuckElement(): void {

        this.isStuck = true;

        this.elem.classList.remove(this.endStickClass);
        this.elem.classList.add(this.stickClass);

        let elementLeft = this.getBoundingClientRectValue(this.elem, 'left');
        this.elem.style.zIndex = this.zIndex;
        this.elem.style.position = 'fixed';
        this.elem.style.top = this.offsetTop + 'px';
        this.elem.style.right = 'auto';
        this.elem.style.left = elementLeft + 'px';
        this.elem.style.bottom = 'auto';
        this.elem.style.width = this.width;

        this.activated.next(this.elem);
    }

    unstuckElement(): void {
        this.isStuck = false;

        this.elem.classList.add(this.endStickClass);

        this.container.style.position = 'relative';
        this.elem.style.position = 'absolute';
        this.elem.style.top = 'auto';
        this.elem.style.right = 0;
        this.elem.style.left = 'auto';
        this.elem.style.bottom = this.offsetBottom + 'px';
        this.elem.style.width = this.width;

        this.deactivated.next(this.elem);
    }

    matchMediaQuery(): any {
        console.log('[][][][][]this.mediaQuery is : ' + this.mediaQuery);
        if (!this.mediaQuery) {
            console.log('!this.mediaQuery成立');
            console.log('matchMedia.media: ' + window.matchMedia(this.mediaQuery).matches);

            return true;
        }
        return (
            window.matchMedia('(' + this.mediaQuery + ')').matches ||
            window.matchMedia(this.mediaQuery).matches
        );
    }

    sticker(): void {

        // check media query
        if (this.isStuck && !this.matchMediaQuery()) {
            this.resetElement();
            return;
        }

        // detecting when a container's height changes
        let currentContainerHeight: number = this.getCssNumber(this.container, 'height');
        if (currentContainerHeight !== this.containerHeight) {
            this.defineDimensions();
        }

        let position: number = this.scrollbarYPos();

        // unstick
        if (this.isStuck && (position < this.containerStart || position > this.scrollFinish) || position > this.scrollFinish) {
            this.resetElement();
            if (position > this.scrollFinish) this.unstuckElement();
            this.isStuck = false;
        }
        // stick
        else if (this.isStuck === false && position > this.containerStart && position < this.scrollFinish) {
            this.stuckElement();
        }
    }

    private scrollbarYPos(): number {
        return window.pageYOffset || document.documentElement.scrollTop; //
        //In Javascript window.pageYOffset and document.documentElement.scrollTop both measures
        // the distance of an window top to its topmost visible content in pixel
    }

    private getBoundingClientRectValue(element: any, property: string): number {
        let result = 0;
        if (element.getBoundingClientRect) {
            let rect = element.getBoundingClientRect();
            console.log("element.getBoundingClientRect(): " + rect.height);
            result = (typeof rect[property] !== 'undefined') ? rect[property] : 0;
        }
        console.log('current element: ' + element);
        return result;
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
