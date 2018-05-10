import {dispatchFakeEvent} from '@angular/cdk/testing';
import {Component, Input, ViewChild, ViewContainerRef, ViewEncapsulation} from '@angular/core';
import {ComponentFixture, fakeAsync, flush, TestBed} from '@angular/core/testing';
import {animationFrameScheduler} from 'rxjs';
import {ScrollingModule} from './scrolling-module';
import {CdkVirtualForOf} from './virtual-for-of';
import {CdkVirtualScrollViewport} from './virtual-scroll-viewport';


describe('CdkVirtualScrollViewport', () => {
  describe ('with FixedSizeVirtualScrollStrategy', () => {
    let fixture: ComponentFixture<FixedVirtualScroll>;
    let testComponent: FixedVirtualScroll;
    let viewport: CdkVirtualScrollViewport;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [ScrollingModule],
        declarations: [FixedVirtualScroll],
      }).compileComponents();

      fixture = TestBed.createComponent(FixedVirtualScroll);
      testComponent = fixture.componentInstance;
      viewport = testComponent.viewport;
    });

    it('should sanitize transform inputs', fakeAsync(() => {
      finishInit(fixture);
      viewport.orientation = 'arbitrary string as orientation' as any;
      viewport.setRenderedContentOffset(
          'arbitrary string as offset' as any, 'arbitrary string as to' as any);
      fixture.detectChanges();

      expect((viewport._renderedContentTransform as any).changingThisBreaksApplicationSecurity)
          .toBe('translateY(NaNpx)');
    }));

    it('should render initial state', fakeAsync(() => {
      finishInit(fixture);

      const contentWrapper =
          viewport.elementRef.nativeElement.querySelector('.cdk-virtual-scroll-content-wrapper');
      expect(contentWrapper.children.length)
          .toBe(4, 'should render 4 50px items to fill 200px space');
    }));

    it('should get the data length', fakeAsync(() => {
      finishInit(fixture);

      expect(viewport.getDataLength()).toBe(testComponent.items.length);
    }));

    it('should get the viewport size', fakeAsync(() => {
      finishInit(fixture);

      expect(viewport.getViewportSize()).toBe(testComponent.viewportSize);
    }));

    it('should get the rendered range', fakeAsync(() => {
      finishInit(fixture);

      expect(viewport.getRenderedRange())
          .toEqual({start: 0, end: 4}, 'should render the first 4 50px items to fill 200px space');
    }));

    it('should get the rendered content offset', fakeAsync(() => {
      finishInit(fixture);
      triggerScroll(viewport, testComponent.itemSize + 5);
      fixture.detectChanges();

      expect(viewport.getOffsetToRenderedContentStart()).toBe(testComponent.itemSize,
          'should have 50px offset since first 50px item is not rendered');
    }));

    it('should get the scroll offset', fakeAsync(() => {
      finishInit(fixture);
      triggerScroll(viewport, testComponent.itemSize + 5);
      fixture.detectChanges();

      expect(viewport.measureScrollOffset()).toBe(testComponent.itemSize + 5);
    }));

    it('should get the rendered content size', fakeAsync(() => {
      finishInit(fixture);

      expect(viewport.measureRenderedContentSize())
          .toBe(testComponent.viewportSize,
              'should render 4 50px items with combined size of 200px to fill 200px space');
    }));

    it('should measure range size', fakeAsync(() => {
      finishInit(fixture);

      expect(viewport.measureRangeSize({start: 1, end: 3}))
          .toBe(testComponent.itemSize * 2, 'combined size of 2 50px items should be 100px');
    }));

    it('should set total content size', fakeAsync(() => {
      finishInit(fixture);
      viewport.setTotalContentSize(10000);
      fixture.detectChanges();

      expect(viewport.elementRef.nativeElement.scrollHeight).toBe(10000);
    }));

    it('should set rendered range', fakeAsync(() => {
      finishInit(fixture);
      viewport.setRenderedRange({start: 2, end: 3});
      fixture.detectChanges();

      const items = fixture.elementRef.nativeElement.querySelectorAll('.item');
      expect(items.length).toBe(1, 'Expected 1 item to be rendered');
      expect(items[0].innerText).toBe('2 - 2', 'Expected item with index 2 to be rendered');
    }));

    it('should set content offset to top of content', fakeAsync(() => {
      finishInit(fixture);
      viewport.setRenderedContentOffset(10, 'to-start');
      fixture.detectChanges();

      expect(viewport.getOffsetToRenderedContentStart()).toBe(10);
    }));

    it('should set content offset to bottom of content', fakeAsync(() => {
      finishInit(fixture);
      const contentSize = viewport.measureRenderedContentSize();

      expect(contentSize).toBeGreaterThan(0);

      viewport.setRenderedContentOffset(contentSize + 10, 'to-end');
      fixture.detectChanges();

      expect(viewport.getOffsetToRenderedContentStart()).toBe(10);
    }));

    it('should set scroll offset', fakeAsync(() => {
      finishInit(fixture);
      viewport.setScrollOffset(testComponent.itemSize * 2);
      fixture.detectChanges();
      triggerScroll(viewport);
      fixture.detectChanges();

      expect(viewport.elementRef.nativeElement.scrollTop).toBe(testComponent.itemSize * 2);
      expect(viewport.getRenderedRange()).toEqual({start: 2, end: 6});
    }));

    it('should update viewport as user scrolls down', fakeAsync(() => {
      finishInit(fixture);

      const maxOffset =
          testComponent.itemSize * testComponent.items.length - testComponent.viewportSize;
      for (let offset = 0; offset <= maxOffset; offset += 10) {
        triggerScroll(viewport, offset);
        fixture.detectChanges();

        const expectedRange = {
          start: Math.floor(offset / testComponent.itemSize),
          end: Math.ceil((offset + testComponent.viewportSize) / testComponent.itemSize)
        };
        expect(viewport.getRenderedRange())
            .toEqual(expectedRange,
                `rendered range should match expected value at scroll offset ${offset}`);
        expect(viewport.getOffsetToRenderedContentStart())
            .toBe(expectedRange.start * testComponent.itemSize,
                `rendered content offset should match expected value at scroll offset ${offset}`);
        expect(viewport.measureRenderedContentSize())
            .toBe((expectedRange.end - expectedRange.start) * testComponent.itemSize,
                `rendered content size should match expected value at offset ${offset}`);
      }
    }));

    it('should update viewport as user scrolls up', fakeAsync(() => {
      finishInit(fixture);

      const maxOffset =
          testComponent.itemSize * testComponent.items.length - testComponent.viewportSize;
      for (let offset = maxOffset; offset >= 0; offset -= 10) {
        triggerScroll(viewport, offset);
        fixture.detectChanges();

        const expectedRange = {
          start: Math.floor(offset / testComponent.itemSize),
          end: Math.ceil((offset + testComponent.viewportSize) / testComponent.itemSize)
        };
        expect(viewport.getRenderedRange())
            .toEqual(expectedRange,
                `rendered range should match expected value at scroll offset ${offset}`);
        expect(viewport.getOffsetToRenderedContentStart())
            .toBe(expectedRange.start * testComponent.itemSize,
                `rendered content offset should match expected value at scroll offset ${offset}`);
        expect(viewport.measureRenderedContentSize())
            .toBe((expectedRange.end - expectedRange.start) * testComponent.itemSize,
                `rendered content size should match expected value at offset ${offset}`);
      }
    }));

    it('should render buffer element at the end when scrolled to the top', fakeAsync(() => {
      testComponent.bufferSize = 1;
      finishInit(fixture);

      expect(viewport.getRenderedRange()).toEqual({start: 0, end: 5},
          'should render the first 5 50px items to fill 200px space, plus one buffer element at' +
          ' the end');
    }));

    it('should render buffer element at the start and end when scrolled to the middle',
        fakeAsync(() => {
          testComponent.bufferSize = 1;
          finishInit(fixture);
          triggerScroll(viewport, testComponent.itemSize * 2);
          fixture.detectChanges();

          expect(viewport.getRenderedRange()).toEqual({start: 1, end: 7},
              'should render 6 50px items to fill 200px space, plus one buffer element at the' +
              ' start and end');
        }));

    it('should render buffer element at the start when scrolled to the bottom', fakeAsync(() => {
      testComponent.bufferSize = 1;
      finishInit(fixture);
      triggerScroll(viewport, testComponent.itemSize * 6);
      fixture.detectChanges();

      expect(viewport.getRenderedRange()).toEqual({start: 5, end: 10},
          'should render the last 5 50px items to fill 200px space, plus one buffer element at' +
          ' the start');
    }));

    it('should handle dynamic item size', fakeAsync(() => {
      finishInit(fixture);
      triggerScroll(viewport, testComponent.itemSize * 2);
      fixture.detectChanges();

      expect(viewport.getRenderedRange())
          .toEqual({start: 2, end: 6}, 'should render 4 50px items to fill 200px space');

      testComponent.itemSize *= 2;
      fixture.detectChanges();

      expect(viewport.getRenderedRange())
          .toEqual({start: 1, end: 3}, 'should render 2 100px items to fill 200px space');
    }));

    it('should handle dynamic buffer size', fakeAsync(() => {
      finishInit(fixture);
      triggerScroll(viewport, testComponent.itemSize * 2);
      fixture.detectChanges();

      expect(viewport.getRenderedRange())
          .toEqual({start: 2, end: 6}, 'should render 4 50px items to fill 200px space');

      testComponent.bufferSize = 1;
      fixture.detectChanges();

      expect(viewport.getRenderedRange())
          .toEqual({start: 1, end: 7}, 'should expand to 1 buffer element on each side');
    }));

    it('should handle dynamic item array', fakeAsync(() => {
      finishInit(fixture);
      triggerScroll(viewport, testComponent.itemSize * 6);
      fixture.detectChanges();

      expect(viewport.getOffsetToRenderedContentStart())
          .toBe(testComponent.itemSize * 6, 'should be scrolled to bottom of 10 item list');

      testComponent.items = Array(5).fill(0);
      fixture.detectChanges();
      triggerScroll(viewport);
      fixture.detectChanges();

      expect(viewport.getOffsetToRenderedContentStart())
          .toBe(testComponent.itemSize, 'should be scrolled to bottom of 5 item list');
    }));
  });

  describe('with FixedSizeVirtualScrollStrategy and horizontal orientation', () => {
    let fixture: ComponentFixture<FixedHorizontalVirtualScroll>;
    let testComponent: FixedHorizontalVirtualScroll;
    let viewport: CdkVirtualScrollViewport;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [ScrollingModule],
        declarations: [FixedHorizontalVirtualScroll],
      }).compileComponents();

      fixture = TestBed.createComponent(FixedHorizontalVirtualScroll);
      testComponent = fixture.componentInstance;
      viewport = testComponent.viewport;
    });

    it('should update viewport as user scrolls right', fakeAsync(() => {
      finishInit(fixture);

      const maxOffset =
          testComponent.itemSize * testComponent.items.length - testComponent.viewportSize;
      for (let offset = 0; offset <= maxOffset; offset += 10) {
        triggerScroll(viewport, offset);
        fixture.detectChanges();

        const expectedRange = {
          start: Math.floor(offset / testComponent.itemSize),
          end: Math.ceil((offset + testComponent.viewportSize) / testComponent.itemSize)
        };
        expect(viewport.getRenderedRange())
            .toEqual(expectedRange,
                `rendered range should match expected value at scroll offset ${offset}`);
        expect(viewport.getOffsetToRenderedContentStart())
            .toBe(expectedRange.start * testComponent.itemSize,
                `rendered content offset should match expected value at scroll offset ${offset}`);
        expect(viewport.measureRenderedContentSize())
            .toBe((expectedRange.end - expectedRange.start) * testComponent.itemSize,
                `rendered content size should match expected value at offset ${offset}`);
      }
    }));

    it('should update viewport as user scrolls left', fakeAsync(() => {
      finishInit(fixture);

      const maxOffset =
          testComponent.itemSize * testComponent.items.length - testComponent.viewportSize;
      for (let offset = maxOffset; offset >= 0; offset -= 10) {
        triggerScroll(viewport, offset);
        fixture.detectChanges();

        const expectedRange = {
          start: Math.floor(offset / testComponent.itemSize),
          end: Math.ceil((offset + testComponent.viewportSize) / testComponent.itemSize)
        };
        expect(viewport.getRenderedRange())
            .toEqual(expectedRange,
                `rendered range should match expected value at scroll offset ${offset}`);
        expect(viewport.getOffsetToRenderedContentStart())
            .toBe(expectedRange.start * testComponent.itemSize,
                `rendered content offset should match expected value at scroll offset ${offset}`);
        expect(viewport.measureRenderedContentSize())
            .toBe((expectedRange.end - expectedRange.start) * testComponent.itemSize,
                `rendered content size should match expected value at offset ${offset}`);
      }
    }));
  });
});


