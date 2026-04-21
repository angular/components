import {ArrayDataSource} from '../collections';
import {
  CdkScrollable,
  CdkVirtualForOf,
  CdkVirtualScrollViewport,
  ScrollDispatcher,
  ScrollingModule,
} from '../scrolling';
import {
  Component,
  Directive,
  TrackByFunction,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {Subject} from 'rxjs';
import {dispatchFakeEvent} from '../testing/private';

describe('CdkVirtualScrollViewport', () => {
  function wait(milliseconds: number) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
  }

  describe('with FixedSizeVirtualScrollStrategy', () => {
    let fixture: ComponentFixture<FixedSizeVirtualScroll>;
    let testComponent: FixedSizeVirtualScroll;
    let viewport: CdkVirtualScrollViewport;

    beforeEach(() => {
      fixture = TestBed.createComponent(FixedSizeVirtualScroll);
      testComponent = fixture.componentInstance;
      viewport = testComponent.viewport;
    });

    it('should render initial state', async () => {
      await finishInit(fixture);

      const contentWrapper = viewport.elementRef.nativeElement.querySelector(
        '.cdk-virtual-scroll-content-wrapper',
      )!;
      expect(contentWrapper.children.length)
        .withContext('should render 4 50px items to fill 200px space')
        .toBe(4);
    });

    it('should get the data length', async () => {
      await finishInit(fixture);

      expect(viewport.getDataLength()).toBe(testComponent.items.length);
    });

    it('should get the viewport size', async () => {
      await finishInit(fixture);

      expect(viewport.getViewportSize()).toBe(testComponent.viewportSize);
    });

    it('should update viewport size', async () => {
      testComponent.viewportSize = 300;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      await fixture.whenStable();
      viewport.checkViewportSize();
      expect(viewport.getViewportSize()).toBe(300);

      testComponent.viewportSize = 500;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      await fixture.whenStable();
      viewport.checkViewportSize();
      expect(viewport.getViewportSize()).toBe(500);
      await fixture.whenStable();
    });

    it('should update the viewport size when the page viewport changes', async () => {
      await finishInit(fixture);
      spyOn(viewport, 'checkViewportSize').and.callThrough();

      dispatchFakeEvent(window, 'resize');
      fixture.detectChanges();
      await new Promise(resolve => setTimeout(resolve, 20)); // The resize listener is debounced so we need to flush it.

      expect(viewport.checkViewportSize).toHaveBeenCalled();
    });

    it('should get the rendered range', async () => {
      await finishInit(fixture);

      expect(viewport.getRenderedRange())
        .withContext('should render the first 4 50px items to fill 200px space')
        .toEqual({start: 0, end: 4});
    });

    it('should contract the rendered range when changing to less data', async () => {
      await finishInit(fixture);

      expect(viewport.getRenderedRange()).toEqual({start: 0, end: 4});

      fixture.componentInstance.items = [0, 1];
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(viewport.getRenderedRange()).toEqual({start: 0, end: 2});

      fixture.componentInstance.items = [];
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(viewport.getRenderedRange()).toEqual({start: 0, end: 0});
    });

    it('should get the rendered content offset', async () => {
      await finishInit(fixture);
      await triggerScroll(viewport, testComponent.itemSize + 5);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(viewport.getOffsetToRenderedContentStart())
        .withContext('should have 50px offset since first 50px item is not rendered')
        .toBe(testComponent.itemSize);
    });

    it('should get the scroll offset', async () => {
      await finishInit(fixture);
      await triggerScroll(viewport, testComponent.itemSize + 5);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(viewport.measureScrollOffset()).toBe(testComponent.itemSize + 5);
    });

    it('should get the rendered content size', async () => {
      await finishInit(fixture);

      expect(viewport.measureRenderedContentSize())
        .withContext('should render 4 50px items with combined size of 200px to fill 200px space')
        .toBe(testComponent.viewportSize);
    });

    it('should measure range size', async () => {
      await finishInit(fixture);

      expect(viewport.measureRangeSize({start: 1, end: 3}))
        .withContext('combined size of 2 50px items should be 100px')
        .toBe(testComponent.itemSize * 2);
    });

    it('should measure range size when items has a margin', async () => {
      fixture.componentInstance.hasMargin = true;
      await finishInit(fixture);

      expect(viewport.measureRangeSize({start: 1, end: 3}))
        .withContext('combined size of 2 50px items with a 10px margin should be 110px')
        .toBe(testComponent.itemSize * 2 + 10);
    });

    it('should set total content size', async () => {
      await finishInit(fixture);

      viewport.setTotalContentSize(10000);
      await fixture.whenStable();
      fixture.detectChanges();

      expect(viewport.elementRef.nativeElement.scrollHeight).toBe(10000);
    });

    it('should set total content size in horizontal mode', async () => {
      testComponent.orientation = 'horizontal';
      await finishInit(fixture);

      viewport.setTotalContentSize(10000);
      await fixture.whenStable();
      fixture.detectChanges();

      expect(viewport.elementRef.nativeElement.scrollWidth).toBe(10000);
    });

    it('should set a class based on the orientation', async () => {
      await finishInit(fixture);
      const viewportElement: HTMLElement = fixture.nativeElement.querySelector(
        '.cdk-virtual-scroll-viewport',
      );

      expect(viewportElement.classList).toContain('cdk-virtual-scroll-orientation-vertical');

      testComponent.orientation = 'horizontal';
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(viewportElement.classList).toContain('cdk-virtual-scroll-orientation-horizontal');
    });

    it('should set the vertical class if an invalid orientation is set', async () => {
      testComponent.orientation = 'diagonal' as any;
      await finishInit(fixture);
      const viewportElement: HTMLElement = fixture.nativeElement.querySelector(
        '.cdk-virtual-scroll-viewport',
      );

      expect(viewportElement.classList).toContain('cdk-virtual-scroll-orientation-vertical');
    });

    it('should set rendered range', async () => {
      await finishInit(fixture);
      viewport.setRenderedRange({start: 2, end: 3});
      await fixture.whenStable();
      fixture.detectChanges();

      const items = fixture.elementRef.nativeElement.querySelectorAll('.item');
      expect(items.length).withContext('Expected 1 item to be rendered').toBe(1);
      expect(items[0].innerText.trim())
        .withContext('Expected item with index 2 to be rendered')
        .toBe('2 - 2');
    });

    it('should set content offset to top of content', async () => {
      await finishInit(fixture);
      viewport.setRenderedContentOffset(10, 'to-start');
      fixture.detectChanges();
      await fixture.whenStable();

      expect(viewport.getOffsetToRenderedContentStart()).toBe(10);
    });

    it('should set content offset to bottom of content', async () => {
      await finishInit(fixture);
      const contentSize = viewport.measureRenderedContentSize();

      expect(contentSize).toBeGreaterThan(0);

      viewport.setRenderedContentOffset(contentSize + 10, 'to-end');
      await fixture.whenStable();
      await new Promise(resolve => requestAnimationFrame(resolve)); // wait for afterNextRender

      expect(viewport.getOffsetToRenderedContentStart()).toBe(10);
    });

    it('should scroll to offset', async () => {
      await finishInit(fixture);
      viewport.scrollToOffset(testComponent.itemSize * 2);

      await triggerScroll(viewport);
      fixture.detectChanges();
      await fixture.whenStable();
      await wait(100);

      expect(viewport.measureScrollOffset()).toBe(testComponent.itemSize * 2);
      expect(viewport.getRenderedRange()).toEqual({start: 2, end: 6});
    });

    it('should scroll to index', async () => {
      await finishInit(fixture);
      viewport.scrollToIndex(2);

      await triggerScroll(viewport);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(viewport.measureScrollOffset()).toBe(testComponent.itemSize * 2);
      expect(viewport.getRenderedRange()).toEqual({start: 2, end: 6});
    });

    it('should scroll to offset in horizontal mode', async () => {
      testComponent.orientation = 'horizontal';
      await finishInit(fixture);
      viewport.scrollToOffset(testComponent.itemSize * 2);

      await triggerScroll(viewport);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(viewport.measureScrollOffset()).toBe(testComponent.itemSize * 2);
      expect(viewport.getRenderedRange()).toEqual({start: 2, end: 6});
    });

    it('should scroll to index in horizontal mode', async () => {
      testComponent.orientation = 'horizontal';
      await finishInit(fixture);
      viewport.scrollToIndex(2);

      await triggerScroll(viewport);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(viewport.measureScrollOffset()).toBe(testComponent.itemSize * 2);
      expect(viewport.getRenderedRange()).toEqual({start: 2, end: 6});
    });

    it('should output scrolled index', async () => {
      await finishInit(fixture);
      await triggerScroll(viewport, testComponent.itemSize * 2 - 1);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(testComponent.scrolledToIndex).toBe(1);

      await triggerScroll(viewport, testComponent.itemSize * 2);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(testComponent.scrolledToIndex).toBe(2);
    });

    it('should update viewport as user scrolls down', async () => {
      await finishInit(fixture);

      const maxOffset =
        testComponent.itemSize * testComponent.items.length - testComponent.viewportSize;
      for (let offset = 1; offset <= maxOffset; offset += 10) {
        await triggerScroll(viewport, offset);
        fixture.detectChanges();
        await fixture.whenStable();

        const expectedRange = {
          start: Math.floor(offset / testComponent.itemSize),
          end: Math.ceil((offset + testComponent.viewportSize) / testComponent.itemSize),
        };
        expect(viewport.getRenderedRange())
          .withContext(`rendered range should match expected value at scroll offset ${offset}`)
          .toEqual(expectedRange);
        expect(viewport.getOffsetToRenderedContentStart())
          .withContext(
            `rendered content offset should match expected value at ` + `scroll offset ${offset}`,
          )
          .toBe(expectedRange.start * testComponent.itemSize);
        expect(viewport.measureRenderedContentSize())
          .withContext(`rendered content size should match expected value at offset ${offset}`)
          .toBe((expectedRange.end - expectedRange.start) * testComponent.itemSize);
      }
    });

    it('should update viewport as user scrolls up', async () => {
      await finishInit(fixture);

      const maxOffset =
        testComponent.itemSize * testComponent.items.length - testComponent.viewportSize;
      for (let offset = maxOffset - 1; offset >= 0; offset -= 10) {
        await triggerScroll(viewport, offset);
        fixture.detectChanges();
        await fixture.whenStable();

        const expectedRange = {
          start: Math.floor(offset / testComponent.itemSize),
          end: Math.ceil((offset + testComponent.viewportSize) / testComponent.itemSize),
        };
        expect(viewport.getRenderedRange())
          .withContext(`rendered range should match expected value at scroll offset ${offset}`)
          .toEqual(expectedRange);
        expect(viewport.getOffsetToRenderedContentStart())
          .withContext(
            `rendered content offset should match expected value at scroll ` + `offset ${offset}`,
          )
          .toBe(expectedRange.start * testComponent.itemSize);
        expect(viewport.measureRenderedContentSize())
          .withContext(`rendered content size should match expected value at offset ${offset}`)
          .toBe((expectedRange.end - expectedRange.start) * testComponent.itemSize);
      }
    });

    it('should render buffer element at the end when scrolled to the top', async () => {
      testComponent.minBufferPx = testComponent.itemSize;
      testComponent.maxBufferPx = testComponent.itemSize;
      await finishInit(fixture);

      expect(viewport.getRenderedRange())
        .withContext(
          'should render the first 5 50px items to fill 200px space, ' +
            'plus one buffer element at the end',
        )
        .toEqual({start: 0, end: 5});
    });

    it('should render buffer element at the start and end when scrolled to the middle', async () => {
      testComponent.minBufferPx = testComponent.itemSize;
      testComponent.maxBufferPx = testComponent.itemSize;
      await finishInit(fixture);
      await triggerScroll(viewport, testComponent.itemSize * 2);
      fixture.detectChanges();
      await fixture.whenStable();
      await wait(100);

      expect(viewport.getRenderedRange())
        .withContext(
          'should render 6 50px items to fill 200px space, plus one ' +
            'buffer element at the start and end',
        )
        .toEqual({start: 1, end: 7});
    });

    it('should render buffer element at the start when scrolled to the bottom', async () => {
      testComponent.minBufferPx = testComponent.itemSize;
      testComponent.maxBufferPx = testComponent.itemSize;
      await finishInit(fixture);
      await triggerScroll(viewport, testComponent.itemSize * 6);
      fixture.detectChanges();
      await wait(100);

      expect(viewport.getRenderedRange())
        .withContext(
          'should render the last 5 50px items to fill 200px space, plus one ' +
            'buffer element at the start',
        )
        .toEqual({start: 5, end: 10});
    });

    it('should handle dynamic item size', async () => {
      await finishInit(fixture);
      await triggerScroll(viewport, testComponent.itemSize * 2);
      fixture.detectChanges();
      await wait(100);

      expect(viewport.getRenderedRange())
        .withContext('should render 4 50px items to fill 200px space')
        .toEqual({start: 2, end: 6});

      testComponent.itemSize *= 2;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      await wait(100);

      expect(viewport.getRenderedRange())
        .withContext('should render 2 100px items to fill 200px space')
        .toEqual({start: 1, end: 3});
    });

    it('should handle dynamic buffer size', async () => {
      await finishInit(fixture);
      await triggerScroll(viewport, testComponent.itemSize * 2);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(viewport.getRenderedRange())
        .withContext('should render 4 50px items to fill 200px space')
        .toEqual({start: 2, end: 6});

      testComponent.minBufferPx = testComponent.itemSize;
      testComponent.maxBufferPx = testComponent.itemSize;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(viewport.getRenderedRange())
        .withContext('should expand to 1 buffer element on each side')
        .toEqual({start: 1, end: 7});
    });

    it('should handle dynamic item array', async () => {
      await finishInit(fixture);
      await triggerScroll(viewport, testComponent.itemSize * 6);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(viewport.getOffsetToRenderedContentStart())
        .withContext('should be scrolled to bottom of 10 item list')
        .toBe(testComponent.itemSize * 6);

      testComponent.items = Array(5).fill(0);
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(viewport.getOffsetToRenderedContentStart())
        .withContext('should be scrolled to bottom of 5 item list')
        .toBe(testComponent.itemSize);
    });

    it('should handle dynamic item array with dynamic buffer', async () => {
      await finishInit(fixture);
      await triggerScroll(viewport, testComponent.itemSize * 6);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(viewport.getOffsetToRenderedContentStart())
        .withContext('should be scrolled to bottom of 10 item list')
        .toBe(testComponent.itemSize * 6);

      testComponent.items = Array(5).fill(0);
      testComponent.minBufferPx = testComponent.itemSize;
      testComponent.maxBufferPx = testComponent.itemSize;

      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(viewport.getOffsetToRenderedContentStart())
        .withContext('should render from first item')
        .toBe(0);
    });

    it('should handle dynamic item array keeping position when possible', async () => {
      testComponent.items = Array(100).fill(0);
      await finishInit(fixture);
      await triggerScroll(viewport, testComponent.itemSize * 50);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(viewport.getOffsetToRenderedContentStart())
        .withContext('should be scrolled to index 50 item list')
        .toBe(testComponent.itemSize * 50);

      testComponent.items = Array(54).fill(0);
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(viewport.getOffsetToRenderedContentStart())
        .withContext('should be kept the scroll position')
        .toBe(testComponent.itemSize * 50);
    });

    it('should update viewport as user scrolls right in horizontal mode', async () => {
      testComponent.orientation = 'horizontal';
      await finishInit(fixture);

      const maxOffset =
        testComponent.itemSize * testComponent.items.length - testComponent.viewportSize;
      for (let offset = 1; offset <= maxOffset; offset += 10) {
        await triggerScroll(viewport, offset);
        fixture.detectChanges();
        await fixture.whenStable();

        const expectedRange = {
          start: Math.floor(offset / testComponent.itemSize),
          end: Math.ceil((offset + testComponent.viewportSize) / testComponent.itemSize),
        };
        expect(viewport.getRenderedRange())
          .withContext(`rendered range should match expected value at scroll offset ${offset}`)
          .toEqual(expectedRange);
        expect(viewport.getOffsetToRenderedContentStart())
          .withContext(
            `rendered content offset should match expected value at scroll ` + `offset ${offset}`,
          )
          .toBe(expectedRange.start * testComponent.itemSize);
        expect(viewport.measureRenderedContentSize())
          .withContext(`rendered content size should match expected value at offset ${offset}`)
          .toBe((expectedRange.end - expectedRange.start) * testComponent.itemSize);
      }
    });

    it('should update viewport as user scrolls left in horizontal mode', async () => {
      testComponent.orientation = 'horizontal';
      await finishInit(fixture);

      const maxOffset =
        testComponent.itemSize * testComponent.items.length - testComponent.viewportSize;
      for (let offset = maxOffset - 1; offset >= 0; offset -= 10) {
        await triggerScroll(viewport, offset);
        fixture.detectChanges();
        await fixture.whenStable();

        const expectedRange = {
          start: Math.floor(offset / testComponent.itemSize),
          end: Math.ceil((offset + testComponent.viewportSize) / testComponent.itemSize),
        };
        expect(viewport.getRenderedRange())
          .withContext(`rendered range should match expected value at scroll offset ${offset}`)
          .toEqual(expectedRange);
        expect(viewport.getOffsetToRenderedContentStart())
          .withContext(
            `rendered content offset should match expected value at scroll ` + `offset ${offset}`,
          )
          .toBe(expectedRange.start * testComponent.itemSize);
        expect(viewport.measureRenderedContentSize())
          .withContext(`rendered content size should match expected value at offset ${offset}`)
          .toBe((expectedRange.end - expectedRange.start) * testComponent.itemSize);
      }
    });

    it('should work with a Set', async () => {
      const data = new Set(['hello', 'world', 'how', 'are', 'you']);
      testComponent.items = data as any;
      await finishInit(fixture);

      expect(viewport.getRenderedRange())
        .withContext('newly emitted items should be rendered')
        .toEqual({start: 0, end: 4});
    });

    it('should work with an Observable', async () => {
      const data = new Subject<number[]>();
      testComponent.items = data as any;
      await finishInit(fixture);

      expect(viewport.getRenderedRange())
        .withContext('no items should be rendered')
        .toEqual({start: 0, end: 0});

      data.next([1, 2, 3]);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(viewport.getRenderedRange())
        .withContext('newly emitted items should be rendered')
        .toEqual({start: 0, end: 3});
    });

    it('should work with a DataSource', async () => {
      const data = new Subject<number[]>();
      testComponent.items = new ArrayDataSource(data) as any;
      await finishInit(fixture);

      expect(viewport.getRenderedRange())
        .withContext('no items should be rendered')
        .toEqual({start: 0, end: 0});

      data.next([1, 2, 3]);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(viewport.getRenderedRange())
        .withContext('newly emitted items should be rendered')
        .toEqual({start: 0, end: 3});
    });

    it('should disconnect from data source on destroy', async () => {
      const data = new Subject<number[]>();
      const dataSource = new ArrayDataSource(data);

      spyOn(dataSource, 'connect').and.callThrough();
      spyOn(dataSource, 'disconnect').and.callThrough();

      testComponent.items = dataSource as any;
      await finishInit(fixture);

      expect(dataSource.connect).toHaveBeenCalled();

      fixture.destroy();

      expect(dataSource.disconnect).toHaveBeenCalled();
    });

    it('should trackBy value by default', async () => {
      testComponent.items = [];
      spyOn(testComponent.virtualForOf._viewContainerRef, 'detach').and.callThrough();
      await finishInit(fixture);

      testComponent.items = [0];
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(testComponent.virtualForOf._viewContainerRef.detach).not.toHaveBeenCalled();

      testComponent.items = [1];
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(testComponent.virtualForOf._viewContainerRef.detach).toHaveBeenCalled();
    });

    it('should trackBy index when specified', async () => {
      testComponent.trackBy = i => i;
      testComponent.items = [];
      spyOn(testComponent.virtualForOf._viewContainerRef, 'detach').and.callThrough();
      await finishInit(fixture);

      testComponent.items = [0];
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(testComponent.virtualForOf._viewContainerRef.detach).not.toHaveBeenCalled();

      testComponent.items = [1];
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(testComponent.virtualForOf._viewContainerRef.detach).not.toHaveBeenCalled();
    });

    it('should recycle views when template cache is large enough to accommodate', async () => {
      testComponent.trackBy = i => i;
      const spy = spyOn(testComponent.virtualForOf, '_getEmbeddedViewArgs').and.callThrough();

      await finishInit(fixture);

      // Should create views for the initial rendered items.
      expect(testComponent.virtualForOf._getEmbeddedViewArgs).toHaveBeenCalledTimes(4);

      spy.calls.reset();
      await triggerScroll(viewport, 10);
      fixture.detectChanges();
      await fixture.whenStable();

      // As we first start to scroll we need to create one more item. This is because the first item
      // is still partially on screen and therefore can't be removed yet. At the same time a new
      // item is now partially on the screen at the bottom and so a new view is needed.
      expect(testComponent.virtualForOf._getEmbeddedViewArgs).toHaveBeenCalledTimes(1);

      spy.calls.reset();
      const maxOffset =
        testComponent.itemSize * testComponent.items.length - testComponent.viewportSize;
      for (let offset = 10; offset <= maxOffset; offset += 10) {
        await triggerScroll(viewport, offset);
        fixture.detectChanges();
        await fixture.whenStable();
      }

      // As we scroll through the rest of the items, no new views should be created, our existing 5
      // can just be recycled as appropriate.
      expect(testComponent.virtualForOf._getEmbeddedViewArgs).not.toHaveBeenCalled();
    });

    it('should not recycle views when template cache is full', async () => {
      testComponent.trackBy = i => i;
      testComponent.templateCacheSize = 0;
      const spy = spyOn(testComponent.virtualForOf, '_getEmbeddedViewArgs').and.callThrough();

      await finishInit(fixture);

      // Should create views for the initial rendered items.
      expect(testComponent.virtualForOf._getEmbeddedViewArgs).toHaveBeenCalledTimes(4);

      spy.calls.reset();
      await triggerScroll(viewport, 10);
      fixture.detectChanges();
      await fixture.whenStable();

      // As we first start to scroll we need to create one more item. This is because the first item
      // is still partially on screen and therefore can't be removed yet. At the same time a new
      // item is now partially on the screen at the bottom and so a new view is needed.
      expect(testComponent.virtualForOf._getEmbeddedViewArgs).toHaveBeenCalledTimes(1);

      spy.calls.reset();
      const maxOffset =
        testComponent.itemSize * testComponent.items.length - testComponent.viewportSize;
      for (let offset = 10; offset <= maxOffset; offset += 10) {
        await triggerScroll(viewport, offset);
        fixture.detectChanges();
        await fixture.whenStable();
      }

      // Since our template cache size is 0, as we scroll through the rest of the items, we need to
      // create a new view for each one.
      expect(testComponent.virtualForOf._getEmbeddedViewArgs).toHaveBeenCalledTimes(5);
    });

    it('should render up to maxBufferPx when buffer dips below minBufferPx', async () => {
      testComponent.minBufferPx = testComponent.itemSize;
      testComponent.maxBufferPx = testComponent.itemSize * 2;
      await finishInit(fixture);

      expect(viewport.getRenderedRange())
        .withContext('should have 2 buffer items initially')
        .toEqual({start: 0, end: 6});

      await triggerScroll(viewport, 50);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(viewport.getRenderedRange())
        .withContext('should not render additional buffer yet')
        .toEqual({start: 0, end: 6});

      await triggerScroll(viewport, 51);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(viewport.getRenderedRange())
        .withContext('should render 2 more buffer items')
        .toEqual({start: 0, end: 8});
    });

    it('should throw if maxBufferPx is less than minBufferPx', async () => {
      testComponent.minBufferPx = 100;
      testComponent.maxBufferPx = 99;
      await expectAsync(finishInit(fixture)).toBeRejectedWithError(
        'CDK virtual scroll: maxBufferPx must be greater than or equal to minBufferPx',
      );
    });

    it('should register and degregister with ScrollDispatcher', async () => {
      const dispatcher = TestBed.inject(ScrollDispatcher);
      spyOn(dispatcher, 'register').and.callThrough();
      spyOn(dispatcher, 'deregister').and.callThrough();
      await finishInit(fixture);
      expect(dispatcher.register).toHaveBeenCalledWith(testComponent.viewport.scrollable!);
      fixture.destroy();
      expect(dispatcher.deregister).toHaveBeenCalledWith(testComponent.viewport.scrollable!);
    });

    it('should not throw when disposing of a view that will not fit in the cache', async () => {
      await finishInit(fixture);
      testComponent.items = new Array(200).fill(0);
      testComponent.templateCacheSize = 1; // Reduce the cache size to something we can easily hit.
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      await fixture.whenStable();

      for (let i = 0; i < 50; i++) {
        viewport.scrollToIndex(i);
        await triggerScroll(viewport);
        fixture.detectChanges();
        await fixture.whenStable();
      }
    });

    describe('viewChange change detection behavior', () => {
      it('should not emit viewChange if there are no listeners', async () => {
        const viewChangeSpy = spyOn(testComponent.virtualForOf.viewChange, 'next');
        await finishInit(fixture);
        testComponent.items = Array(10).fill(0);
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();
        await fixture.whenStable();

        viewport.scrollToIndex(5);
        await triggerScroll(viewport);
        expect(viewChangeSpy).not.toHaveBeenCalled();
      });
    });
  });

  describe('with RTL direction', () => {
    let fixture: ComponentFixture<FixedSizeVirtualScrollWithRtlDirection>;
    let testComponent: FixedSizeVirtualScrollWithRtlDirection;
    let viewport: CdkVirtualScrollViewport;
    let viewportEl: HTMLElement;
    let contentWrapperEl: HTMLElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(FixedSizeVirtualScrollWithRtlDirection);
      testComponent = fixture.componentInstance;
      viewport = testComponent.viewport;
      viewportEl = viewport.elementRef.nativeElement;
      contentWrapperEl = viewportEl.querySelector(
        '.cdk-virtual-scroll-content-wrapper',
      ) as HTMLElement;
    });

    it('should initially be scrolled all the way right and showing the first item in horizontal mode', async () => {
      testComponent.orientation = 'horizontal';
      await finishInit(fixture);

      expect(viewport.measureScrollOffset('right')).toBe(0);
      expect(contentWrapperEl.style.transform).toMatch(/translateX\(0(px)?\)/);
      expect((contentWrapperEl.children[0] as HTMLElement).innerText.trim()).toBe('0 - 0');
    });

    it('should scroll through items as user scrolls to the left in horizontal mode', async () => {
      testComponent.orientation = 'horizontal';
      await finishInit(fixture);

      await triggerScroll(viewport, testComponent.itemSize * testComponent.items.length);
      fixture.detectChanges();
      await fixture.whenStable();
      await wait(100);

      expect(contentWrapperEl.style.transform).toBe('translateX(-300px)');
      expect((contentWrapperEl.children[0] as HTMLElement).innerText.trim()).toBe('6 - 6');
    });

    it('should interpret scrollToOffset amount as an offset from the right in horizontal mode', async () => {
      testComponent.orientation = 'horizontal';
      await finishInit(fixture);

      viewport.scrollToOffset(100);
      await triggerScroll(viewport);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(viewport.measureScrollOffset('right')).toBe(100);
    });

    it('should scroll to the correct index in horizontal mode', async () => {
      testComponent.orientation = 'horizontal';
      await finishInit(fixture);

      viewport.scrollToIndex(2);
      await triggerScroll(viewport);
      fixture.detectChanges();
      await fixture.whenStable();

      expect((contentWrapperEl.children[0] as HTMLElement).innerText.trim()).toBe('2 - 2');
    });

    it('should emit the scrolled to index in horizontal mode', async () => {
      testComponent.orientation = 'horizontal';
      await finishInit(fixture);

      expect(testComponent.scrolledToIndex).toBe(0);

      viewport.scrollToIndex(2);
      await triggerScroll(viewport);
      fixture.detectChanges();
      await fixture.whenStable();
      await wait(100);

      expect(testComponent.scrolledToIndex).toBe(2);
    });

    it('should set total content size in RTL', async () => {
      await finishInit(fixture);

      viewport.setTotalContentSize(10000);
      await fixture.whenStable();
      fixture.detectChanges();

      expect(viewport.elementRef.nativeElement.scrollHeight).toBe(10000);
    });

    it('should set total content size in horizontal mode in RTL', async () => {
      testComponent.orientation = 'horizontal';
      await finishInit(fixture);

      viewport.setTotalContentSize(10000);
      await fixture.whenStable();
      fixture.detectChanges();

      expect(viewport.elementRef.nativeElement.scrollWidth).toBe(10000);
    });
  });

  describe('with no VirtualScrollStrategy', () => {
    it('should fail on construction', async () => {
      expect(() => TestBed.createComponent(VirtualScrollWithNoStrategy)).toThrowError(
        'Error: cdk-virtual-scroll-viewport requires the "itemSize" property to be set.',
      );
    });
  });

  describe('with item that injects ViewContainerRef', () => {
    let fixture: ComponentFixture<VirtualScrollWithItemInjectingViewContainer>;
    let testComponent: VirtualScrollWithItemInjectingViewContainer;
    let viewport: CdkVirtualScrollViewport;

    beforeEach(() => {
      fixture = TestBed.createComponent(VirtualScrollWithItemInjectingViewContainer);
      testComponent = fixture.componentInstance;
      viewport = testComponent.viewport;
    });

    it(
      'should render the values in the correct sequence when an item is ' +
        'injecting ViewContainerRef',
      async () => {
        await finishInit(fixture);

        const contentWrapper = viewport.elementRef.nativeElement.querySelector(
          '.cdk-virtual-scroll-content-wrapper',
        )!;

        expect(Array.from(contentWrapper.children).map(child => child.textContent!.trim())).toEqual(
          ['0', '1', '2', '3', '4', '5', '6', '7'],
        );
      },
    );
  });

  describe('with delayed initialization', () => {
    let fixture: ComponentFixture<DelayedInitializationVirtualScroll>;
    let testComponent: DelayedInitializationVirtualScroll;
    let viewport: CdkVirtualScrollViewport;

    beforeEach(waitForAsync(() => {
      fixture = TestBed.createComponent(DelayedInitializationVirtualScroll);
      testComponent = fixture.componentInstance;
      viewport = testComponent.viewport;
    }));

    it('should call custom trackBy when virtual for is added after init', async () => {
      await finishInit(fixture);
      expect(testComponent.trackBy).not.toHaveBeenCalled();

      testComponent.renderVirtualFor = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      await triggerScroll(viewport, testComponent.itemSize * 5);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(testComponent.trackBy).toHaveBeenCalled();
    });
  });

  describe('with append only', () => {
    let fixture: ComponentFixture<VirtualScrollWithAppendOnly>;
    let testComponent: VirtualScrollWithAppendOnly;
    let viewport: CdkVirtualScrollViewport;
    let contentWrapperEl: HTMLElement;

    beforeEach(waitForAsync(() => {
      fixture = TestBed.createComponent(VirtualScrollWithAppendOnly);
      testComponent = fixture.componentInstance;
      viewport = testComponent.viewport;
      contentWrapperEl = fixture.nativeElement.querySelector(
        '.cdk-virtual-scroll-content-wrapper',
      ) as HTMLElement;
    }));

    it('should not remove item that have already been rendered', async () => {
      await finishInit(fixture);
      viewport.setRenderedRange({start: 100, end: 200});
      fixture.detectChanges();
      await fixture.whenStable();
      viewport.setRenderedRange({start: 10, end: 50});
      fixture.detectChanges();
      await fixture.whenStable();

      expect(viewport.getRenderedRange()).toEqual({start: 0, end: 200});
    });

    it('rendered offset should always start at 0', async () => {
      await finishInit(fixture);
      await triggerScroll(viewport, testComponent.itemSize + 5);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(viewport.getOffsetToRenderedContentStart())
        .withContext('should have 0px offset as we are using appendOnly')
        .toBe(0);
    });

    it('should set content offset to bottom of content with append only', async () => {
      await finishInit(fixture);
      const contentSize = viewport.measureRenderedContentSize();

      expect(contentSize).toBeGreaterThan(0);

      viewport.setRenderedContentOffset(contentSize + 10, 'to-end');
      await fixture.whenStable();
      await new Promise(resolve => requestAnimationFrame(resolve)); // wait for afterNextRender

      expect(viewport.getOffsetToRenderedContentStart()).toBe(0);
    });

    it('should set content offset to top of content with append only', async () => {
      await finishInit(fixture);
      viewport.setRenderedContentOffset(10, 'to-start');
      fixture.detectChanges();
      await fixture.whenStable();

      expect(viewport.getOffsetToRenderedContentStart()).toBe(0);
    });

    it('should not set a transform when scrolling', async () => {
      await finishInit(fixture);
      await triggerScroll(viewport, 0);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(contentWrapperEl.style.transform).toBe('translateY(0px)');

      await triggerScroll(viewport, testComponent.itemSize * 10);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(contentWrapperEl.style.transform).toBe('translateY(0px)');
    });
  });

  describe('with custom scrolling element', () => {
    let fixture: ComponentFixture<VirtualScrollWithCustomScrollingElement>;
    let testComponent: VirtualScrollWithCustomScrollingElement;
    let viewport: CdkVirtualScrollViewport;

    beforeEach(() => {
      fixture = TestBed.createComponent(VirtualScrollWithCustomScrollingElement);
      testComponent = fixture.componentInstance;
      viewport = testComponent.viewport;
    });

    it('should measure viewport offset', async () => {
      await finishInit(fixture);

      expect(viewport.measureViewportOffset('top'))
        .withContext('with scrolling-element padding-top: 50 offset should be 50')
        .toBe(50);
    });

    it('should scroll to offset relative to scrolling container', async () => {
      await finishInit(fixture);
      await triggerScroll(viewport, 100, 'scrollingContainer');
      fixture.detectChanges();
      await fixture.whenStable();

      expect(viewport.measureScrollOffset('top'))
        .withContext('should be 50 (scrolling container offset)')
        .toBe(50);
    });

    it('should scroll to offset relative to viewport', async () => {
      await finishInit(fixture);
      await triggerScroll(viewport, 100, 'viewport');
      fixture.detectChanges();
      await fixture.whenStable();

      expect(viewport.measureScrollOffset('top'))
        .withContext('should be 100 (viewport offset)')
        .toBe(100);
    });
  });

  describe('with scrollable window', () => {
    let fixture: ComponentFixture<VirtualScrollWithScrollableWindow>;
    let testComponent: VirtualScrollWithScrollableWindow;
    let viewport: CdkVirtualScrollViewport;

    beforeEach(() => {
      fixture = TestBed.createComponent(VirtualScrollWithScrollableWindow);
      testComponent = fixture.componentInstance;
      viewport = testComponent.viewport;
    });

    it('should measure scroll offset with scrollable window', async () => {
      await finishInit(fixture);
      viewport.scrollToOffset(100 + 8); // the +8 is due to a horizontal scrollbar
      dispatchFakeEvent(window, 'scroll', true);
      await fixture.whenStable();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(viewport.measureScrollOffset('top'))
        .withContext('should be 50 (actual scroll offset - viewport offset)')
        .toBe(50);
    });
  });

  it('should be able to query for a virtual scroll viewport as a CdkScrollable', () => {
    const fixture = TestBed.createComponent(VirtualScrollableQuery);
    fixture.detectChanges();

    expect(fixture.componentInstance.scrollable).toBeTruthy();
  });
});

