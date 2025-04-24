import {ApplicationRef, Component, Injector} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {filter, take} from 'rxjs/operators';
import {ComponentPortal} from '../../portal';
import {dispatchFakeEvent, dispatchMouseEvent} from '../../testing/private';
import {createOverlayRef} from '../index';
import {OverlayOutsideClickDispatcher} from './overlay-outside-click-dispatcher';

describe('OverlayOutsideClickDispatcher', () => {
  let appRef: ApplicationRef;
  let outsideClickDispatcher: OverlayOutsideClickDispatcher;
  let injector: Injector;

  beforeEach(() => {
    appRef = TestBed.inject(ApplicationRef);
    outsideClickDispatcher = TestBed.inject(OverlayOutsideClickDispatcher);
    injector = TestBed.inject(Injector);
  });

  it('should track overlays in order as they are attached and detached', () => {
    const overlayOne = createOverlayRef(injector);
    const overlayTwo = createOverlayRef(injector);

    outsideClickDispatcher.add(overlayOne);
    outsideClickDispatcher.add(overlayTwo);

    expect(outsideClickDispatcher._attachedOverlays.length)
      .withContext('Expected both overlays to be tracked.')
      .toBe(2);
    expect(outsideClickDispatcher._attachedOverlays[0])
      .withContext('Expected one to be first.')
      .toBe(overlayOne);
    expect(outsideClickDispatcher._attachedOverlays[1])
      .withContext('Expected two to be last.')
      .toBe(overlayTwo);

    outsideClickDispatcher.remove(overlayOne);
    outsideClickDispatcher.add(overlayOne);

    expect(outsideClickDispatcher._attachedOverlays[0])
      .withContext('Expected two to now be first.')
      .toBe(overlayTwo);
    expect(outsideClickDispatcher._attachedOverlays[1])
      .withContext('Expected one to now be last.')
      .toBe(overlayOne);

    overlayOne.dispose();
    overlayTwo.dispose();
  });

  it('should dispatch mouse click events to the attached overlays', () => {
    const overlayOne = createOverlayRef(injector);
    overlayOne.attach(new ComponentPortal(TestComponent));
    const overlayTwo = createOverlayRef(injector);
    overlayTwo.attach(new ComponentPortal(TestComponent));

    const overlayOneSpy = jasmine.createSpy('overlayOne mouse click event spy');
    const overlayTwoSpy = jasmine.createSpy('overlayTwo mouse click event spy');

    overlayOne.outsidePointerEvents().subscribe(overlayOneSpy);
    overlayTwo.outsidePointerEvents().subscribe(overlayTwoSpy);

    outsideClickDispatcher.add(overlayOne);
    outsideClickDispatcher.add(overlayTwo);

    const button = document.createElement('button');
    document.body.appendChild(button);
    button.click();

    expect(overlayOneSpy).toHaveBeenCalled();
    expect(overlayTwoSpy).toHaveBeenCalled();

    button.remove();
    overlayOne.dispose();
    overlayTwo.dispose();
  });

  it('should dispatch auxiliary button click events to the attached overlays', () => {
    const overlayOne = createOverlayRef(injector);
    overlayOne.attach(new ComponentPortal(TestComponent));
    const overlayTwo = createOverlayRef(injector);
    overlayTwo.attach(new ComponentPortal(TestComponent));

    const overlayOneSpy = jasmine.createSpy('overlayOne auxiliary click event spy');
    const overlayTwoSpy = jasmine.createSpy('overlayTwo auxiliary click event spy');

    overlayOne.outsidePointerEvents().subscribe(overlayOneSpy);
    overlayTwo.outsidePointerEvents().subscribe(overlayTwoSpy);

    outsideClickDispatcher.add(overlayOne);
    outsideClickDispatcher.add(overlayTwo);

    const button = document.createElement('button');
    document.body.appendChild(button);
    dispatchFakeEvent(button, 'auxclick');

    expect(overlayOneSpy).toHaveBeenCalled();
    expect(overlayTwoSpy).toHaveBeenCalled();

    button.remove();
    overlayOne.dispose();
    overlayTwo.dispose();
  });

  it('should dispatch mouse click events to the attached overlays even when propagation is stopped', () => {
    const overlayRef = createOverlayRef(injector);
    overlayRef.attach(new ComponentPortal(TestComponent));
    const spy = jasmine.createSpy('overlay mouse click event spy');
    overlayRef.outsidePointerEvents().subscribe(spy);

    outsideClickDispatcher.add(overlayRef);

    const button = document.createElement('button');
    document.body.appendChild(button);
    button.addEventListener('click', event => event.stopPropagation());
    button.click();

    expect(spy).toHaveBeenCalled();

    button.remove();
    overlayRef.dispose();
  });

  it('should dispose of the global click event handler correctly', () => {
    const overlayRef = createOverlayRef(injector);
    const body = document.body;

    spyOn(body, 'addEventListener');
    spyOn(body, 'removeEventListener');

    outsideClickDispatcher.add(overlayRef);
    expect(body.addEventListener).toHaveBeenCalledWith(
      'click',
      jasmine.any(Function),
      jasmine.objectContaining({capture: true}),
    );

    overlayRef.dispose();
    expect(body.removeEventListener).toHaveBeenCalledWith(
      'click',
      jasmine.any(Function),
      jasmine.objectContaining({capture: true}),
    );
  });

  it('should not add the same overlay to the stack multiple times', () => {
    const overlayOne = createOverlayRef(injector);
    const overlayTwo = createOverlayRef(injector);

    outsideClickDispatcher.add(overlayOne);
    outsideClickDispatcher.add(overlayTwo);
    outsideClickDispatcher.add(overlayOne);

    expect(outsideClickDispatcher._attachedOverlays).toEqual([overlayTwo, overlayOne]);

    overlayOne.dispose();
    overlayTwo.dispose();
  });

  it('should dispatch the click event when click is on an element outside the overlay', () => {
    const portal = new ComponentPortal(TestComponent);
    const overlayRef = createOverlayRef(injector);
    overlayRef.attach(portal);
    const button = document.createElement('button');
    document.body.appendChild(button);

    const spy = jasmine.createSpy('overlay mouse click spy');
    overlayRef.outsidePointerEvents().subscribe(spy);

    button.click();
    expect(spy).toHaveBeenCalled();

    button.remove();
    overlayRef.dispose();
  });

  it('should not dispatch the click event when click is on an element inside the overlay', () => {
    const portal = new ComponentPortal(TestComponent);
    const overlayRef = createOverlayRef(injector);
    overlayRef.attach(portal);

    const spy = jasmine.createSpy('overlay mouse click event spy');
    overlayRef.outsidePointerEvents().subscribe(spy);

    overlayRef.overlayElement.click();
    expect(spy).not.toHaveBeenCalled();

    overlayRef.dispose();
  });

  it(
    'should dispatch an event when a click is started outside the overlay and ' +
      'released outside of it',
    () => {
      const portal = new ComponentPortal(TestComponent);
      const overlayRef = createOverlayRef(injector);
      overlayRef.attach(portal);
      const context = document.createElement('div');
      document.body.appendChild(context);

      const spy = jasmine.createSpy('overlay mouse click event spy');
      overlayRef.outsidePointerEvents().subscribe(spy);

      dispatchMouseEvent(context, 'pointerdown');
      context.click();
      expect(spy).toHaveBeenCalled();

      context.remove();
      overlayRef.dispose();
    },
  );

  it(
    'should not dispatch an event when a click is started inside the overlay and ' +
      'released inside of it',
    () => {
      const portal = new ComponentPortal(TestComponent);
      const overlayRef = createOverlayRef(injector);
      overlayRef.attach(portal);

      const spy = jasmine.createSpy('overlay mouse click event spy');
      overlayRef.outsidePointerEvents().subscribe(spy);

      dispatchMouseEvent(overlayRef.overlayElement, 'pointerdown');
      overlayRef.overlayElement.click();
      expect(spy).not.toHaveBeenCalled();

      overlayRef.dispose();
    },
  );

  it(
    'should not dispatch an event when a click is started inside the overlay and ' +
      'released outside of it',
    () => {
      const portal = new ComponentPortal(TestComponent);
      const overlayRef = createOverlayRef(injector);
      overlayRef.attach(portal);
      const context = document.createElement('div');
      document.body.appendChild(context);

      const spy = jasmine.createSpy('overlay mouse click event spy');
      overlayRef.outsidePointerEvents().subscribe(spy);

      dispatchMouseEvent(overlayRef.overlayElement, 'pointerdown');
      context.click();
      expect(spy).not.toHaveBeenCalled();

      context.remove();
      overlayRef.dispose();
    },
  );

  it(
    'should not dispatch an event when a click is started outside the overlay and ' +
      'released inside of it',
    () => {
      const portal = new ComponentPortal(TestComponent);
      const overlayRef = createOverlayRef(injector);
      overlayRef.attach(portal);
      const context = document.createElement('div');
      document.body.appendChild(context);

      const spy = jasmine.createSpy('overlay mouse click event spy');
      overlayRef.outsidePointerEvents().subscribe(spy);

      dispatchMouseEvent(context, 'pointerdown');
      overlayRef.overlayElement.click();
      expect(spy).not.toHaveBeenCalled();

      context.remove();
      overlayRef.dispose();
    },
  );

  it('should dispatch an event when a context menu is triggered outside the overlay', () => {
    const portal = new ComponentPortal(TestComponent);
    const overlayRef = createOverlayRef(injector);
    overlayRef.attach(portal);
    const context = document.createElement('div');
    document.body.appendChild(context);

    const spy = jasmine.createSpy('overlay contextmenu spy');
    overlayRef.outsidePointerEvents().subscribe(spy);

    dispatchMouseEvent(context, 'contextmenu');
    expect(spy).toHaveBeenCalled();

    context.remove();
    overlayRef.dispose();
  });

  it('should not dispatch an event when a context menu is triggered inside the overlay', () => {
    const portal = new ComponentPortal(TestComponent);
    const overlayRef = createOverlayRef(injector);
    overlayRef.attach(portal);

    const spy = jasmine.createSpy('overlay contextmenu spy');
    overlayRef.outsidePointerEvents().subscribe(spy);

    dispatchMouseEvent(overlayRef.overlayElement, 'contextmenu');
    expect(spy).not.toHaveBeenCalled();

    overlayRef.dispose();
  });

  it('should not throw an error when closing out related components via the outsidePointerEvents emitter on background click', () => {
    const firstOverlayRef = createOverlayRef(injector);
    firstOverlayRef.attach(new ComponentPortal(TestComponent));
    const secondOverlayRef = createOverlayRef(injector);
    secondOverlayRef.attach(new ComponentPortal(TestComponent));
    const thirdOverlayRef = createOverlayRef(injector);
    thirdOverlayRef.attach(new ComponentPortal(TestComponent));

    const spy = jasmine.createSpy('background click handler spy').and.callFake(() => {
      // we close out both overlays from a single outside click event
      firstOverlayRef.detach();
      thirdOverlayRef.detach();
    });
    firstOverlayRef.outsidePointerEvents().subscribe(spy);
    secondOverlayRef.outsidePointerEvents().subscribe(spy);
    thirdOverlayRef.outsidePointerEvents().subscribe(spy);

    const backgroundElement = document.createElement('div');
    document.body.appendChild(backgroundElement);

    expect(() => backgroundElement.click()).not.toThrowError();

    expect(spy).toHaveBeenCalled();

    backgroundElement.remove();
    firstOverlayRef.dispose();
    secondOverlayRef.dispose();
    thirdOverlayRef.dispose();
  });

  describe('change detection behavior', () => {
    it('should not run change detection if there is no portal attached to the overlay', () => {
      spyOn(appRef, 'tick');
      const overlayRef = createOverlayRef(injector);
      outsideClickDispatcher.add(overlayRef);

      const context = document.createElement('div');
      document.body.appendChild(context);

      overlayRef.outsidePointerEvents().subscribe();
      dispatchMouseEvent(context, 'click');

      expect(appRef.tick).toHaveBeenCalledTimes(0);
    });

    it('should not run change detection if the click was made outside the overlay but there are no `outsidePointerEvents` observers', () => {
      spyOn(appRef, 'tick');
      const portal = new ComponentPortal(TestComponent);
      const overlayRef = createOverlayRef(injector);
      overlayRef.attach(portal);
      outsideClickDispatcher.add(overlayRef);

      const context = document.createElement('div');
      document.body.appendChild(context);

      dispatchMouseEvent(context, 'click');

      expect(appRef.tick).toHaveBeenCalledTimes(0);
    });

    it('should not run change detection if the click was made inside the overlay and there are `outsidePointerEvents` observers', () => {
      spyOn(appRef, 'tick');
      const portal = new ComponentPortal(TestComponent);
      const overlayRef = createOverlayRef(injector);
      overlayRef.attach(portal);
      outsideClickDispatcher.add(overlayRef);

      overlayRef.outsidePointerEvents().subscribe();
      dispatchMouseEvent(overlayRef.overlayElement, 'click');

      expect(appRef.tick).toHaveBeenCalledTimes(0);
    });

    it('should run change detection if the click was made outside the overlay and there are `outsidePointerEvents` observers', async () => {
      let renders = 0;
      @Component({template: '{{increment()}}'})
      class Counter {
        increment() {
          renders++;
        }
      }
      TestBed.createComponent(Counter);
      function stablePromise() {
        return TestBed.inject(ApplicationRef)
          .isStable.pipe(
            filter(stable => stable),
            take(1),
          )
          .toPromise();
      }
      await stablePromise();
      renders = 0;
      expect(renders).toEqual(0);
      const portal = new ComponentPortal(TestComponent);
      const overlayRef = createOverlayRef(injector);
      overlayRef.attach(portal);
      outsideClickDispatcher.add(overlayRef);

      const context = document.createElement('div');
      document.body.appendChild(context);

      await stablePromise();
      expect(renders).toEqual(1);
      dispatchMouseEvent(context, 'click');
      await stablePromise();
      expect(renders).toEqual(1);

      overlayRef.outsidePointerEvents().subscribe();

      dispatchMouseEvent(context, 'click');
      await stablePromise();
      expect(renders).toEqual(1);
    });
  });
});

@Component({template: 'Hello'})
class TestComponent {}
