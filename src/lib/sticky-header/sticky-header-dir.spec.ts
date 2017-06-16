import { ComponentFixture, TestBed, async, tick, fakeAsync, inject } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {Component, DebugElement, ElementRef, NgModule, ViewChild} from '@angular/core';

import { MdStickyHeaderModule, StickyParentDirective, StickyHeaderDirective } from './index';
import { Scrollable } from '../core/overlay/scroll/scrollable';
import {dispatchFakeEvent} from '../core/testing/dispatch-events';
import {CommonModule} from '@angular/common';
import {OverlayModule, MdCommonModule} from '../core';


describe('my test for sticky-header', () => {
    let fixture: ComponentFixture<TestApp>;
    let testComponent: TestApp;
    let stickyElement: DebugElement;
    let stickyParentElement: DebugElement;
    let scrollableElement: HTMLElement;
    let stickyHeaderDir: StickyHeaderDirective;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [MdStickyHeaderModule, OverlayModule, MdCommonModule, CommonModule],
            declarations: [
                TestApp
            ],
        });

        TestBed.compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TestApp);
        testComponent = fixture.debugElement.componentInstance;
        stickyElement = fixture.debugElement.query(By.directive(StickyHeaderDirective));
        stickyParentElement = fixture.debugElement.query(By.directive(StickyParentDirective));
        stickyHeaderDir = stickyElement.injector.get<StickyHeaderDirective>(StickyHeaderDirective);
        //stickyHeaderDir = fixture.debugElement.query(By.directive(StickyHeaderDirective)).componentInstance;
    });

    // fit('true is true', () => expect(true).toBe(true));

    fit('md-sticky-viewport element should have sticky-parent class in its classList', () => {
        fixture.detectChanges();
        expect(stickyParentElement.nativeElement.classList.contains('sticky-parent')).toBe(true);
    });

    fit('make sure has the sticky-parent element afterViewInit()',
        fakeAsync(() => {
            fixture.detectChanges();
            stickyHeaderDir.ngAfterViewInit();
            tick(0);
            fixture.detectChanges();
            console.log('stickyElement.nativeElement is: ' + stickyElement.nativeElement);
            console.log('stickyElement.nativeElement.stickyParent is: ' + stickyHeaderDir.stickyParent);
            expect(stickyHeaderDir.stickyParent.classList.contains('sticky-parent')).toBe(true);
        }));


    fit('make sure defineRestrictions() is called when the element is scrolled',
        fakeAsync(() => {
            stickyHeaderDir.ngAfterViewInit();
            stickyHeaderDir.onScroll();

            tick(0);
            fixture.detectChanges();
            expect(stickyHeaderDir.elemHeight).not.toEqual(null);
        }));

    fit('make sure defineRestrictions() is called when the element is onTouchmove on mobile screen',
        fakeAsync(() => {
            stickyHeaderDir.ngAfterViewInit();
            stickyHeaderDir.onTouchMove();

            tick(0);
            fixture.detectChanges();
            expect(stickyHeaderDir.elemHeight).not.toEqual(null);
        }));

    fit('make sure defineRestrictions() is called when the element is resized',
        fakeAsync(() => {
            stickyHeaderDir.ngAfterViewInit();
            stickyHeaderDir.onResize();

            tick(0);
            fixture.detectChanges();
            expect(stickyHeaderDir.elemHeight).not.toEqual(null);
        }));

    fit('make sure sticked successfully after being sticked',
        fakeAsync(() => {
            stickyHeaderDir.ngAfterViewInit();
            stickyHeaderDir.onScroll();
            stickyHeaderDir.stickElement();

            tick(0);
            fixture.detectChanges();
            let exp: any = stickyHeaderDir.upperScrollableContainer.offsetTop + 'px';
            expect(stickyHeaderDir.elem.style.top).toEqual(exp);
        }));

    fit('make sure stickElement() successfully change isStuck flag to be TRUE',
        fakeAsync(() => {
            fixture.detectChanges();
            stickyHeaderDir.ngAfterViewInit();
            stickyHeaderDir.onScroll();
            stickyHeaderDir.stickElement();

            tick(0);
            fixture.detectChanges();
            expect(stickyHeaderDir.isStuck).toBe(true);
        }));

    fit('make sure unstickedElement successfully works',
        fakeAsync(() => {
            stickyHeaderDir.ngAfterViewInit();
            stickyHeaderDir.onScroll();
            stickyHeaderDir.stickElement();
            stickyHeaderDir.unstickElement();

            tick(0);
            fixture.detectChanges();
            expect(stickyHeaderDir.elem.style.bottom).toEqual('0px');
        }));

    fit('make sure unstickElement() successfully change isStuck flag to be FALSE',
        fakeAsync(() => {
            fixture.detectChanges();
            stickyHeaderDir.ngAfterViewInit();
            stickyHeaderDir.onScroll();
            stickyHeaderDir.stickElement();
            stickyHeaderDir.unstickElement();

            tick(0);
            fixture.detectChanges();
            expect(stickyHeaderDir.isStuck).toBe(false);
        }));

    fit('make sure resetElement successfully works',
        fakeAsync(() => {
            stickyHeaderDir.ngAfterViewInit();
            let exp = stickyHeaderDir.originalCss.width;
            stickyHeaderDir.onScroll();
            stickyHeaderDir.stickElement();
            stickyHeaderDir.unstickElement();
            stickyHeaderDir.resetElement();

            tick(0);
            fixture.detectChanges();
            expect(stickyHeaderDir.elem.style.width).toEqual(exp);
        }));


});

@Component({
    selector: 'app',
    template: `
    <div cdk-scrollable style="text-align: center;
        -webkit-appearance: none;
        -moz-appearance: none;
        height: 300px;
        overflow: auto;">
        <p>test test test</p>
        <p>test test test</p>
        <p>test test test</p>
        <p>test test test</p>
        <p>test test test</p>
        <p>test test test</p>
        <div cdkStickyViewport id="theStickyHeaderLalala">
            <div cdkSticky style="background: whitesmoke; padding: 5px;">
                <h2>Heading 1</h2>
            </div>
            <p>test test test</p>
            <p>test test test</p>
            <p>test test test</p>
            <p>test test test</p>
            <p>test test test</p>
            <p>test test test</p>
            <p>test test test</p>
            <p>test test test</p>
            <p>test test test</p>
            <p>test test test</p>
            <p>test test test</p>
            <p>test test test</p>
            <p>test test test</p>
            <p>test test test</p>
            <p>test test test</p>
            <p>test test test</p>
            <p>test test test</p>
            <p>test test test</p>
        </div>
    </div>
`})
class TestApp {
    @ViewChild(Scrollable) scrollingContainer: Scrollable;
}