/** Finish initializing the virtual scroll component at the beginning of a test. */
async function finishInit(fixture: ComponentFixture<any>) {
  // On the first cycle we render and measure the viewport.
  fixture.detectChanges();
  await fixture.whenStable();

  // On the second cycle we render the items.
  fixture.detectChanges();
  await fixture.whenStable();

  // Flush the initial fake scroll event.
  await new Promise(resolve => requestAnimationFrame(resolve));
  await fixture.whenStable();
  fixture.detectChanges();
}

/** Trigger a scroll event on the viewport (optionally setting a new scroll offset). */
async function triggerScroll(
  viewport: CdkVirtualScrollViewport,
  offset?: number,
  relativeTo?: 'viewport' | 'scrollingContainer',
) {
  if (offset !== undefined) {
    viewport.scrollToOffset(offset, 'auto', relativeTo);
  }
  dispatchFakeEvent(viewport.scrollable!.getElementRef().nativeElement, 'scroll');
  await new Promise(resolve => setTimeout(resolve, 50));
}

@Component({
  template: `
    <cdk-virtual-scroll-viewport
        [itemSize]="itemSize" [minBufferPx]="minBufferPx" [maxBufferPx]="maxBufferPx"
        [orientation]="orientation" [style.height.px]="viewportHeight"
        [style.width.px]="viewportWidth" (scrolledIndexChange)="scrolledToIndex = $event"
        [class.has-margin]="hasMargin">
      <div class="item"
           *cdkVirtualFor="let item of items; let i = index; trackBy: trackBy; \
                           templateCacheSize: templateCacheSize"
           [style.height.px]="itemSize" [style.width.px]="itemSize">
        {{i}} - {{item}}
      </div>
    </cdk-virtual-scroll-viewport>
  `,
  styles: `
    .cdk-virtual-scroll-content-wrapper {
      display: flex;
      flex-direction: column;
    }

    .cdk-virtual-scroll-orientation-horizontal .cdk-virtual-scroll-content-wrapper {
      flex-direction: row;
    }

    .cdk-virtual-scroll-viewport {
      background-color: #f5f5f5;
    }

    .item {
      box-sizing: border-box;
      border: 1px dashed #ccc;
    }

    .has-margin .item {
      margin-bottom: 10px;
    }
  `,
  encapsulation: ViewEncapsulation.None,
  imports: [ScrollingModule],
  changeDetection: ChangeDetectionStrategy.Eager,
})
class FixedSizeVirtualScroll {
  @ViewChild(CdkVirtualScrollViewport, {static: true}) viewport!: CdkVirtualScrollViewport;
  // Casting virtualForOf as any so we can spy on private methods
  @ViewChild(CdkVirtualForOf, {static: true}) virtualForOf!: any;