/** Finish initializing the virtual scroll component at the beginning of a test. */
function finishInit(fixture: ComponentFixture<any>) {
  // On the first cycle we render and measure the viewport.
  fixture.detectChanges();
  flush();

  // On the second cycle we render the items.
  fixture.detectChanges();
}

/** Trigger a scroll event on the viewport (optionally setting a new scroll offset). */
function triggerScroll(viewport: CdkVirtualScrollViewport, offset?: number) {
  if (offset !== undefined) {
    if (viewport.orientation == 'horizontal') {
      viewport.elementRef.nativeElement.scrollLeft = offset;
    } else {
      viewport.elementRef.nativeElement.scrollTop = offset;
    }
  }
  dispatchFakeEvent(viewport.elementRef.nativeElement, 'scroll');
  animationFrameScheduler.flush();
}


@Component({
  template: `
    <cdk-virtual-scroll-viewport
        class="viewport" [itemSize]="itemSize" [bufferSize]="bufferSize"
        [style.height.px]="viewportSize" [style.width.px]="viewportCrossSize">
      <div class="item" *cdkVirtualFor="let item of items; let i = index"
           [style.height.px]="itemSize">
        {{i}} - {{item}}
      </div>
    </cdk-virtual-scroll-viewport>
  `,
  styles: [`.cdk-virtual-scroll-content-wrapper { display: flex; flex-direction: column; }`],
  encapsulation: ViewEncapsulation.None,
})
class FixedVirtualScroll {
  @ViewChild(CdkVirtualScrollViewport) viewport: CdkVirtualScrollViewport;
  @ViewChild(CdkVirtualForOf, {read: ViewContainerRef}) cdkForOfViewContainer: ViewContainerRef;

  @Input() viewportSize = 200;
  @Input() viewportCrossSize = 100;
  @Input() itemSize = 50;
  @Input() bufferSize = 0;
  @Input() items = Array(10).fill(0).map((_, i) => i);
}

@Component({
  template: `
    <cdk-virtual-scroll-viewport
        class="viewport" [itemSize]="itemSize" [bufferSize]="bufferSize" orientation="horizontal"
        [style.width.px]="viewportSize" [style.height.px]="viewportCrossSize">
      <div class="item" *cdkVirtualFor="let item of items; let i = index"
           [style.width.px]="itemSize">
        {{i}} - {{item}}
      </div>
    </cdk-virtual-scroll-viewport>
  `,
  styles: [`.cdk-virtual-scroll-content-wrapper { display: flex; flex-direction: row; }`],
  encapsulation: ViewEncapsulation.None,
})
class FixedHorizontalVirtualScroll {
  @ViewChild(CdkVirtualScrollViewport) viewport: CdkVirtualScrollViewport;

  @Input() viewportSize = 200;
  @Input() viewportCrossSize = 100;
  @Input() itemSize = 50;
  @Input() bufferSize = 0;
  @Input() items = Array(10).fill(0).map((_, i) => i);
}
