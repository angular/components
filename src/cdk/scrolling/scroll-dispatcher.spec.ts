import {
  inject,
  TestBed,
  waitForAsync,
  fakeAsync,
  ComponentFixture,
  tick,
} from '@angular/core/testing';
import {Component, ViewChild, ElementRef} from '@angular/core';
import {CdkScrollable, ScrollDispatcher, ScrollingModule} from './public-api';
import {dispatchFakeEvent} from '../testing/private';

describe('ScrollDispatcher', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ScrollingModule, ScrollingComponent, NestedScrollingComponent],
    });
  }));

  describe('Basic usage', () => {
    let scroll: ScrollDispatcher;
    let fixture: ComponentFixture<ScrollingComponent>;

    beforeEach(inject([ScrollDispatcher], (s: ScrollDispatcher) => {
      scroll = s;

      fixture = TestBed.createComponent(ScrollingComponent);
      fixture.detectChanges();
    }));

    it('should be registered with the scrollable directive with the scroll service', () => {
      const componentScrollable = fixture.componentInstance.scrollable;
      expect(scroll.scrollContainers.has(componentScrollable)).toBe(true);
    });

    it('should have the scrollable directive deregistered when the component is destroyed', () => {
      const componentScrollable = fixture.componentInstance.scrollable;
      expect(scroll.scrollContainers.has(componentScrollable)).toBe(true);

      fixture.destroy();
      expect(scroll.scrollContainers.has(componentScrollable)).toBe(false);
    });

    it('should notify through the directive and service that a scroll event occurred', fakeAsync(() => {
      // Listen for notifications from scroll directive
      const scrollable = fixture.componentInstance.scrollable;
      const directiveSpy = jasmine.createSpy('directive scroll callback');
      scrollable.elementScrolled().subscribe(directiveSpy);

      // Listen for notifications from scroll service with a throttle of 100ms
      const throttleTime = 100;
      const serviceSpy = jasmine.createSpy('service scroll callback');
      scroll.scrolled(throttleTime).subscribe(serviceSpy);

      // Emit a scroll event from the scrolling element in our component.
      // This event should be picked up by the scrollable directive and notify.
      // The notification should be picked up by the service.
      dispatchFakeEvent(fixture.componentInstance.scrollingElement.nativeElement, 'scroll', false);

      // The scrollable directive should have notified the service immediately.
      expect(directiveSpy).toHaveBeenCalled();

      // Verify that the throttle is used, the service should wait for the throttle time until
      // sending the notification.
      expect(serviceSpy).not.toHaveBeenCalled();

      // After the throttle time, the notification should be sent.
      tick(throttleTime);
      expect(serviceSpy).toHaveBeenCalled();
    }));

    it('should be able to unsubscribe from the global scrollable', () => {
      const spy = jasmine.createSpy('global scroll callback');
      const subscription = scroll.scrolled(0).subscribe(spy);

      dispatchFakeEvent(document, 'scroll', false);
      expect(spy).toHaveBeenCalledTimes(1);

      subscription.unsubscribe();
      dispatchFakeEvent(document, 'scroll', false);

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should complete the `scrolled` stream on destroy', () => {
      const completeSpy = jasmine.createSpy('complete spy');
      const subscription = scroll.scrolled(0).subscribe({complete: completeSpy});

      scroll.ngOnDestroy();

      expect(completeSpy).toHaveBeenCalled();

      subscription.unsubscribe();
    });

    it('should complete the scrollable stream when it is destroyed', () => {
      const scrollable = fixture.componentInstance.scrollable;
      const spy = jasmine.createSpy('complete spy');
      const subscription = scrollable.elementScrolled().subscribe({complete: spy});

      fixture.destroy();
      expect(spy).toHaveBeenCalled();
      subscription.unsubscribe();
    });

    it('should not register the same scrollable twice', () => {
      const scrollable = fixture.componentInstance.scrollable;
      const scrollSpy = jasmine.createSpy('scroll spy');
      const scrollSubscription = scroll.scrolled(0).subscribe(scrollSpy);

      expect(scroll.scrollContainers.has(scrollable)).toBe(true);

      scroll.register(scrollable);
      scroll.deregister(scrollable);

      dispatchFakeEvent(fixture.componentInstance.scrollingElement.nativeElement, 'scroll');
      fixture.detectChanges();

      expect(scrollSpy).not.toHaveBeenCalled();
      scrollSubscription.unsubscribe();
    });
  });

  describe('Nested scrollables', () => {
    let scroll: ScrollDispatcher;
    let fixture: ComponentFixture<NestedScrollingComponent>;
    let element: ElementRef<HTMLElement>;

    beforeEach(inject([ScrollDispatcher], (s: ScrollDispatcher) => {
      scroll = s;

      fixture = TestBed.createComponent(NestedScrollingComponent);
      fixture.detectChanges();
      element = fixture.componentInstance.interestingElement;
    }));

    it('should be able to identify the containing scrollables of an element', () => {
      const scrollContainers = scroll.getAncestorScrollContainers(element);
      const scrollableElementIds = scrollContainers.map(
        scrollable => scrollable.getElementRef().nativeElement.id,
      );

      expect(scrollableElementIds).toEqual(['scrollable-1', 'scrollable-1a']);
    });

    it('allows a raw HTMLElement', () => {
      const scrollContainers = scroll.getAncestorScrollContainers(element.nativeElement);
      const scrollableElementIds = scrollContainers.map(
        scrollable => scrollable.getElementRef().nativeElement.id,
      );

      expect(scrollableElementIds).toEqual(['scrollable-1', 'scrollable-1a']);
    });

    it('should emit when one of the ancestor scrollable containers is scrolled', () => {
      const spy = jasmine.createSpy('scroll spy');
      const subscription = scroll.ancestorScrolled(element, 0).subscribe(spy);
      const grandparent = fixture.debugElement.nativeElement.querySelector('#scrollable-1');

      dispatchFakeEvent(grandparent, 'scroll', false);
      expect(spy).toHaveBeenCalledTimes(1);

      dispatchFakeEvent(window.document, 'scroll', false);
      expect(spy).toHaveBeenCalledTimes(2);

      subscription.unsubscribe();
    });

    it('should emit when one of the ancestor scrollable containers is scrolled (HTMLElement API)', () => {
      const spy = jasmine.createSpy('scroll spy');
      const subscription = scroll.ancestorScrolled(element.nativeElement, 0).subscribe(spy);
      const grandparent = fixture.debugElement.nativeElement.querySelector('#scrollable-1');

      dispatchFakeEvent(grandparent, 'scroll', false);
      expect(spy).toHaveBeenCalledTimes(1);

      dispatchFakeEvent(window.document, 'scroll', false);
      expect(spy).toHaveBeenCalledTimes(2);

      subscription.unsubscribe();
    });

    it('should not emit when a non-ancestor is scrolled', () => {
      const spy = jasmine.createSpy('scroll spy');
      const subscription = scroll.ancestorScrolled(element, 0).subscribe(spy);
      const stranger = fixture.debugElement.nativeElement.querySelector('#scrollable-2');

      dispatchFakeEvent(stranger, 'scroll', false);
      expect(spy).not.toHaveBeenCalled();

      subscription.unsubscribe();
    });
  });

  describe('lazy subscription', () => {
    let scroll: ScrollDispatcher;

    function hasGlobalListener(): boolean {
      return !!(scroll as any)._cleanupGlobalListener;
    }

    beforeEach(() => {
      scroll = TestBed.inject(ScrollDispatcher);
    });

    it('should lazily add global listeners as service subscriptions are added and removed', () => {
      expect(hasGlobalListener()).withContext('Expected no global listeners on init.').toBe(false);

      const subscription = scroll.scrolled(0).subscribe(() => {});

      expect(hasGlobalListener())
        .withContext('Expected global listeners after a subscription has been added.')
        .toBe(true);

      subscription.unsubscribe();

      expect(hasGlobalListener())
        .withContext(
          'Expected global listeners to have been removed after the subscription has stopped.',
        )
        .toBe(false);
    });

    it('should remove global listeners on unsubscribe, despite any other live scrollables', () => {
      const fixture = TestBed.createComponent(NestedScrollingComponent);
      fixture.detectChanges();

      expect(hasGlobalListener()).withContext('Expected no global listeners on init.').toBe(false);
      expect(scroll.scrollContainers.size).withContext('Expected multiple scrollables').toBe(4);

      const subscription = scroll.scrolled(0).subscribe(() => {});

      expect(hasGlobalListener())
        .withContext('Expected global listeners after a subscription has been added.')
        .toBe(true);

      subscription.unsubscribe();

      expect(hasGlobalListener())
        .withContext(
          'Expected global listeners to have been removed after ' + 'the subscription has stopped.',
        )
        .toBe(false);
      expect(scroll.scrollContainers.size)
        .withContext('Expected scrollable count to stay the same')
        .toBe(4);
    });

    it('should remove the global subscription on destroy', () => {
      expect(hasGlobalListener()).withContext('Expected no global listeners on init.').toBe(false);

      const subscription = scroll.scrolled(0).subscribe(() => {});

      expect(hasGlobalListener())
        .withContext('Expected global listeners after a subscription has been added.')
        .toBe(true);

      scroll.ngOnDestroy();

      expect(hasGlobalListener())
        .withContext(
          'Expected global listeners to have been removed after the subscription has stopped.',
        )
        .toBe(false);

      subscription.unsubscribe();
    });
  });
});

/** Simple component that contains a large div and can be scrolled. */
@Component({
  template: `<div #scrollingElement cdkScrollable style="height: 9999px"></div>`,
  imports: [ScrollingModule],
})
class ScrollingComponent {
  @ViewChild(CdkScrollable) scrollable: CdkScrollable;
  @ViewChild('scrollingElement') scrollingElement: ElementRef<HTMLElement>;
}

/** Component containing nested scrollables. */
@Component({
  template: `
    <div id="scrollable-1" cdkScrollable>
      <div id="scrollable-1a" cdkScrollable>
        <div #interestingElement></div>
      </div>
      <div id="scrollable-1b" cdkScrollable></div>
    </div>
    <div id="scrollable-2" cdkScrollable></div>
  `,
  imports: [ScrollingModule],
})
class NestedScrollingComponent {
  @ViewChild('interestingElement') interestingElement: ElementRef<HTMLElement>;
}