  orientation: 'vertical' | 'horizontal' = 'vertical';
  viewportSize = 200;
  viewportCrossSize = 100;
  itemSize = 50;
  minBufferPx = 0;
  maxBufferPx = 0;
  items = Array(10)
    .fill(0)
    .map((_, i) => i);
  trackBy!: TrackByFunction<number>;
  templateCacheSize = 20;

  scrolledToIndex = 0;
  hasMargin = false;

  get viewportWidth() {
    return this.orientation == 'horizontal' ? this.viewportSize : this.viewportCrossSize;
  }

  get viewportHeight() {
    return this.orientation == 'horizontal' ? this.viewportCrossSize : this.viewportSize;
  }
}

@Component({
  template: `
    <cdk-virtual-scroll-viewport dir="rtl"
        [itemSize]="itemSize" [minBufferPx]="minBufferPx" [maxBufferPx]="maxBufferPx"
        [orientation]="orientation" [style.height.px]="viewportHeight"
        [style.width.px]="viewportWidth" (scrolledIndexChange)="scrolledToIndex = $event">
      <div class="item"
           *cdkVirtualFor="let item of items; let i = index; trackBy: trackBy; \
                           templateCacheSize: templateCacheSize"
           [style.height.px]="itemSize" [style.width.px]="itemSize">
        {{i}} - {{item}}
      </div>
    </cdk-virtual-scroll-viewport>
  `,
  styles: `
    .cdk-virtual-scroll-content-wrapper {
      display: flex;
      flex-direction: column;
    }

    .cdk-virtual-scroll-orientation-horizontal .cdk-virtual-scroll-content-wrapper {
      flex-direction: row;
    }

    .cdk-virtual-scroll-viewport {
      background-color: #f5f5f5;
    }

    .item {
      box-sizing: border-box;
      border: 1px dashed #ccc;
    }
  `,
  encapsulation: ViewEncapsulation.None,
  imports: [ScrollingModule],
  changeDetection: ChangeDetectionStrategy.Eager,
})
class FixedSizeVirtualScrollWithRtlDirection {
  @ViewChild(CdkVirtualScrollViewport, {static: true}) viewport!: CdkVirtualScrollViewport;

