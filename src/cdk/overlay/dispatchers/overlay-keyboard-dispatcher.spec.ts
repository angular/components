import {ESCAPE} from '../../keycodes';
import {ComponentPortal} from '../../portal';
import {ApplicationRef, Component, Injector} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {dispatchKeyboardEvent} from '../../testing/private';
import {createOverlayRef} from '../index';
import {OverlayKeyboardDispatcher} from './overlay-keyboard-dispatcher';

describe('OverlayKeyboardDispatcher', () => {
  let appRef: ApplicationRef;
  let keyboardDispatcher: OverlayKeyboardDispatcher;
  let injector: Injector;

  beforeEach(() => {
    appRef = TestBed.inject(ApplicationRef);
    keyboardDispatcher = TestBed.inject(OverlayKeyboardDispatcher);
    injector = TestBed.inject(Injector);
  });

  it('should track overlays in order as they are attached and detached', () => {
    const overlayOne = createOverlayRef(injector);
    const overlayTwo = createOverlayRef(injector);

    // Attach overlays
    keyboardDispatcher.add(overlayOne);
    keyboardDispatcher.add(overlayTwo);

    expect(keyboardDispatcher._attachedOverlays.length)
      .withContext('Expected both overlays to be tracked.')
      .toBe(2);
    expect(keyboardDispatcher._attachedOverlays[0])
      .withContext('Expected one to be first.')
      .toBe(overlayOne);
    expect(keyboardDispatcher._attachedOverlays[1])
      .withContext('Expected two to be last.')
      .toBe(overlayTwo);

    // Detach first one and re-attach it
    keyboardDispatcher.remove(overlayOne);
    keyboardDispatcher.add(overlayOne);

    expect(keyboardDispatcher._attachedOverlays[0])
      .withContext('Expected two to now be first.')
      .toBe(overlayTwo);
    expect(keyboardDispatcher._attachedOverlays[1])
      .withContext('Expected one to now be last.')
      .toBe(overlayOne);
  });

  it('should dispatch body keyboard events to the most recently attached overlay', () => {
    const overlayOne = createOverlayRef(injector);
    const overlayTwo = createOverlayRef(injector);
    const overlayOneSpy = jasmine.createSpy('overlayOne keyboard event spy');
    const overlayTwoSpy = jasmine.createSpy('overlayTwo keyboard event spy');

    overlayOne.keydownEvents().subscribe(overlayOneSpy);
    overlayTwo.keydownEvents().subscribe(overlayTwoSpy);

    // Attach overlays
    keyboardDispatcher.add(overlayOne);
    keyboardDispatcher.add(overlayTwo);

    dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);

    // Most recent overlay should receive event
    expect(overlayOneSpy).not.toHaveBeenCalled();
    expect(overlayTwoSpy).toHaveBeenCalled();
  });

  it('should not dispatch keyboard events when propagation is stopped', () => {
    const overlayRef = createOverlayRef(injector);
    const spy = jasmine.createSpy('keyboard event spy');
    const button = document.createElement('button');

    document.body.appendChild(button);
    button.addEventListener('keydown', event => event.stopPropagation());

    overlayRef.keydownEvents().subscribe(spy);
    keyboardDispatcher.add(overlayRef);
    dispatchKeyboardEvent(button, 'keydown', ESCAPE);

    expect(spy).not.toHaveBeenCalled();
    button.remove();
  });

  it('should complete the keydown stream on dispose', () => {
    const overlayRef = createOverlayRef(injector);
    const completeSpy = jasmine.createSpy('keydown complete spy');

    overlayRef.keydownEvents().subscribe({complete: completeSpy});

    overlayRef.dispose();

    expect(completeSpy).toHaveBeenCalled();
  });

  it('should stop emitting events to detached overlays', () => {
    const instance = createOverlayRef(injector);
    const spy = jasmine.createSpy('keyboard event spy');

    instance.attach(new ComponentPortal(TestComponent));
    instance.keydownEvents().subscribe(spy);

    dispatchKeyboardEvent(instance.overlayElement, 'keydown', ESCAPE);
    expect(spy).toHaveBeenCalledTimes(1);

    instance.detach();
    dispatchKeyboardEvent(instance.overlayElement, 'keydown', ESCAPE);

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should stop emitting events to disposed overlays', () => {
    const instance = createOverlayRef(injector);
    const spy = jasmine.createSpy('keyboard event spy');

    instance.attach(new ComponentPortal(TestComponent));
    instance.keydownEvents().subscribe(spy);

    dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);
    expect(spy).toHaveBeenCalledTimes(1);

    instance.dispose();
    dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should dispose of the global keyboard event handler correctly', () => {
    const overlayRef = createOverlayRef(injector);
    const body = document.body;
    spyOn(body, 'addEventListener');
    spyOn(body, 'removeEventListener');

    keyboardDispatcher.add(overlayRef);
    expect(body.addEventListener).toHaveBeenCalledWith('keydown', jasmine.any(Function), undefined);

    overlayRef.dispose();
    expect(document.body.removeEventListener).toHaveBeenCalledWith(
      'keydown',
      jasmine.any(Function),
      undefined,
    );
  });

  it('should skip overlays that do not have keydown event subscriptions', () => {
    const overlayOne = createOverlayRef(injector);
    const overlayTwo = createOverlayRef(injector);
    const overlayOneSpy = jasmine.createSpy('overlayOne keyboard event spy');

    overlayOne.keydownEvents().subscribe(overlayOneSpy);
    keyboardDispatcher.add(overlayOne);
    keyboardDispatcher.add(overlayTwo);

    dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);

    expect(overlayOneSpy).toHaveBeenCalled();
  });

  it('should not add the same overlay to the stack multiple times', () => {
    const overlayOne = createOverlayRef(injector);
    const overlayTwo = createOverlayRef(injector);
    const overlayOneSpy = jasmine.createSpy('overlayOne keyboard event spy');
    const overlayTwoSpy = jasmine.createSpy('overlayTwo keyboard event spy');

    overlayOne.keydownEvents().subscribe(overlayOneSpy);
    overlayTwo.keydownEvents().subscribe(overlayTwoSpy);

    keyboardDispatcher.add(overlayOne);
    keyboardDispatcher.add(overlayTwo);
    keyboardDispatcher.add(overlayOne);

    dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);

    expect(keyboardDispatcher._attachedOverlays).toEqual([overlayTwo, overlayOne]);

    expect(overlayTwoSpy).not.toHaveBeenCalled();
    expect(overlayOneSpy).toHaveBeenCalled();
  });

  it('should not run change detection if there are no `keydownEvents` observers', () => {
    spyOn(appRef, 'tick');
    const overlayRef = createOverlayRef(injector);
    keyboardDispatcher.add(overlayRef);

    expect(appRef.tick).toHaveBeenCalledTimes(0);
    dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);
    expect(appRef.tick).toHaveBeenCalledTimes(0);
  });
});

@Component({template: 'Hello'})
class TestComponent {}
