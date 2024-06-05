import {Component, ElementRef, ViewChild, provideZoneChangeDetection} from '@angular/core';
import {ComponentFixture, TestBed, inject, waitForAsync} from '@angular/core/testing';
import {dispatchFakeEvent} from '../testing/private';
import {ScrollDispatcher} from './scroll-dispatcher';
import {CdkScrollable} from './scrollable';
import {ScrollingModule} from './scrolling-module';

describe('ScrollDispatcher Zone.js integration', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ScrollingModule, ScrollingComponent],
      providers: [provideZoneChangeDetection()],
    });

    TestBed.compileComponents();
  }));

  describe('Basic usage', () => {
    let scroll: ScrollDispatcher;
    let fixture: ComponentFixture<ScrollingComponent>;

    beforeEach(inject([ScrollDispatcher], (s: ScrollDispatcher) => {
      scroll = s;

      fixture = TestBed.createComponent(ScrollingComponent);
      fixture.detectChanges();
    }));

    it('should not execute the global events in the Angular zone', () => {
      scroll.scrolled(0).subscribe(() => {});
      dispatchFakeEvent(document, 'scroll', false);

      expect(fixture.ngZone!.isStable).toBe(true);
    });

    it('should not execute the scrollable events in the Angular zone', () => {
      dispatchFakeEvent(fixture.componentInstance.scrollingElement.nativeElement, 'scroll');
      expect(fixture.ngZone!.isStable).toBe(true);
    });
  });
});

/** Simple component that contains a large div and can be scrolled. */
@Component({
  template: `<div #scrollingElement cdkScrollable style="height: 9999px"></div>`,
  standalone: true,
  imports: [ScrollingModule],
})
class ScrollingComponent {
  @ViewChild(CdkScrollable) scrollable: CdkScrollable;
  @ViewChild('scrollingElement') scrollingElement: ElementRef<HTMLElement>;
}
