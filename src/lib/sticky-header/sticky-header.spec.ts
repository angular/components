import {async, ComponentFixture, TestBed, fakeAsync, tick} from '@angular/core/testing';
import {Component, DebugElement, ViewChild} from '@angular/core';
import {
  StickyHeaderModule,
  CdkStickyRegion,
  CdkStickyHeader,
  STICKY_HEADER_SUPPORT_STRATEGY
} from './index';
import {OverlayModule, Scrollable} from '../core/overlay/index';
import {PlatformModule} from '../core/platform/index';
import {By} from '@angular/platform-browser';
import {dispatchFakeEvent} from '@angular/cdk/testing';

const DEBOUNCE_TIME: number = 5;

describe('sticky-header with positioning not supported', () => {
  let fixture: ComponentFixture<StickyHeaderTest>;
  let testComponent: StickyHeaderTest;
  let stickyElement: DebugElement;
  let stickyParentElement: DebugElement;
  let scrollableElement: DebugElement;
  let stickyHeader: CdkStickyHeader;

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
    stickyHeader = stickyElement.injector.get<CdkStickyHeader>(CdkStickyHeader);
    scrollableElement = fixture.debugElement.query(By.directive(Scrollable));
  });

  it('should be able to find stickyParent', () => {
    expect(stickyHeader.stickyParent).not.toBeNull();
  });

  it('should be able to find scrollableContainer', () => {
    expect(stickyHeader.upperScrollableContainer).not.toBeNull();
  });

  it('should stick in the right place when scrolled to the top of the container', fakeAsync(() => {
    let scrollableContainerTop = stickyHeader.upperScrollableContainer
      .getBoundingClientRect().top;
    expect(stickyHeader.element.getBoundingClientRect().top).not.toBe(scrollableContainerTop);
    tick();

    // Scroll the scrollableContainer up to stick
    fixture.componentInstance.scrollDown();
    // wait for the DEBOUNCE_TIME
    tick(DEBOUNCE_TIME);

    expect(stickyHeader.element.getBoundingClientRect().top).toBe(scrollableContainerTop);
  }));

  it('should unstuck when scrolled off the top of the container', fakeAsync(() => {
    let scrollableContainerTop = stickyHeader.upperScrollableContainer
      .getBoundingClientRect().top;
    expect(stickyHeader.element.getBoundingClientRect().top).not.toBe(scrollableContainerTop);
    tick();

    // Scroll the scrollableContainer up to stick
    fixture.componentInstance.scrollDown();
    // wait for the DEBOUNCE_TIME
    tick(DEBOUNCE_TIME);

    expect(stickyHeader.element.getBoundingClientRect().top).toBe(scrollableContainerTop);

    // Scroll the scrollableContainer down to unstuck
    fixture.componentInstance.scrollBack();
    tick(DEBOUNCE_TIME);

    expect(stickyHeader.element.getBoundingClientRect().top).not.toBe(scrollableContainerTop);

  }));
});

describe('sticky-header with positioning supported', () => {
  let fixture: ComponentFixture<StickyHeaderTest>;
  let testComponent: StickyHeaderTest;
  let stickyElement: DebugElement;
  let stickyParentElement: DebugElement;
  let stickyHeader: CdkStickyHeader;

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
    stickyHeader = stickyElement.injector.get<CdkStickyHeader>(CdkStickyHeader);
  });

  it('should find sticky positioning is applied', () => {
    let position = window.getComputedStyle(stickyHeader.element).position;
    expect(position).not.toBeNull();
    expect(/sticky/i.test(position!)).toBe(true);
  });
});

