import {Direction} from '@angular/cdk/bidi';
import {CdkScrollable, ScrollingModule} from '@angular/cdk/scrolling';
import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';

function checkIntersecting(r1: {top: number, left: number, bottom: number, right: number},
                           r2: {top: number, left: number, bottom: number, right: number},
                           expected = true) {
  const actual =
      r1.left < r2.right && r1.right > r2.left && r1.top < r2.bottom && r1.bottom > r2.top;
  if (expected) {
    expect(actual)
        .toBe(expected, `${JSON.stringify(r1)} should intersect with ${JSON.stringify(r2)}`);
  } else {
    expect(actual)
        .toBe(expected, `${JSON.stringify(r1)} should not intersect with ${JSON.stringify(r2)}`);
  }
}

describe('CdkScrollable', () => {
  let fixture: ComponentFixture<ScrollableViewport>;
  let testComponent: ScrollableViewport;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ScrollingModule],
      declarations: [ScrollableViewport],
    }).compileComponents();

    fixture = TestBed.createComponent(ScrollableViewport);
    testComponent = fixture.componentInstance;
  }));

  describe('in LTR context', () => {
    let maxOffset = 0;

    beforeEach(() => {
      fixture.detectChanges();
      maxOffset = testComponent.viewport.nativeElement.scrollHeight -
          testComponent.viewport.nativeElement.clientHeight;
    });

    it('should initially be scrolled to top-left', () => {
      checkIntersecting(testComponent.viewport.nativeElement.getBoundingClientRect(),
          testComponent.topStart.nativeElement.getBoundingClientRect(), true);
      checkIntersecting(testComponent.viewport.nativeElement.getBoundingClientRect(),
          testComponent.topEnd.nativeElement.getBoundingClientRect(), false);
      checkIntersecting(testComponent.viewport.nativeElement.getBoundingClientRect(),
          testComponent.bottomStart.nativeElement.getBoundingClientRect(), false);
      checkIntersecting(testComponent.viewport.nativeElement.getBoundingClientRect(),
          testComponent.bottomEnd.nativeElement.getBoundingClientRect(), false);

      expect(testComponent.scrollable.measureScrollOffset('top')).toBe(0);
      expect(testComponent.scrollable.measureScrollOffset('bottom')).toBe(maxOffset);
      expect(testComponent.scrollable.measureScrollOffset('left')).toBe(0);
      expect(testComponent.scrollable.measureScrollOffset('right')).toBe(maxOffset);
      expect(testComponent.scrollable.measureScrollOffset('start')).toBe(0);
      expect(testComponent.scrollable.measureScrollOffset('end')).toBe(maxOffset);
    });

    it('should scrollTo top-left', () => {
      testComponent.scrollable.scrollTo({top: 0, left: 0});

      checkIntersecting(testComponent.viewport.nativeElement.getBoundingClientRect(),
          testComponent.topStart.nativeElement.getBoundingClientRect(), true);
      checkIntersecting(testComponent.viewport.nativeElement.getBoundingClientRect(),
          testComponent.topEnd.nativeElement.getBoundingClientRect(), false);
      checkIntersecting(testComponent.viewport.nativeElement.getBoundingClientRect(),
          testComponent.bottomStart.nativeElement.getBoundingClientRect(), false);
      checkIntersecting(testComponent.viewport.nativeElement.getBoundingClientRect(),
          testComponent.bottomEnd.nativeElement.getBoundingClientRect(), false);

      expect(testComponent.scrollable.measureScrollOffset('top')).toBe(0);
      expect(testComponent.scrollable.measureScrollOffset('bottom')).toBe(maxOffset);
      expect(testComponent.scrollable.measureScrollOffset('left')).toBe(0);
      expect(testComponent.scrollable.measureScrollOffset('right')).toBe(maxOffset);
      expect(testComponent.scrollable.measureScrollOffset('start')).toBe(0);
      expect(testComponent.scrollable.measureScrollOffset('end')).toBe(maxOffset);
    });

    it('should scrollTo bottom-right', () => {
      testComponent.scrollable.scrollTo({bottom: 0, right: 0});

      checkIntersecting(testComponent.viewport.nativeElement.getBoundingClientRect(),
          testComponent.topStart.nativeElement.getBoundingClientRect(), false);
      checkIntersecting(testComponent.viewport.nativeElement.getBoundingClientRect(),
          testComponent.topEnd.nativeElement.getBoundingClientRect(), false);
      checkIntersecting(testComponent.viewport.nativeElement.getBoundingClientRect(),
          testComponent.bottomStart.nativeElement.getBoundingClientRect(), false);
      checkIntersecting(testComponent.viewport.nativeElement.getBoundingClientRect(),
          testComponent.bottomEnd.nativeElement.getBoundingClientRect(), true);

      expect(testComponent.scrollable.measureScrollOffset('top')).toBe(maxOffset);
      expect(testComponent.scrollable.measureScrollOffset('bottom')).toBe(0);
      expect(testComponent.scrollable.measureScrollOffset('left')).toBe(maxOffset);
      expect(testComponent.scrollable.measureScrollOffset('right')).toBe(0);
      expect(testComponent.scrollable.measureScrollOffset('start')).toBe(maxOffset);
      expect(testComponent.scrollable.measureScrollOffset('end')).toBe(0);
    });

    it('should scroll to top-end', () => {
      testComponent.scrollable.scrollTo({top: 0, end: 0});

      checkIntersecting(testComponent.viewport.nativeElement.getBoundingClientRect(),
          testComponent.topStart.nativeElement.getBoundingClientRect(), false);
      checkIntersecting(testComponent.viewport.nativeElement.getBoundingClientRect(),
          testComponent.topEnd.nativeElement.getBoundingClientRect(), true);
      checkIntersecting(testComponent.viewport.nativeElement.getBoundingClientRect(),
          testComponent.bottomStart.nativeElement.getBoundingClientRect(), false);
      checkIntersecting(testComponent.viewport.nativeElement.getBoundingClientRect(),
          testComponent.bottomEnd.nativeElement.getBoundingClientRect(), false);

      expect(testComponent.scrollable.measureScrollOffset('top')).toBe(0);
      expect(testComponent.scrollable.measureScrollOffset('bottom')).toBe(maxOffset);
      expect(testComponent.scrollable.measureScrollOffset('left')).toBe(maxOffset);
      expect(testComponent.scrollable.measureScrollOffset('right')).toBe(0);
      expect(testComponent.scrollable.measureScrollOffset('start')).toBe(maxOffset);
      expect(testComponent.scrollable.measureScrollOffset('end')).toBe(0);
    });

    it('should scroll to bottom-start', () => {
      testComponent.scrollable.scrollTo({bottom: 0, start: 0});

      checkIntersecting(testComponent.viewport.nativeElement.getBoundingClientRect(),
          testComponent.topStart.nativeElement.getBoundingClientRect(), false);
      checkIntersecting(testComponent.viewport.nativeElement.getBoundingClientRect(),
          testComponent.topEnd.nativeElement.getBoundingClientRect(), false);
      checkIntersecting(testComponent.viewport.nativeElement.getBoundingClientRect(),
          testComponent.bottomStart.nativeElement.getBoundingClientRect(), true);
      checkIntersecting(testComponent.viewport.nativeElement.getBoundingClientRect(),
          testComponent.bottomEnd.nativeElement.getBoundingClientRect(), false);

      expect(testComponent.scrollable.measureScrollOffset('top')).toBe(maxOffset);
      expect(testComponent.scrollable.measureScrollOffset('bottom')).toBe(0);
      expect(testComponent.scrollable.measureScrollOffset('left')).toBe(0);
      expect(testComponent.scrollable.measureScrollOffset('right')).toBe(maxOffset);
      expect(testComponent.scrollable.measureScrollOffset('start')).toBe(0);
      expect(testComponent.scrollable.measureScrollOffset('end')).toBe(maxOffset);
    });
  });

  describe('in RTL context', () => {
    let maxOffset = 0;

    beforeEach(() => {
      testComponent.dir = 'rtl';
      fixture.detectChanges();
      maxOffset = testComponent.viewport.nativeElement.scrollHeight -
          testComponent.viewport.nativeElement.clientHeight;
    });

    it('should initially be scrolled to top-right', () => {
      checkIntersecting(testComponent.viewport.nativeElement.getBoundingClientRect(),
          testComponent.topStart.nativeElement.getBoundingClientRect(), true);
      checkIntersecting(testComponent.viewport.nativeElement.getBoundingClientRect(),
          testComponent.topEnd.nativeElement.getBoundingClientRect(), false);
      checkIntersecting(testComponent.viewport.nativeElement.getBoundingClientRect(),
          testComponent.bottomStart.nativeElement.getBoundingClientRect(), false);
      checkIntersecting(testComponent.viewport.nativeElement.getBoundingClientRect(),
          testComponent.bottomEnd.nativeElement.getBoundingClientRect(), false);

      expect(testComponent.scrollable.measureScrollOffset('top')).toBe(0);
      expect(testComponent.scrollable.measureScrollOffset('bottom')).toBe(maxOffset);
      expect(testComponent.scrollable.measureScrollOffset('left')).toBe(maxOffset);
      expect(testComponent.scrollable.measureScrollOffset('right')).toBe(0);
      expect(testComponent.scrollable.measureScrollOffset('start')).toBe(0);
      expect(testComponent.scrollable.measureScrollOffset('end')).toBe(maxOffset);
    });

    it('should scrollTo top-left', () => {
      testComponent.scrollable.scrollTo({top: 0, left: 0});

      checkIntersecting(testComponent.viewport.nativeElement.getBoundingClientRect(),
          testComponent.topStart.nativeElement.getBoundingClientRect(), false);
      checkIntersecting(testComponent.viewport.nativeElement.getBoundingClientRect(),
          testComponent.topEnd.nativeElement.getBoundingClientRect(), true);
      checkIntersecting(testComponent.viewport.nativeElement.getBoundingClientRect(),
          testComponent.bottomStart.nativeElement.getBoundingClientRect(), false);
      checkIntersecting(testComponent.viewport.nativeElement.getBoundingClientRect(),
          testComponent.bottomEnd.nativeElement.getBoundingClientRect(), false);

      expect(testComponent.scrollable.measureScrollOffset('top')).toBe(0);
      expect(testComponent.scrollable.measureScrollOffset('bottom')).toBe(maxOffset);
      expect(testComponent.scrollable.measureScrollOffset('left')).toBe(0);
      expect(testComponent.scrollable.measureScrollOffset('right')).toBe(maxOffset);
      expect(testComponent.scrollable.measureScrollOffset('start')).toBe(maxOffset);
      expect(testComponent.scrollable.measureScrollOffset('end')).toBe(0);
    });

    it('should scrollTo bottom-right', () => {
      testComponent.scrollable.scrollTo({bottom: 0, right: 0});

      checkIntersecting(testComponent.viewport.nativeElement.getBoundingClientRect(),
          testComponent.topStart.nativeElement.getBoundingClientRect(), false);
      checkIntersecting(testComponent.viewport.nativeElement.getBoundingClientRect(),
          testComponent.topEnd.nativeElement.getBoundingClientRect(), false);
      checkIntersecting(testComponent.viewport.nativeElement.getBoundingClientRect(),
          testComponent.bottomStart.nativeElement.getBoundingClientRect(), true);
      checkIntersecting(testComponent.viewport.nativeElement.getBoundingClientRect(),
          testComponent.bottomEnd.nativeElement.getBoundingClientRect(), false);

      expect(testComponent.scrollable.measureScrollOffset('top')).toBe(maxOffset);
      expect(testComponent.scrollable.measureScrollOffset('bottom')).toBe(0);
      expect(testComponent.scrollable.measureScrollOffset('left')).toBe(maxOffset);
      expect(testComponent.scrollable.measureScrollOffset('right')).toBe(0);
      expect(testComponent.scrollable.measureScrollOffset('start')).toBe(0);
      expect(testComponent.scrollable.measureScrollOffset('end')).toBe(maxOffset);
    });

    it('should scroll to top-end', () => {
      testComponent.scrollable.scrollTo({top: 0, end: 0});

      checkIntersecting(testComponent.viewport.nativeElement.getBoundingClientRect(),
          testComponent.topStart.nativeElement.getBoundingClientRect(), false);
      checkIntersecting(testComponent.viewport.nativeElement.getBoundingClientRect(),
          testComponent.topEnd.nativeElement.getBoundingClientRect(), true);
      checkIntersecting(testComponent.viewport.nativeElement.getBoundingClientRect(),
          testComponent.bottomStart.nativeElement.getBoundingClientRect(), false);
      checkIntersecting(testComponent.viewport.nativeElement.getBoundingClientRect(),
          testComponent.bottomEnd.nativeElement.getBoundingClientRect(), false);

      expect(testComponent.scrollable.measureScrollOffset('top')).toBe(0);
      expect(testComponent.scrollable.measureScrollOffset('bottom')).toBe(maxOffset);
      expect(testComponent.scrollable.measureScrollOffset('left')).toBe(0);
      expect(testComponent.scrollable.measureScrollOffset('right')).toBe(maxOffset);
      expect(testComponent.scrollable.measureScrollOffset('start')).toBe(maxOffset);
      expect(testComponent.scrollable.measureScrollOffset('end')).toBe(0);
    });

    it('should scroll to bottom-start', () => {
      testComponent.scrollable.scrollTo({bottom: 0, start: 0});

      checkIntersecting(testComponent.viewport.nativeElement.getBoundingClientRect(),
          testComponent.topStart.nativeElement.getBoundingClientRect(), false);
      checkIntersecting(testComponent.viewport.nativeElement.getBoundingClientRect(),
          testComponent.topEnd.nativeElement.getBoundingClientRect(), false);
      checkIntersecting(testComponent.viewport.nativeElement.getBoundingClientRect(),
          testComponent.bottomStart.nativeElement.getBoundingClientRect(), true);
      checkIntersecting(testComponent.viewport.nativeElement.getBoundingClientRect(),
          testComponent.bottomEnd.nativeElement.getBoundingClientRect(), false);

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
    <div #viewport class="viewport" cdkScrollable [dir]="dir">
      <div class="row">
        <div #topStart class="cell"></div>
        <div #topEnd class="cell"></div>
      </div>
      <div class="row">
        <div #bottomStart class="cell"></div>
        <div #bottomEnd class="cell"></div>
      </div>
    </div>`,
  styles: [`
    .viewport {
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
  `]
})
class ScrollableViewport {
  @Input() dir: Direction;
  @ViewChild(CdkScrollable) scrollable: CdkScrollable;
  @ViewChild('viewport') viewport: ElementRef<HTMLElement>;
  @ViewChild('topStart') topStart: ElementRef<HTMLElement>;
  @ViewChild('topEnd') topEnd: ElementRef<HTMLElement>;
  @ViewChild('bottomStart') bottomStart: ElementRef<HTMLElement>;
  @ViewChild('bottomEnd') bottomEnd: ElementRef<HTMLElement>;
}
