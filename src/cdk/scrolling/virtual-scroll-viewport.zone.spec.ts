import {
  ApplicationRef,
  Component,
  NgZone,
  TrackByFunction,
  ViewChild,
  ViewEncapsulation,
  provideZoneChangeDetection,
} from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  flush,
  inject,
  waitForAsync,
} from '@angular/core/testing';
import {animationFrameScheduler} from 'rxjs';
import {dispatchFakeEvent} from '../testing/private';
import {ScrollingModule} from './scrolling-module';
import {CdkVirtualForOf} from './virtual-for-of';
import {CdkVirtualScrollViewport} from './virtual-scroll-viewport';

describe('CdkVirtualScrollViewport Zone.js intergation', () => {
  describe('with FixedSizeVirtualScrollStrategy', () => {
    let fixture: ComponentFixture<FixedSizeVirtualScroll>;
    let testComponent: FixedSizeVirtualScroll;
    let viewport: CdkVirtualScrollViewport;

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        providers: [provideZoneChangeDetection()],
        imports: [ScrollingModule, FixedSizeVirtualScroll],
      });
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(FixedSizeVirtualScroll);
      testComponent = fixture.componentInstance;
      viewport = testComponent.viewport;
    });

    it('should emit on viewChange inside the Angular zone', fakeAsync(() => {
      const zoneTest = jasmine.createSpy('zone test');
      testComponent.virtualForOf.viewChange.subscribe(() => zoneTest(NgZone.isInAngularZone()));
      finishInit(fixture);
      expect(zoneTest).toHaveBeenCalledWith(true);
    }));

    describe('viewChange change detection behavior', () => {
      let appRef: ApplicationRef;

      beforeEach(inject([ApplicationRef], (ar: ApplicationRef) => {
        appRef = ar;
      }));

      it('should run change detection if there are any viewChange listeners', fakeAsync(() => {
        testComponent.virtualForOf.viewChange.subscribe();
        finishInit(fixture);
        testComponent.items = Array(10).fill(0);
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();
        flush();

        spyOn(appRef, 'tick');

        viewport.scrollToIndex(5);
        triggerScroll(viewport);

        expect(appRef.tick).toHaveBeenCalledTimes(1);
      }));
    });
  });
});

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
})
class FixedSizeVirtualScroll {
  @ViewChild(CdkVirtualScrollViewport, {static: true}) viewport: CdkVirtualScrollViewport;
  // Casting virtualForOf as any so we can spy on private methods
  @ViewChild(CdkVirtualForOf, {static: true}) virtualForOf: any;

  orientation = 'vertical';
  viewportSize = 200;
  viewportCrossSize = 100;
  itemSize = 50;
  minBufferPx = 0;
  maxBufferPx = 0;
  items = Array(10)
    .fill(0)
    .map((_, i) => i);
  trackBy: TrackByFunction<number>;
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

/** Finish initializing the virtual scroll component at the beginning of a test. */
function finishInit(fixture: ComponentFixture<any>) {
  // On the first cycle we render and measure the viewport.
  fixture.changeDetectorRef.markForCheck();
  fixture.detectChanges();
  flush();

  // On the second cycle we render the items.
  fixture.changeDetectorRef.markForCheck();
  fixture.detectChanges();
  flush();

  // Flush the initial fake scroll event.
  animationFrameScheduler.flush();
  flush();
  fixture.changeDetectorRef.markForCheck();
  fixture.detectChanges();
}

/** Trigger a scroll event on the viewport (optionally setting a new scroll offset). */
function triggerScroll(viewport: CdkVirtualScrollViewport, offset?: number) {
  if (offset !== undefined) {
    viewport.scrollToOffset(offset);
  }
  dispatchFakeEvent(viewport.scrollable.getElementRef().nativeElement, 'scroll');
  animationFrameScheduler.flush();
}
