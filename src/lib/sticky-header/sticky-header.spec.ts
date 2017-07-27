import {async, ComponentFixture, TestBed, fakeAsync, tick} from '@angular/core/testing';
import {Component, DebugElement, ViewChild} from '@angular/core';
import {StickyHeaderModule, CdkStickyRegion, CdkStickyHeader,
  STICKY_HEADER_SUPPORT_STRATEGY} from './index';
import {OverlayModule, Scrollable} from '../core/overlay/index';
import {PlatformModule} from '../core/platform/index';
import {By} from '@angular/platform-browser';
import {dispatchFakeEvent} from '@angular/cdk/testing';



describe('sticky-header with positioning not supported', () => {
  let fixture: ComponentFixture<StickyHeaderTest>;
  let testComponent: StickyHeaderTest;
  let stickyElement: DebugElement;
  let stickyParentElement: DebugElement;
  let scrollableElement: DebugElement;
  let stickyHeaderDir: CdkStickyHeader;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ OverlayModule, PlatformModule, StickyHeaderModule ],
      declarations: [StickyHeaderTest],
      providers: [
        {provide: STICKY_HEADER_SUPPORT_STRATEGY, useValue: false},
      ],
    });
    TestBed.compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StickyHeaderTest);
    fixture.detectChanges();
    testComponent = fixture.debugElement.componentInstance;
    stickyElement = fixture.debugElement.query(By.directive(CdkStickyHeader));
    stickyParentElement = fixture.debugElement.query(By.directive(CdkStickyRegion));
    stickyHeaderDir = stickyElement.injector.get<CdkStickyHeader>(CdkStickyHeader);
    scrollableElement = fixture.debugElement.query(By.directive(Scrollable));
  });

  it('should be able to find stickyParent', () => {
    expect(stickyElement.nativeElement.stickyParent).not.toBe(null);
  });

  it('should be able to find scrollableContainer', () => {
    expect(stickyElement.nativeElement.upperScrollableContainer).not.toBe(null);
  });

  it('should stick in the right place when scrolled to the top of the container', fakeAsync(() => {
    let scrollableContainerTop = stickyHeaderDir.upperScrollableContainer
      .getBoundingClientRect().top;
    expect(stickyHeaderDir.element.getBoundingClientRect().top).not.toBe(scrollableContainerTop);
    tick(0);

    // Scroll the scrollableContainer up to stick
    fixture.componentInstance.scrollDown();
    tick(100);

    expect(stickyHeaderDir.element.getBoundingClientRect().top).toBe(scrollableContainerTop);
  }));

  it('should unstuck when scrolled off the top of the container', fakeAsync(() => {
    let scrollableContainerTop = stickyHeaderDir.upperScrollableContainer
      .getBoundingClientRect().top;
    expect(stickyHeaderDir.element.getBoundingClientRect().top).not.toBe(scrollableContainerTop);
    tick(0);

    // Scroll the scrollableContainer up to stick
    fixture.componentInstance.scrollDown();
    tick(100);

    expect(stickyHeaderDir.element.getBoundingClientRect().top).toBe(scrollableContainerTop);

    // Scroll the scrollableContainer down to unstuck
    fixture.componentInstance.scrollBack();
    tick(100);

    expect(stickyHeaderDir.element.getBoundingClientRect().top).not.toBe(scrollableContainerTop);

  }));
});

describe('sticky-header with positioning supported', () => {
  let fixture: ComponentFixture<StickyHeaderTest>;
  let testComponent: StickyHeaderTest;
  let stickyElement: DebugElement;
  let stickyParentElement: DebugElement;
  let stickyHeaderDir: CdkStickyHeader;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ OverlayModule, PlatformModule, StickyHeaderModule ],
      declarations: [StickyHeaderTest],
      providers: [
        {provide: STICKY_HEADER_SUPPORT_STRATEGY, useValue: true},
      ],
    });
    TestBed.compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StickyHeaderTest);
    fixture.detectChanges();
    testComponent = fixture.debugElement.componentInstance;
    stickyElement = fixture.debugElement.query(By.directive(CdkStickyHeader));
    stickyParentElement = fixture.debugElement.query(By.directive(CdkStickyRegion));
    stickyHeaderDir = stickyElement.injector.get<CdkStickyHeader>(CdkStickyHeader);
  });

  it('should find sticky positioning is applied', () => {
    let position = window.getComputedStyle(stickyHeaderDir.element).position;
    expect(position).not.toBe(null);
    if (position != null) {
      expect(/sticky/i.test(position)).toBe(true);
    }
  });
});

@Component({
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
      <div cdkStickyRegion id="theStickyHeaderLalala">
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
class StickyHeaderTest {
  @ViewChild(Scrollable) scrollingContainer: Scrollable;

  scrollDown() {
    const scrollingContainerEl = this.scrollingContainer.getElementRef().nativeElement;
    scrollingContainerEl.scrollTop = 300;

    // Emit a scroll event from the scrolling element in our component.
    dispatchFakeEvent(scrollingContainerEl, 'scroll');
  }

  scrollBack() {
    const scrollingContainerEl = this.scrollingContainer.getElementRef().nativeElement;
    scrollingContainerEl.scrollTop = 0;

    // Emit a scroll event from the scrolling element in our component.
    dispatchFakeEvent(scrollingContainerEl, 'scroll');
  }
}