  orientation: 'vertical' | 'horizontal' = 'vertical';
  viewportSize = 200;
  viewportCrossSize = 100;
  itemSize = 50;
  minBufferPx = 0;
  maxBufferPx = 0;
  items = Array(10)
    .fill(0)
    .map((_, i) => i);
  trackBy!: TrackByFunction<number>;
  templateCacheSize = 20;

  scrolledToIndex = 0;

  get viewportWidth() {
    return this.orientation == 'horizontal' ? this.viewportSize : this.viewportCrossSize;
  }

  get viewportHeight() {
    return this.orientation == 'horizontal' ? this.viewportCrossSize : this.viewportSize;
  }
}

@Component({
  template: `
    <cdk-virtual-scroll-viewport>
      <div class="item" *cdkVirtualFor="let item of items">{{item}}</div>
    </cdk-virtual-scroll-viewport>
  `,
  styles: `
    .cdk-virtual-scroll-viewport {
      background-color: #f5f5f5;
    }

    .item {
      box-sizing: border-box;
      border: 1px dashed #ccc;
    }
  `,
  imports: [ScrollingModule],
  changeDetection: ChangeDetectionStrategy.Eager,
})
class VirtualScrollWithNoStrategy {
  items = [];
}

@Directive({
  selector: '[injects-view-container]',
})
class InjectsViewContainer {
  viewContainerRef = inject(ViewContainerRef);
}

