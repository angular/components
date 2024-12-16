import {CdkVirtualScrollViewport, ScrollingModule} from '@angular/cdk/scrolling';
import {Component, Input, ViewChild, ViewEncapsulation} from '@angular/core';
import {ComponentFixture, TestBed, fakeAsync, flush, waitForAsync} from '@angular/core/testing';
import {ScrollingModule as ExperimentalScrollingModule} from './scrolling-module';

describe('CdkVirtualScrollViewport', () => {
  describe('with AutoSizeVirtualScrollStrategy', () => {
    let fixture: ComponentFixture<AutoSizeVirtualScroll>;
    let testComponent: AutoSizeVirtualScroll;
    let viewport: CdkVirtualScrollViewport;

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [ScrollingModule, ExperimentalScrollingModule, AutoSizeVirtualScroll],
      });
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(AutoSizeVirtualScroll);
      testComponent = fixture.componentInstance;
      viewport = testComponent.viewport;
    });

    it('should render initial state for uniform items', fakeAsync(() => {
      finishInit(fixture);

      const contentWrapper = viewport.elementRef.nativeElement.querySelector(
        '.cdk-virtual-scroll-content-wrapper',
      )!;
      expect(contentWrapper.children.length)
        .withContext('should render 4 50px items to fill 200px space')
        .toBe(4);
    }));

    it('should render extra content if first item is smaller than average', fakeAsync(() => {
      testComponent.items = [50, 200, 200, 200, 200, 200];
      finishInit(fixture);

      const contentWrapper = viewport.elementRef.nativeElement.querySelector(
        '.cdk-virtual-scroll-content-wrapper',
      )!;
      expect(contentWrapper.children.length)
        .withContext(
          'should render 4 items to fill 200px space based on 50px ' + 'estimate from first item',
        )
        .toBe(4);
    }));

    it('should throw if maxBufferPx is less than minBufferPx', fakeAsync(() => {
      expect(() => {
        testComponent.minBufferPx = 100;
        testComponent.maxBufferPx = 99;
        finishInit(fixture);
      }).toThrowError(
        'CDK virtual scroll: maxBufferPx must be greater than or equal to minBufferPx',
      );
    }));

    // TODO(mmalerba): Add test that it corrects the initial render if it didn't render enough,
    // once it actually does that.
  });
});

/** Finish initializing the virtual scroll component at the beginning of a test. */
function finishInit(fixture: ComponentFixture<any>) {
  // On the first cycle we render and measure the viewport.
  fixture.detectChanges();
  flush();

  // On the second cycle we render the items.
  fixture.detectChanges();
  flush();
}

@Component({
  template: `
    <cdk-virtual-scroll-viewport
        autosize [minBufferPx]="minBufferPx" [maxBufferPx]="maxBufferPx"
        [orientation]="orientation" [style.height.px]="viewportHeight"
        [style.width.px]="viewportWidth">
      <div class="item" *cdkVirtualFor="let size of items; let i = index" [style.height.px]="size"
           [style.width.px]="size">
        {{i}} - {{size}}
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
  `,
  encapsulation: ViewEncapsulation.None,
  imports: [ScrollingModule, ExperimentalScrollingModule],
})
class AutoSizeVirtualScroll {
  @ViewChild(CdkVirtualScrollViewport, {static: true}) viewport: CdkVirtualScrollViewport;

  @Input() orientation = 'vertical';
  @Input() viewportSize = 200;
  @Input() viewportCrossSize = 100;
  @Input() minBufferPx = 0;
  @Input() maxBufferPx = 0;
  @Input() items = Array(10).fill(50);

  get viewportWidth() {
    return this.orientation == 'horizontal' ? this.viewportSize : this.viewportCrossSize;
  }

  get viewportHeight() {
    return this.orientation == 'horizontal' ? this.viewportCrossSize : this.viewportSize;
  }
}
