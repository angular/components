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

    fit('true is true', () => expect(true).toBe(true));

    fit('md-sticky-viewport element should have sticky-parent class in its classList', () => {
        fixture.detectChanges();
        expect(stickyParentElement.nativeElement.classList.contains('sticky-parent')).toBe(true);
    });

    fit('make sure the cdkSticky element has the right cdkStickyViewport parent element afterViewInit',
        async(() => {
            fixture.detectChanges();
            console.log('stickyElement.nativeElement is: ' + stickyElement.nativeElement);
            console.log('stickyElement.nativeElement.stickyParent is: ' + stickyElement.nativeElement.stickyParent);
            expect(stickyElement.nativeElement.stickyParent.classList.contains('sticky-parent')).toBe(true);
        }));
});

@Component({
    selector: 'app',
    template: `
    <div  cdk-scrollable style="text-align: center;
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