@Component({
  template: `
    <cdk-virtual-scroll-viewport itemSize="50">
      <div injects-view-container class="item" *cdkVirtualFor="let item of items">{{item}}</div>
    </cdk-virtual-scroll-viewport>
  `,
  styles: `
    .cdk-virtual-scroll-content-wrapper {
      display: flex;
      flex-direction: column;
    }

    .cdk-virtual-scroll-viewport {
      width: 200px;
      height: 200px;
      background-color: #f5f5f5;
    }

    .item {
      width: 100%;
      height: 50px;
      box-sizing: border-box;
      border: 1px dashed #ccc;
    }
  `,
  encapsulation: ViewEncapsulation.None,
  imports: [InjectsViewContainer, ScrollingModule],
  changeDetection: ChangeDetectionStrategy.Eager,
})
class VirtualScrollWithItemInjectingViewContainer {
  @ViewChild(CdkVirtualScrollViewport, {static: true}) viewport!: CdkVirtualScrollViewport;
  itemSize = 50;
  items = Array(20000)
    .fill(0)
    .map((_, i) => i);
}

@Component({
  template: `
    <cdk-virtual-scroll-viewport [itemSize]="itemSize">
      @if (renderVirtualFor) {
        <div class="item" *cdkVirtualFor="let item of items; trackBy: trackBy">{{item}}</div>
      }
    </cdk-virtual-scroll-viewport>
  `,
  styles: `
    .cdk-virtual-scroll-content-wrapper {
      display: flex;
      flex-direction: column;
    }

    .cdk-virtual-scroll-viewport {
      width: 200px;
      height: 200px;
      background-color: #f5f5f5;
    }

    .item {
      width: 100%;
      height: 50px;
      box-sizing: border-box;
      border: 1px dashed #ccc;
    }
  `,
  encapsulation: ViewEncapsulation.None,
  imports: [ScrollingModule],
  changeDetection: ChangeDetectionStrategy.Eager,
})
class DelayedInitializationVirtualScroll {
  @ViewChild(CdkVirtualScrollViewport, {static: true}) viewport!: CdkVirtualScrollViewport;
  itemSize = 50;
  items = Array(20000)
    .fill(0)
    .map((_, i) => i);
  trackBy = jasmine.createSpy('trackBy').and.callFake((item: unknown) => item);
  renderVirtualFor = false;
}

