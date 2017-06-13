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

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [MdStickyHeaderModule, OverlayModule, MdCommonModule, CommonModule],
            declarations:  [
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
    });

    fit('true is true' , () => expect(true).toBe(true));

    fit('md-sticky-viewport element should have sticky-parent class in its classList', () => {
        fixture.detectChanges();
        expect(stickyParentElement.nativeElement.classList.contains('sticky-parent')).toBe(true);
    });

    fit('md-sticky element should have sticky-parent class in its classList', () => {
        fixture.detectChanges();
        expect(stickyParentElement.nativeElement.classList.contains('sticky-parent')).toBe(true);
    });

});

@Component({
    selector: 'app',
    template: `
    <div  cdk-scrollable style="text-align: center;
        -webkit-appearance: none;
        -moz-appearance: none;
        height: 300px;
        overflow: auto;">
        <div md-sticky-viewport id="theStickyHeaderLalala">
            <div md-sticky >
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
        </div>
    </div>
`})
class TestApp {
    @ViewChild(Scrollable) scrollingContainer: Scrollable;
}





