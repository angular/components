import {Direction} from '@angular/cdk/bidi';
import {CdkScrollable, ScrollingModule} from '@angular/cdk/scrolling';
import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

function expectOverlapping(el1: ElementRef<Element>, el2: ElementRef<Element>, expected = true) {
  const r1 = el1.nativeElement.getBoundingClientRect();
  const r2 = el2.nativeElement.getBoundingClientRect();
  const actual =
    r1.left < r2.right && r1.right > r2.left && r1.top < r2.bottom && r1.bottom > r2.top;
  if (expected) {
    expect(actual)
      .withContext(`${JSON.stringify(r1)} should overlap with ${JSON.stringify(r2)}`)
      .toBe(expected);
  } else {
    expect(actual)
      .withContext(`${JSON.stringify(r1)} should not overlap with ${JSON.stringify(r2)}`)
      .toBe(expected);
  }
}

describe('CdkScrollable', () => {
  let fixture: ComponentFixture<ScrollableViewport>;
  let testComponent: ScrollableViewport;
  let maxOffset = 0;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ScrollingModule, ScrollableViewport],
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScrollableViewport);
    fixture.detectChanges();
    testComponent = fixture.componentInstance;
    // Firefox preserves the `scrollTop` value from previous similar containers. This
    // could throw off test assertions and result in flaky results.
    // See: https://bugzilla.mozilla.org/show_bug.cgi?id=959812.
    testComponent.scrollContainer.nativeElement.scrollTop = 0;
  });

  describe('in LTR context', () => {
    beforeEach(() => {
      maxOffset =
        testComponent.scrollContainer.nativeElement.scrollHeight -
        testComponent.scrollContainer.nativeElement.clientHeight;
    });

    it('should initially be scrolled to top-left', () => {
      expectOverlapping(testComponent.scrollContainer, testComponent.firstRowStart, true);
      expectOverlapping(testComponent.scrollContainer, testComponent.firstRowEnd, false);
      expectOverlapping(testComponent.scrollContainer, testComponent.lastRowStart, false);
      expectOverlapping(testComponent.scrollContainer, testComponent.lastRowEnd, false);

      expect(testComponent.scrollable.measureScrollOffset('top')).toBe(0);
      expect(testComponent.scrollable.measureScrollOffset('bottom')).toBe(maxOffset);
      expect(testComponent.scrollable.measureScrollOffset('left')).toBe(0);
      expect(testComponent.scrollable.measureScrollOffset('right')).toBe(maxOffset);
      expect(testComponent.scrollable.measureScrollOffset('start')).toBe(0);
      expect(testComponent.scrollable.measureScrollOffset('end')).toBe(maxOffset);
    });

    it('should scrollTo top-left', () => {
      testComponent.scrollable.scrollTo({top: 0, left: 0});

      expectOverlapping(testComponent.scrollContainer, testComponent.firstRowStart, true);
      expectOverlapping(testComponent.scrollContainer, testComponent.firstRowEnd, false);
      expectOverlapping(testComponent.scrollContainer, testComponent.lastRowStart, false);
      expectOverlapping(testComponent.scrollContainer, testComponent.lastRowEnd, false);

      expect(testComponent.scrollable.measureScrollOffset('top')).toBe(0);
      expect(testComponent.scrollable.measureScrollOffset('bottom')).toBe(maxOffset);
      expect(testComponent.scrollable.measureScrollOffset('left')).toBe(0);
      expect(testComponent.scrollable.measureScrollOffset('right')).toBe(maxOffset);
      expect(testComponent.scrollable.measureScrollOffset('start')).toBe(0);
      expect(testComponent.scrollable.measureScrollOffset('end')).toBe(maxOffset);
    });

    it('should scrollTo bottom-right', () => {
      testComponent.scrollable.scrollTo({bottom: 0, right: 0});

      expectOverlapping(testComponent.scrollContainer, testComponent.firstRowStart, false);
      expectOverlapping(testComponent.scrollContainer, testComponent.firstRowEnd, false);
      expectOverlapping(testComponent.scrollContainer, testComponent.lastRowStart, false);
      expectOverlapping(testComponent.scrollContainer, testComponent.lastRowEnd, true);

      expect(testComponent.scrollable.measureScrollOffset('top')).toBe(maxOffset);
      expect(testComponent.scrollable.measureScrollOffset('bottom')).toBe(0);
      expect(testComponent.scrollable.measureScrollOffset('left')).toBe(maxOffset);
      expect(testComponent.scrollable.measureScrollOffset('right')).toBe(0);
      expect(testComponent.scrollable.measureScrollOffset('start')).toBe(maxOffset);
      expect(testComponent.scrollable.measureScrollOffset('end')).toBe(0);
    });

    it('should scroll to top-end', () => {
      testComponent.scrollable.scrollTo({top: 0, end: 0});

      expectOverlapping(testComponent.scrollContainer, testComponent.firstRowStart, false);
      expectOverlapping(testComponent.scrollContainer, testComponent.firstRowEnd, true);
      expectOverlapping(testComponent.scrollContainer, testComponent.lastRowStart, false);
      expectOverlapping(testComponent.scrollContainer, testComponent.lastRowEnd, false);

      expect(testComponent.scrollable.measureScrollOffset('top')).toBe(0);
      expect(testComponent.scrollable.measureScrollOffset('bottom')).toBe(maxOffset);
      expect(testComponent.scrollable.measureScrollOffset('left')).toBe(maxOffset);
      expect(testComponent.scrollable.measureScrollOffset('right')).toBe(0);
      expect(testComponent.scrollable.measureScrollOffset('start')).toBe(maxOffset);
      expect(testComponent.scrollable.measureScrollOffset('end')).toBe(0);
    });

    it('should scroll to bottom-start', () => {
      testComponent.scrollable.scrollTo({bottom: 0, start: 0});

      expectOverlapping(testComponent.scrollContainer, testComponent.firstRowStart, false);
      expectOverlapping(testComponent.scrollContainer, testComponent.firstRowEnd, false);
      expectOverlapping(testComponent.scrollContainer, testComponent.lastRowStart, true);
      expectOverlapping(testComponent.scrollContainer, testComponent.lastRowEnd, false);

      expect(testComponent.scrollable.measureScrollOffset('top')).toBe(maxOffset);
      expect(testComponent.scrollable.measureScrollOffset('bottom')).toBe(0);
      expect(testComponent.scrollable.measureScrollOffset('left')).toBe(0);
      expect(testComponent.scrollable.measureScrollOffset('right')).toBe(maxOffset);
      expect(testComponent.scrollable.measureScrollOffset('start')).toBe(0);
      expect(testComponent.scrollable.measureScrollOffset('end')).toBe(maxOffset);
    });
  });

  describe('in RTL context', () => {
    beforeEach(() => {
      testComponent.dir = 'rtl';
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      maxOffset =
        testComponent.scrollContainer.nativeElement.scrollHeight -
        testComponent.scrollContainer.nativeElement.clientHeight;
    });

    it('should initially be scrolled to top-right', () => {
      expectOverlapping(testComponent.scrollContainer, testComponent.firstRowStart, true);
      expectOverlapping(testComponent.scrollContainer, testComponent.firstRowEnd, false);
      expectOverlapping(testComponent.scrollContainer, testComponent.lastRowStart, false);
      expectOverlapping(testComponent.scrollContainer, testComponent.lastRowEnd, false);

      expect(testComponent.scrollable.measureScrollOffset('top')).toBe(0);
      expect(testComponent.scrollable.measureScrollOffset('bottom')).toBe(maxOffset);
      expect(testComponent.scrollable.measureScrollOffset('left')).toBe(maxOffset);
      expect(testComponent.scrollable.measureScrollOffset('right')).toBe(0);
      expect(testComponent.scrollable.measureScrollOffset('start')).toBe(0);
      expect(testComponent.scrollable.measureScrollOffset('end')).toBe(maxOffset);
    });

    it('should scrollTo top-left', () => {
      testComponent.scrollable.scrollTo({top: 0, left: 0});

      expectOverlapping(testComponent.scrollContainer, testComponent.firstRowStart, false);
      expectOverlapping(testComponent.scrollContainer, testComponent.firstRowEnd, true);
      expectOverlapping(testComponent.scrollContainer, testComponent.lastRowStart, false);
      expectOverlapping(testComponent.scrollContainer, testComponent.lastRowEnd, false);

      expect(testComponent.scrollable.measureScrollOffset('top')).toBe(0);
      expect(testComponent.scrollable.measureScrollOffset('bottom')).toBe(maxOffset);
      expect(testComponent.scrollable.measureScrollOffset('left')).toBe(0);
      expect(testComponent.scrollable.measureScrollOffset('right')).toBe(maxOffset);
      expect(testComponent.scrollable.measureScrollOffset('start')).toBe(maxOffset);
      expect(testComponent.scrollable.measureScrollOffset('end')).toBe(0);
    });

    it('should scrollTo bottom-right', () => {
      testComponent.scrollable.scrollTo({bottom: 0, right: 0});

      expectOverlapping(testComponent.scrollContainer, testComponent.firstRowStart, false);
      expectOverlapping(testComponent.scrollContainer, testComponent.firstRowEnd, false);
      expectOverlapping(testComponent.scrollContainer, testComponent.lastRowStart, true);
      expectOverlapping(testComponent.scrollContainer, testComponent.lastRowEnd, false);

      expect(testComponent.scrollable.measureScrollOffset('top')).toBe(maxOffset);
      expect(testComponent.scrollable.measureScrollOffset('bottom')).toBe(0);
      expect(testComponent.scrollable.measureScrollOffset('left')).toBe(maxOffset);
      expect(testComponent.scrollable.measureScrollOffset('right')).toBe(0);
      expect(testComponent.scrollable.measureScrollOffset('start')).toBe(0);
      expect(testComponent.scrollable.measureScrollOffset('end')).toBe(maxOffset);
    });

    it('should scroll to top-end', () => {
      testComponent.scrollable.scrollTo({top: 0, end: 0});

      expectOverlapping(testComponent.scrollContainer, testComponent.firstRowStart, false);
      expectOverlapping(testComponent.scrollContainer, testComponent.firstRowEnd, true);
      expectOverlapping(testComponent.scrollContainer, testComponent.lastRowStart, false);
      expectOverlapping(testComponent.scrollContainer, testComponent.lastRowEnd, false);

      expect(testComponent.scrollable.measureScrollOffset('top')).toBe(0);
      expect(testComponent.scrollable.measureScrollOffset('bottom')).toBe(maxOffset);
      expect(testComponent.scrollable.measureScrollOffset('left')).toBe(0);
      expect(testComponent.scrollable.measureScrollOffset('right')).toBe(maxOffset);
      expect(testComponent.scrollable.measureScrollOffset('start')).toBe(maxOffset);
      expect(testComponent.scrollable.measureScrollOffset('end')).toBe(0);
    });

    it('should scroll to bottom-start', () => {
      testComponent.scrollable.scrollTo({bottom: 0, start: 0});

      expectOverlapping(testComponent.scrollContainer, testComponent.firstRowStart, false);
      expectOverlapping(testComponent.scrollContainer, testComponent.firstRowEnd, false);
      expectOverlapping(testComponent.scrollContainer, testComponent.lastRowStart, true);
      expectOverlapping(testComponent.scrollContainer, testComponent.lastRowEnd, false);

      expect(testComponent.scrollable.measureScrollOffset('top')).toBe(maxOffset);
      expect(testComponent.scrollable.measureScrollOffset('bottom')).toBe(0);
      expect(testComponent.scrollable.measureScrollOffset('left')).toBe(maxOffset);
      expect(testComponent.scrollable.measureScrollOffset('right')).toBe(0);
      expect(testComponent.scrollable.measureScrollOffset('start')).toBe(0);
      expect(testComponent.scrollable.measureScrollOffset('end')).toBe(maxOffset);
    });
  });
});

@Component({
  template: `
    <div #scrollContainer class="scroll-container" cdkScrollable [dir]="dir">
      <div class="row">
        <div #firstRowStart class="cell"></div>
        <div #firstRowEnd class="cell"></div>
      </div>
      <div class="row">
        <div #lastRowStart class="cell"></div>
        <div #lastRowEnd class="cell"></div>
      </div>
    </div>`,
  styles: `
    .scroll-container {
      width: 100px;
      height: 100px;
      overflow: auto;
    }

    .row {
      display: flex;
      flex-direction: row;
    }

    .cell {
      flex: none;
      width: 100px;
      height: 100px;
    }
  `,
  imports: [ScrollingModule],
})
class ScrollableViewport {
  @Input() dir: Direction;
  @ViewChild(CdkScrollable) scrollable: CdkScrollable;
  @ViewChild('scrollContainer') scrollContainer: ElementRef<Element>;
  @ViewChild('firstRowStart') firstRowStart: ElementRef<Element>;
  @ViewChild('firstRowEnd') firstRowEnd: ElementRef<Element>;
  @ViewChild('lastRowStart') lastRowStart: ElementRef<Element>;
  @ViewChild('lastRowEnd') lastRowEnd: ElementRef<Element>;
}