@Component({
  template: `
    <cdk-virtual-scroll-viewport appendOnly itemSize="50">
      <div class="item" *cdkVirtualFor="let item of items">{{item}}</div>
    </cdk-virtual-scroll-viewport>
  `,
  styles: `
    .cdk-virtual-scroll-content-wrapper {
      display: flex;
      flex-direction: column;
    }

    .cdk-virtual-scroll-viewport {
      width: 200px;
      height: 200px;
      background-color: #f5f5f5;
    }

    .item {
      width: 100%;
      height: 50px;
      box-sizing: border-box;
      border: 1px dashed #ccc;
    }
  `,
  encapsulation: ViewEncapsulation.None,
  imports: [ScrollingModule],
  changeDetection: ChangeDetectionStrategy.Eager,
})
class VirtualScrollWithAppendOnly {
  @ViewChild(CdkVirtualScrollViewport, {static: true}) viewport!: CdkVirtualScrollViewport;
  itemSize = 50;
  items = Array(20000)
    .fill(0)
    .map((_, i) => i);
}

@Component({
  template: `
    <div cdkVirtualScrollingElement class="scrolling-element">
      <cdk-virtual-scroll-viewport itemSize="50">
        <div class="item" *cdkVirtualFor="let item of items">{{item}}</div>
      </cdk-virtual-scroll-viewport>
    </div>
  `,
  styles: `
        .cdk-virtual-scroll-content-wrapper {
            display: flex;
            flex-direction: column;
        }

        .cdk-virtual-scroll-viewport {
            width: 200px;
            height: 200px;
            background-color: #f5f5f5;
        }

        .item {
            width: 100%;
            height: 50px;
            box-sizing: border-box;
            border: 1px dashed #ccc;
        }

        .scrolling-element {
            padding-top: 50px;
        }
    `,
  encapsulation: ViewEncapsulation.None,
  imports: [ScrollingModule],
  changeDetection: ChangeDetectionStrategy.Eager,
})
class VirtualScrollWithCustomScrollingElement {
  @ViewChild(CdkVirtualScrollViewport, {static: true}) viewport!: CdkVirtualScrollViewport;
  itemSize = 50;
  items = Array(20000)
    .fill(0)
    .map((_, i) => i);
}

