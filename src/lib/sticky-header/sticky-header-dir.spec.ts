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
    });


    it('make sure defineRestrictions() is called when the element is scrolled',
        fakeAsync(() => {
            stickyHeaderDir.ngAfterViewInit();
            stickyHeaderDir.onScroll();

            tick(0);
            fixture.detectChanges();
            expect(stickyHeaderDir.elemHeight).not.toEqual(null);
        }));

    it('make sure defineRestrictions() is called when the element is onTouchmove on mobile screen',
        fakeAsync(() => {
            stickyHeaderDir.ngAfterViewInit();
            stickyHeaderDir.onTouchMove();

            tick(0);
            fixture.detectChanges();
            expect(stickyHeaderDir.elemHeight).not.toEqual(null);
        }));

    it('make sure defineRestrictions() is called when the element is resized',
        fakeAsync(() => {
            stickyHeaderDir.ngAfterViewInit();
            stickyHeaderDir.onResize();

            tick(0);
            fixture.detectChanges();
            expect(stickyHeaderDir.elemHeight).not.toEqual(null);
        }));

    it('make sure sticked successfully after being sticked',
        fakeAsync(() => {
            stickyHeaderDir.ngAfterViewInit();
            stickyHeaderDir.onScroll();
            stickyHeaderDir.stickElement();

            tick(0);
            fixture.detectChanges();
            let exp: any = stickyHeaderDir.upperScrollableContainer.offsetTop + 'px';
            expect(stickyHeaderDir.elem.style.top).toEqual(exp);
        }));

    it('make sure stickElement() successfully change isStuck flag to be TRUE',
        fakeAsync(() => {
            fixture.detectChanges();
            stickyHeaderDir.ngAfterViewInit();
            stickyHeaderDir.onScroll();
            stickyHeaderDir.stickElement();

            tick(0);
            fixture.detectChanges();
            expect(stickyHeaderDir.isStuck).toBe(true);
        }));

    it('make sure unstickedElement successfully works',
        fakeAsync(() => {
            stickyHeaderDir.ngAfterViewInit();
            stickyHeaderDir.onScroll();
            stickyHeaderDir.stickElement();
            stickyHeaderDir.unstuckElement();

            tick(0);
            fixture.detectChanges();
            expect(stickyHeaderDir.elem.style.bottom).toEqual('0px');
        }));

    it('make sure unstickElement() successfully change isStuck flag to be FALSE',
        fakeAsync(() => {
            fixture.detectChanges();
            stickyHeaderDir.ngAfterViewInit();
            stickyHeaderDir.onScroll();
            stickyHeaderDir.stickElement();
            stickyHeaderDir.unstuckElement();

            tick(0);
            fixture.detectChanges();
            expect(stickyHeaderDir.isStuck).toBe(false);
        }));

    it('make sure resetElement() successfully works',
        fakeAsync(() => {
            stickyHeaderDir.ngAfterViewInit();
            let expWidth = stickyHeaderDir.originalCss.width;
            let expTop = stickyHeaderDir.originalCss.top;
            let expRight = stickyHeaderDir.originalCss.right;
            stickyHeaderDir.onScroll();
            stickyHeaderDir.stickElement();
            stickyHeaderDir.unstuckElement();
            stickyHeaderDir.resetElement();

            tick(0);
            fixture.detectChanges();
            expect(stickyHeaderDir.elem.style.width).toEqual(expWidth);
            expect(stickyHeaderDir.elem.style.top).toEqual(expTop);
            expect(stickyHeaderDir.elem.style.right).toEqual(expRight);
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
            <div cdkStickyRegion id="theStickyHeader">
                <div cdkStickyHeader style="background: whitesmoke; padding: 5px;">
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