describe('test sticky-header without StickyRegion', () => {
  let fixture: ComponentFixture<StickyHeaderTestNoStickyRegion>;
  let testComponent: StickyHeaderTestNoStickyRegion;
  let stickyElement: DebugElement;
  let stickyHeader: CdkStickyHeader;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ OverlayModule, PlatformModule, StickyHeaderModule ],
      declarations: [StickyHeaderTestNoStickyRegion],
      providers: [
        {provide: STICKY_HEADER_SUPPORT_STRATEGY, useValue: false},
      ],
    });
    TestBed.compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StickyHeaderTestNoStickyRegion);
    fixture.detectChanges();
    testComponent = fixture.debugElement.componentInstance;
    stickyElement = fixture.debugElement.query(By.directive(CdkStickyHeader));
    stickyHeader = stickyElement.injector.get<CdkStickyHeader>(CdkStickyHeader);
  });

  it('should be able to find stickyParent', () => {
    let p = stickyHeader.stickyParent;
    expect(p).not.toBeNull();
    expect(p!.id).toBe('default-region');
  });
});

@Component({
  // Use styles to define the style of scrollable container and header,
  // which help test to make sure whether the header is stuck at the right position.
  styles:[`
    .scrollable-style {
      text-align: center;
      -webkit-appearance: none;
      -moz-appearance: none;
      height: 300px;
      overflow: auto;
    }
    .heading-style {
      background: whitesmoke;
      padding: 5px;
    }
  `],
  template: `
    <div cdk-scrollable class="scrollable-style">
      <p *ngFor="let item of items"> {{item.name}} : {{item.message}}</p>
      <div cdkStickyRegion>
        <div cdkStickyHeader class="heading-style">
          <h2>Heading 1</h2>
        </div>
        <p *ngFor="let item of items"> {{item.name}} : {{item.message}}</p>
        <p *ngFor="let item of items"> {{item.name}} : {{item.message}}</p>
        <p *ngFor="let item of items"> {{item.name}} : {{item.message}}</p>
      </div>
    </div>
  `})
class StickyHeaderTest {
  @ViewChild(Scrollable) scrollingContainer: Scrollable;

  items: any[] = [
    {'name': 'Forrest', 'message': 'Life was like a box of chocolates'},
    {'name': 'Gump', 'message': 'you never know what you are gonna get'},
    {'name': 'Lion King', 'message': 'Everything you see exists together'},
    {'name': 'Jack', 'message': 'in a delicate balance'},
    {'name': 'Garfield', 'message': 'Save Water'},
    {'name': 'Shawshank', 'message': 'There is something inside'},
    {'name': 'Jone', 'message': 'Enough movies?'},
  ];

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

@Component({
  // Use styles to define the style of scrollable container and header,
  // which help test to make sure whether the header is stuck at the right position.
  styles:[`
    .scrollable-style {
      text-align: center;
      -webkit-appearance: none;
      -moz-appearance: none;
      height: 300px;
      overflow: auto;
    }
    .heading-style {
      background: whitesmoke;
      padding: 5px;
    }
  `],
  template: `
    <div cdk-scrollable class="scrollable-style">
      <p *ngFor="let item of items"> {{item.name}} : {{item.message}}</p>
      <div id="default-region">
        <div cdkStickyHeader class="heading-style">
          <h2>Heading 1</h2>
        </div>
        <p *ngFor="let item of items"> {{item.name}} : {{item.message}}</p>
        <p *ngFor="let item of items"> {{item.name}} : {{item.message}}</p>
        <p *ngFor="let item of items"> {{item.name}} : {{item.message}}</p>
      </div>
    </div>
  `})
class StickyHeaderTestNoStickyRegion {
  items: any[] = [
    {'name': 'Forrest', 'message': 'Life was like a box of chocolates'},
    {'name': 'Gump', 'message': 'you never know what you are gonna get'},
    {'name': 'Lion King', 'message': 'Everything you see exists together'},
    {'name': 'Jack', 'message': 'in a delicate balance'},
    {'name': 'Garfield', 'message': 'Save Water'},
    {'name': 'Shawshank', 'message': 'There is something inside'},
    {'name': 'Jone', 'message': 'Enough movies?'},
  ];
}