@Component({
  template: `
    <div class="before-virtual-viewport"></div>
    <cdk-virtual-scroll-viewport scrollWindow itemSize="50">
      <div class="item" *cdkVirtualFor="let item of items">{{item}}</div>
    </cdk-virtual-scroll-viewport>
  `,
  styles: `
        .cdk-virtual-scroll-content-wrapper {
            display: flex;
            flex-direction: column;
        }

        .cdk-virtual-scroll-viewport {
            width: 200px;
            height: 200px;
            background-color: #f5f5f5;
        }

        .item {
            width: 100%;
            height: 50px;
            box-sizing: border-box;
            border: 1px dashed #ccc;
        }

        .before-virtual-viewport {
            height: 50px;
        }
    `,
  encapsulation: ViewEncapsulation.None,
  imports: [ScrollingModule],
  changeDetection: ChangeDetectionStrategy.Eager,
})
class VirtualScrollWithScrollableWindow {
  @ViewChild(CdkVirtualScrollViewport, {static: true}) viewport!: CdkVirtualScrollViewport;
  itemSize = 50;
  items = Array(20000)
    .fill(0)
    .map((_, i) => i);
}

@Component({
  template: '<cdk-virtual-scroll-viewport itemSize="50"></cdk-virtual-scroll-viewport>',
  imports: [ScrollingModule],
  changeDetection: ChangeDetectionStrategy.Eager,
})
class VirtualScrollableQuery {
  @ViewChild(CdkScrollable) scrollable!: CdkScrollable;
}
