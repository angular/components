import {NgZone, provideZoneChangeDetection} from '@angular/core';
import {TestBed, inject} from '@angular/core/testing';
import {Subscription} from 'rxjs';
import {dispatchFakeEvent} from '../testing/private';
import {ScrollingModule} from './scrolling-module';
import {ViewportRuler} from './viewport-ruler';

describe('ViewportRuler', () => {
  let viewportRuler: ViewportRuler;
  let ngZone: NgZone;

  // Create a very large element that will make the page scrollable.
  let veryLargeElement: HTMLElement = document.createElement('div');
  veryLargeElement.style.width = '6000px';
  veryLargeElement.style.height = '6000px';

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [ScrollingModule],
      providers: [provideZoneChangeDetection(), ViewportRuler],
    }),
  );

  beforeEach(inject([ViewportRuler, NgZone], (v: ViewportRuler, n: NgZone) => {
    viewportRuler = v;
    ngZone = n;
    scrollTo(0, 0);
  }));

  describe('changed event', () => {
    it('should run the resize event outside the NgZone', () => {
      const spy = jasmine.createSpy('viewport changed spy');
      const subscription = viewportRuler.change(0).subscribe(() => spy(NgZone.isInAngularZone()));

      dispatchFakeEvent(window, 'resize');
      expect(spy).toHaveBeenCalledWith(false);
      subscription.unsubscribe();
    });

    it('should run events outside of the NgZone, even if the subcription is from inside', () => {
      const spy = jasmine.createSpy('viewport changed spy');
      let subscription: Subscription;

      ngZone.run(() => {
        subscription = viewportRuler.change(0).subscribe(() => spy(NgZone.isInAngularZone()));
        dispatchFakeEvent(window, 'resize');
      });

      expect(spy).toHaveBeenCalledWith(false);
      subscription!.unsubscribe();
    });
  });
});
