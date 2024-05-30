import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ErrorHandler,
  QueryList,
  ViewChild,
  ViewChildren,
  ViewEncapsulation,
  signal,
} from '@angular/core';
import {fakeAsync, flush, tick} from '@angular/core/testing';
import {
  dispatchEvent,
  createMouseEvent,
  createTouchEvent,
  dispatchFakeEvent,
  dispatchMouseEvent,
  dispatchTouchEvent,
} from '@angular/cdk/testing/private';
import {_supportsShadowDom} from '@angular/cdk/platform';
import {CdkDragHandle} from './drag-handle';
import {CdkDrag} from './drag';
import {CDK_DRAG_CONFIG, DragAxis, DragDropConfig} from './config';
import {DragRef, Point} from '../drag-ref';
import {
  createComponent,
  continueDraggingViaTouch,
  dragElementViaMouse,
  dragElementViaTouch,
  makeScrollable,
  startDraggingViaMouse,
  startDraggingViaTouch,
} from './test-utils.spec';

describe('Standalone CdkDrag', () => {
  describe('mouse dragging', () => {
    it('should drag an element freely to a particular position', fakeAsync(() => {
      const fixture = createComponent(StandaloneDraggable);
      fixture.detectChanges();
      const dragElement = fixture.componentInstance.dragElement.nativeElement;

      expect(dragElement.style.transform).toBeFalsy();
      dragElementViaMouse(fixture, dragElement, 50, 100);
      expect(dragElement.style.transform).toBe('translate3d(50px, 100px, 0px)');
    }));

    it('should drag an element freely to a particular position when the page is scrolled', fakeAsync(() => {
      const fixture = createComponent(StandaloneDraggable);
      fixture.detectChanges();

      const cleanup = makeScrollable();
      const dragElement = fixture.componentInstance.dragElement.nativeElement;

      scrollTo(0, 500);
      expect(dragElement.style.transform).toBeFalsy();
      dragElementViaMouse(fixture, dragElement, 50, 100);
      expect(dragElement.style.transform).toBe('translate3d(50px, 100px, 0px)');
      cleanup();
    }));

    it('should continue dragging the element from where it was left off', fakeAsync(() => {
      const fixture = createComponent(StandaloneDraggable);
      fixture.detectChanges();
      const dragElement = fixture.componentInstance.dragElement.nativeElement;

      expect(dragElement.style.transform).toBeFalsy();

      dragElementViaMouse(fixture, dragElement, 50, 100);
      expect(dragElement.style.transform).toBe('translate3d(50px, 100px, 0px)');

      dragElementViaMouse(fixture, dragElement, 100, 200);
      expect(dragElement.style.transform).toBe('translate3d(150px, 300px, 0px)');
    }));

    it('should continue dragging from where it was left off when the page is scrolled', fakeAsync(() => {
      const fixture = createComponent(StandaloneDraggable);
      fixture.detectChanges();

      const dragElement = fixture.componentInstance.dragElement.nativeElement;
      const cleanup = makeScrollable();

      scrollTo(0, 500);
      expect(dragElement.style.transform).toBeFalsy();

      dragElementViaMouse(fixture, dragElement, 50, 100);
      expect(dragElement.style.transform).toBe('translate3d(50px, 100px, 0px)');

      dragElementViaMouse(fixture, dragElement, 100, 200);
      expect(dragElement.style.transform).toBe('translate3d(150px, 300px, 0px)');

      cleanup();
    }));

    it('should not drag an element with the right mouse button', fakeAsync(() => {
      const fixture = createComponent(StandaloneDraggable);
      fixture.detectChanges();
      const dragElement = fixture.componentInstance.dragElement.nativeElement;
      const event = createMouseEvent('mousedown', 50, 100, 2);

      expect(dragElement.style.transform).toBeFalsy();

      dispatchEvent(dragElement, event);
      fixture.detectChanges();

      dispatchMouseEvent(document, 'mousemove', 50, 100);
      fixture.detectChanges();

      dispatchMouseEvent(document, 'mouseup');
      fixture.detectChanges();

      expect(dragElement.style.transform).toBeFalsy();
    }));

    it('should not drag the element if it was not moved more than the minimum distance', fakeAsync(() => {
      const fixture = createComponent(StandaloneDraggable, {dragDistance: 5});
      fixture.detectChanges();
      const dragElement = fixture.componentInstance.dragElement.nativeElement;

      expect(dragElement.style.transform).toBeFalsy();
      dragElementViaMouse(fixture, dragElement, 2, 2);
      expect(dragElement.style.transform).toBeFalsy();
    }));

    it('should be able to stop dragging after a double click', fakeAsync(() => {
      const fixture = createComponent(StandaloneDraggable, {dragDistance: 5});
      fixture.detectChanges();
      const dragElement = fixture.componentInstance.dragElement.nativeElement;

      expect(dragElement.style.transform).toBeFalsy();

      dispatchMouseEvent(dragElement, 'mousedown');
      fixture.detectChanges();
      dispatchMouseEvent(document, 'mouseup');
      fixture.detectChanges();
      dispatchMouseEvent(dragElement, 'mousedown');
      fixture.detectChanges();
      dispatchMouseEvent(document, 'mouseup');
      fixture.detectChanges();

      dragElementViaMouse(fixture, dragElement, 50, 50);
      dispatchMouseEvent(document, 'mousemove', 100, 100);
      fixture.detectChanges();

      expect(dragElement.style.transform).toBeFalsy();
    }));

    it('should preserve the previous `transform` value', fakeAsync(() => {
      const fixture = createComponent(StandaloneDraggable);
      fixture.detectChanges();
      const dragElement = fixture.componentInstance.dragElement.nativeElement;

      dragElement.style.transform = 'translateX(-50%)';
      dragElementViaMouse(fixture, dragElement, 50, 100);
      expect(dragElement.style.transform).toBe('translate3d(50px, 100px, 0px) translateX(-50%)');
    }));

    it('should not generate multiple own `translate3d` values', fakeAsync(() => {
      const fixture = createComponent(StandaloneDraggable);
      fixture.detectChanges();
      const dragElement = fixture.componentInstance.dragElement.nativeElement;

      dragElement.style.transform = 'translateY(-50%)';

      dragElementViaMouse(fixture, dragElement, 50, 100);
      expect(dragElement.style.transform).toBe('translate3d(50px, 100px, 0px) translateY(-50%)');

      dragElementViaMouse(fixture, dragElement, 100, 200);
      expect(dragElement.style.transform).toBe('translate3d(150px, 300px, 0px) translateY(-50%)');
    }));

    it('should prevent the `mousedown` action for native draggable elements', fakeAsync(() => {
      const fixture = createComponent(StandaloneDraggable);
      fixture.detectChanges();
      const dragElement = fixture.componentInstance.dragElement.nativeElement;

      dragElement.draggable = true;

      const mousedownEvent = createMouseEvent('mousedown', 50, 50);
      Object.defineProperty(mousedownEvent, 'target', {get: () => dragElement});
      spyOn(mousedownEvent, 'preventDefault').and.callThrough();
      dispatchEvent(dragElement, mousedownEvent);
      fixture.detectChanges();

      dispatchMouseEvent(document, 'mousemove', 50, 50);
      fixture.detectChanges();

      expect(mousedownEvent.preventDefault).toHaveBeenCalled();
    }));

    it('should not start dragging an element with a fake mousedown event', fakeAsync(() => {
      const fixture = createComponent(StandaloneDraggable);
      fixture.detectChanges();
      const dragElement = fixture.componentInstance.dragElement.nativeElement;
      const event = createMouseEvent('mousedown', 0, 0);

      Object.defineProperties(event, {
        buttons: {get: () => 0},
        detail: {get: () => 0},
      });

      expect(dragElement.style.transform).toBeFalsy();

      dispatchEvent(dragElement, event);
      fixture.detectChanges();

      dispatchMouseEvent(document, 'mousemove', 20, 100);
      fixture.detectChanges();
      dispatchMouseEvent(document, 'mousemove', 50, 100);
      fixture.detectChanges();

      dispatchMouseEvent(document, 'mouseup');
      fixture.detectChanges();

      expect(dragElement.style.transform).toBeFalsy();
    }));

    it('should prevent the default dragstart action', fakeAsync(() => {
      const fixture = createComponent(StandaloneDraggable);
      fixture.detectChanges();
      const event = dispatchFakeEvent(
        fixture.componentInstance.dragElement.nativeElement,
        'dragstart',
      );
      fixture.detectChanges();

      expect(event.defaultPrevented).toBe(true);
    }));

    it('should not prevent the default dragstart action when dragging is disabled', fakeAsync(() => {
      const fixture = createComponent(StandaloneDraggable);
      fixture.componentInstance.dragDisabled.set(true);
      fixture.detectChanges();
      const event = dispatchFakeEvent(
        fixture.componentInstance.dragElement.nativeElement,
        'dragstart',
      );
      fixture.detectChanges();

      expect(event.defaultPrevented).toBe(false);
    }));
  });

  describe('touch dragging', () => {
    it('should drag an element freely to a particular position', fakeAsync(() => {
      const fixture = createComponent(StandaloneDraggable);
      fixture.detectChanges();
      const dragElement = fixture.componentInstance.dragElement.nativeElement;

      expect(dragElement.style.transform).toBeFalsy();
      dragElementViaTouch(fixture, dragElement, 50, 100);
      expect(dragElement.style.transform).toBe('translate3d(50px, 100px, 0px)');
    }));

    it('should drag an element freely to a particular position when the page is scrolled', fakeAsync(() => {
      const fixture = createComponent(StandaloneDraggable);
      fixture.detectChanges();

      const dragElement = fixture.componentInstance.dragElement.nativeElement;
      const cleanup = makeScrollable();

      scrollTo(0, 500);
      expect(dragElement.style.transform).toBeFalsy();
      dragElementViaTouch(fixture, dragElement, 50, 100);
      expect(dragElement.style.transform).toBe('translate3d(50px, 100px, 0px)');
      cleanup();
    }));

    it('should continue dragging the element from where it was left off', fakeAsync(() => {
      const fixture = createComponent(StandaloneDraggable);
      fixture.detectChanges();
      const dragElement = fixture.componentInstance.dragElement.nativeElement;

      expect(dragElement.style.transform).toBeFalsy();

      dragElementViaTouch(fixture, dragElement, 50, 100);
      expect(dragElement.style.transform).toBe('translate3d(50px, 100px, 0px)');

      dragElementViaTouch(fixture, dragElement, 100, 200);
      expect(dragElement.style.transform).toBe('translate3d(150px, 300px, 0px)');
    }));

    it('should continue dragging from where it was left off when the page is scrolled', fakeAsync(() => {
      const fixture = createComponent(StandaloneDraggable);
      fixture.detectChanges();

      const dragElement = fixture.componentInstance.dragElement.nativeElement;
      const cleanup = makeScrollable();

      scrollTo(0, 500);
      expect(dragElement.style.transform).toBeFalsy();

      dragElementViaTouch(fixture, dragElement, 50, 100);
      expect(dragElement.style.transform).toBe('translate3d(50px, 100px, 0px)');

      dragElementViaTouch(fixture, dragElement, 100, 200);
      expect(dragElement.style.transform).toBe('translate3d(150px, 300px, 0px)');

      cleanup();
    }));

    it('should prevent the default `touchmove` action on the page while dragging', fakeAsync(() => {
      const fixture = createComponent(StandaloneDraggable);
      fixture.detectChanges();

      dispatchTouchEvent(fixture.componentInstance.dragElement.nativeElement, 'touchstart');
      fixture.detectChanges();

      expect(dispatchTouchEvent(document, 'touchmove').defaultPrevented)
        .withContext('Expected initial touchmove to be prevented.')
        .toBe(true);
      expect(dispatchTouchEvent(document, 'touchmove').defaultPrevented)
        .withContext('Expected subsequent touchmose to be prevented.')
        .toBe(true);

      dispatchTouchEvent(document, 'touchend');
      fixture.detectChanges();
    }));

    it('should not prevent `touchstart` action for native draggable elements', fakeAsync(() => {
      const fixture = createComponent(StandaloneDraggable);
      fixture.detectChanges();
      const dragElement = fixture.componentInstance.dragElement.nativeElement;

      dragElement.draggable = true;

      const touchstartEvent = createTouchEvent('touchstart', 50, 50);
      Object.defineProperty(touchstartEvent, 'target', {get: () => dragElement});
      spyOn(touchstartEvent, 'preventDefault').and.callThrough();
      dispatchEvent(dragElement, touchstartEvent);
      fixture.detectChanges();

      dispatchTouchEvent(document, 'touchmove');
      fixture.detectChanges();

      expect(touchstartEvent.preventDefault).not.toHaveBeenCalled();
    }));

    it('should not start dragging an element with a fake touchstart event', fakeAsync(() => {
      const fixture = createComponent(StandaloneDraggable);
      fixture.detectChanges();
      const dragElement = fixture.componentInstance.dragElement.nativeElement;
      const event = createTouchEvent('touchstart', 50, 50) as TouchEvent;

      Object.defineProperties(event.touches[0], {
        identifier: {get: () => -1},
        radiusX: {get: () => null},
        radiusY: {get: () => null},
      });

      expect(dragElement.style.transform).toBeFalsy();

      dispatchEvent(dragElement, event);
      fixture.detectChanges();

      dispatchTouchEvent(document, 'touchmove', 20, 100);
      fixture.detectChanges();
      dispatchTouchEvent(document, 'touchmove', 50, 100);
      fixture.detectChanges();

      dispatchTouchEvent(document, 'touchend');
      fixture.detectChanges();

      expect(dragElement.style.transform).toBeFalsy();
    }));
  });

  describe('mouse dragging when initial transform is none', () => {
    it('should drag an element freely to a particular position', fakeAsync(() => {
      const fixture = createComponent(StandaloneDraggable);
      fixture.detectChanges();
      const dragElement = fixture.componentInstance.dragElement.nativeElement;
      dragElement.style.transform = 'none';

      dragElementViaMouse(fixture, dragElement, 50, 100);
      expect(dragElement.style.transform).toBe('translate3d(50px, 100px, 0px)');
    }));
  });

  it('should dispatch an event when the user has started dragging', fakeAsync(() => {
    const fixture = createComponent(StandaloneDraggable);
    fixture.detectChanges();

    startDraggingViaMouse(fixture, fixture.componentInstance.dragElement.nativeElement);

    expect(fixture.componentInstance.startedSpy).toHaveBeenCalled();

    const event = fixture.componentInstance.startedSpy.calls.mostRecent().args[0];

    // Assert the event like this, rather than `toHaveBeenCalledWith`, because Jasmine will
    // go into an infinite loop trying to stringify the event, if the test fails.
    expect(event).toEqual({
      source: fixture.componentInstance.dragInstance,
      event: jasmine.anything(),
    });
  }));

  it('should dispatch an event when the user has stopped dragging', fakeAsync(() => {
    const fixture = createComponent(StandaloneDraggable);
    fixture.detectChanges();

    dragElementViaMouse(fixture, fixture.componentInstance.dragElement.nativeElement, 5, 10);

    expect(fixture.componentInstance.endedSpy).toHaveBeenCalled();

    const event = fixture.componentInstance.endedSpy.calls.mostRecent().args[0];

    // Assert the event like this, rather than `toHaveBeenCalledWith`, because Jasmine will
    // go into an infinite loop trying to stringify the event, if the test fails.
    expect(event).toEqual({
      source: fixture.componentInstance.dragInstance,
      distance: {x: jasmine.any(Number), y: jasmine.any(Number)},
      dropPoint: {x: jasmine.any(Number), y: jasmine.any(Number)},
      event: jasmine.anything(),
    });
  }));

  it('should include the drag distance in the ended event', fakeAsync(() => {
    const fixture = createComponent(StandaloneDraggable);
    fixture.detectChanges();

    dragElementViaMouse(fixture, fixture.componentInstance.dragElement.nativeElement, 25, 30);
    let event = fixture.componentInstance.endedSpy.calls.mostRecent().args[0];

    expect(event).toEqual({
      source: jasmine.anything(),
      distance: {x: 25, y: 30},
      dropPoint: {x: 25, y: 30},
      event: jasmine.anything(),
    });

    dragElementViaMouse(fixture, fixture.componentInstance.dragElement.nativeElement, 40, 50);
    event = fixture.componentInstance.endedSpy.calls.mostRecent().args[0];

    expect(event).toEqual({
      source: jasmine.anything(),
      distance: {x: 40, y: 50},
      dropPoint: {x: 40, y: 50},
      event: jasmine.anything(),
    });
  }));

  it('should emit when the user is moving the drag element', () => {
    const fixture = createComponent(StandaloneDraggable);
    fixture.detectChanges();

    const spy = jasmine.createSpy('move spy');
    const subscription = fixture.componentInstance.dragInstance.moved.subscribe(spy);

    dragElementViaMouse(fixture, fixture.componentInstance.dragElement.nativeElement, 5, 10);
    expect(spy).toHaveBeenCalledTimes(1);

    dragElementViaMouse(fixture, fixture.componentInstance.dragElement.nativeElement, 10, 20);
    expect(spy).toHaveBeenCalledTimes(2);

    subscription.unsubscribe();
  });

  it('should not emit events if it was not moved more than the minimum distance', () => {
    const fixture = createComponent(StandaloneDraggable, {dragDistance: 5});
    fixture.detectChanges();

    const moveSpy = jasmine.createSpy('move spy');
    const subscription = fixture.componentInstance.dragInstance.moved.subscribe(moveSpy);

    dragElementViaMouse(fixture, fixture.componentInstance.dragElement.nativeElement, 2, 2);

    expect(fixture.componentInstance.startedSpy).not.toHaveBeenCalled();
    expect(fixture.componentInstance.releasedSpy).not.toHaveBeenCalled();
    expect(fixture.componentInstance.endedSpy).not.toHaveBeenCalled();
    expect(moveSpy).not.toHaveBeenCalled();
    subscription.unsubscribe();
  });

  it('should complete the `moved` stream on destroy', () => {
    const fixture = createComponent(StandaloneDraggable);
    fixture.detectChanges();

    const spy = jasmine.createSpy('move spy');
    const subscription = fixture.componentInstance.dragInstance.moved.subscribe({complete: spy});

    fixture.destroy();
    expect(spy).toHaveBeenCalled();
    subscription.unsubscribe();
  });

  it('should be able to lock dragging along the x axis', fakeAsync(() => {
    const fixture = createComponent(StandaloneDraggable);
    fixture.componentInstance.dragLockAxis.set('x');
    fixture.detectChanges();

    const dragElement = fixture.componentInstance.dragElement.nativeElement;

    expect(dragElement.style.transform).toBeFalsy();

    dragElementViaMouse(fixture, dragElement, 50, 100);
    expect(dragElement.style.transform).toBe('translate3d(50px, 0px, 0px)');

    dragElementViaMouse(fixture, dragElement, 100, 200);
    expect(dragElement.style.transform).toBe('translate3d(150px, 0px, 0px)');
  }));

  it('should be able to lock dragging along the x axis while using constrainPosition', fakeAsync(() => {
    const fixture = createComponent(StandaloneDraggable);
    fixture.componentInstance.dragLockAxis.set('x');
    fixture.componentInstance.constrainPosition = (
      {x, y}: Point,
      _dragRef: DragRef,
      _dimensions: DOMRect,
      pickup: Point,
    ) => {
      x -= pickup.x;
      y -= pickup.y;
      return {x, y};
    };
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    const dragElement = fixture.componentInstance.dragElement.nativeElement;

    expect(dragElement.style.transform).toBeFalsy();

    dragElementViaMouse(fixture, dragElement, 50, 100);
    expect(dragElement.style.transform).toBe('translate3d(50px, 0px, 0px)');

    dragElementViaMouse(fixture, dragElement, 100, 200);
    expect(dragElement.style.transform).toBe('translate3d(150px, 0px, 0px)');
  }));

  it('should be able to lock dragging along the y axis', fakeAsync(() => {
    const fixture = createComponent(StandaloneDraggable);
    fixture.componentInstance.dragLockAxis.set('y');
    fixture.detectChanges();

    const dragElement = fixture.componentInstance.dragElement.nativeElement;

    expect(dragElement.style.transform).toBeFalsy();

    dragElementViaMouse(fixture, dragElement, 50, 100);
    expect(dragElement.style.transform).toBe('translate3d(0px, 100px, 0px)');

    dragElementViaMouse(fixture, dragElement, 100, 200);
    expect(dragElement.style.transform).toBe('translate3d(0px, 300px, 0px)');
  }));

  it('should be able to lock dragging along the y axis while using constrainPosition', fakeAsync(() => {
    const fixture = createComponent(StandaloneDraggable);
    fixture.componentInstance.dragLockAxis.set('y');
    fixture.componentInstance.constrainPosition = (
      {x, y}: Point,
      _dragRef: DragRef,
      _dimensions: DOMRect,
      pickup: Point,
    ) => {
      x -= pickup.x;
      y -= pickup.y;
      return {x, y};
    };
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    const dragElement = fixture.componentInstance.dragElement.nativeElement;

    expect(dragElement.style.transform).toBeFalsy();

    dragElementViaMouse(fixture, dragElement, 50, 100);
    expect(dragElement.style.transform).toBe('translate3d(0px, 100px, 0px)');

    dragElementViaMouse(fixture, dragElement, 100, 200);
    expect(dragElement.style.transform).toBe('translate3d(0px, 300px, 0px)');
  }));

  it('should add a class while an element is being dragged', fakeAsync(() => {
    const fixture = createComponent(StandaloneDraggable);
    fixture.detectChanges();

    const element = fixture.componentInstance.dragElement.nativeElement;

    expect(element.classList).not.toContain('cdk-drag-dragging');

    startDraggingViaMouse(fixture, element);

    expect(element.classList).toContain('cdk-drag-dragging');

    dispatchMouseEvent(document, 'mouseup');
    fixture.detectChanges();

    expect(element.classList).not.toContain('cdk-drag-dragging');
  }));

  it('should add a class while an element is being dragged with OnPush change detection', fakeAsync(() => {
    const fixture = createComponent(StandaloneDraggableWithOnPush);
    fixture.detectChanges();

    const element = fixture.componentInstance.dragElement.nativeElement;

    expect(element.classList).not.toContain('cdk-drag-dragging');

    startDraggingViaMouse(fixture, element);

    expect(element.classList).toContain('cdk-drag-dragging');

    dispatchMouseEvent(document, 'mouseup');
    fixture.detectChanges();

    expect(element.classList).not.toContain('cdk-drag-dragging');
  }));

  it('should not add a class if item was not dragged more than the threshold', fakeAsync(() => {
    const fixture = createComponent(StandaloneDraggable, {dragDistance: 5});
    fixture.detectChanges();

    const element = fixture.componentInstance.dragElement.nativeElement;

    expect(element.classList).not.toContain('cdk-drag-dragging');

    startDraggingViaMouse(fixture, element);

    expect(element.classList).not.toContain('cdk-drag-dragging');
  }));

  it('should be able to set an alternate drag root element', fakeAsync(() => {
    const fixture = createComponent(DraggableWithAlternateRoot);
    fixture.componentInstance.rootElementSelector = '.alternate-root';
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    const dragRoot = fixture.componentInstance.dragRoot.nativeElement;
    const dragElement = fixture.componentInstance.dragElement.nativeElement;

    expect(dragRoot.style.transform).toBeFalsy();
    expect(dragElement.style.transform).toBeFalsy();

    dragElementViaMouse(fixture, dragRoot, 50, 100);

    expect(dragRoot.style.transform).toBe('translate3d(50px, 100px, 0px)');
    expect(dragElement.style.transform).toBeFalsy();
  }));

  it('should be able to set the cdkDrag element as handle if it has a different root element', fakeAsync(() => {
    const fixture = createComponent(DraggableWithAlternateRootAndSelfHandle);
    fixture.detectChanges();

    const dragRoot = fixture.componentInstance.dragRoot.nativeElement;
    const dragElement = fixture.componentInstance.dragElement.nativeElement;

    expect(dragRoot.style.transform).toBeFalsy();
    expect(dragElement.style.transform).toBeFalsy();

    // Try dragging the root. This should be possible since the drag element is the handle.
    dragElementViaMouse(fixture, dragRoot, 50, 100);

    expect(dragRoot.style.transform).toBeFalsy();
    expect(dragElement.style.transform).toBeFalsy();

    // Drag via the drag element which acts as the handle.
    dragElementViaMouse(fixture, dragElement, 50, 100);

    expect(dragRoot.style.transform).toBe('translate3d(50px, 100px, 0px)');
    expect(dragElement.style.transform).toBeFalsy();
  }));

  it('should be able to set an alternate drag root element for ng-container', fakeAsync(() => {
    const fixture = createComponent(DraggableNgContainerWithAlternateRoot);
    fixture.detectChanges();

    const dragRoot = fixture.componentInstance.dragRoot.nativeElement;

    expect(dragRoot.style.transform).toBeFalsy();

    dragElementViaMouse(fixture, dragRoot, 50, 100);

    expect(dragRoot.style.transform).toBe('translate3d(50px, 100px, 0px)');
  }));

  it('should preserve the initial transform if the root element changes', fakeAsync(() => {
    const fixture = createComponent(DraggableWithAlternateRoot);
    fixture.detectChanges();
    const dragElement = fixture.componentInstance.dragElement.nativeElement;
    const alternateRoot = fixture.componentInstance.dragRoot.nativeElement;

    dragElement.style.transform = 'translateX(-50%)';
    dragElementViaMouse(fixture, dragElement, 50, 100);
    expect(dragElement.style.transform).toContain('translateX(-50%)');

    alternateRoot.style.transform = 'scale(2)';
    fixture.componentInstance.rootElementSelector = '.alternate-root';
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    dragElementViaMouse(fixture, alternateRoot, 50, 100);

    expect(alternateRoot.style.transform).not.toContain('translateX(-50%)');
    expect(alternateRoot.style.transform).toContain('scale(2)');
  }));

  it('should handle the root element selector changing after init', fakeAsync(() => {
    const fixture = createComponent(DraggableWithAlternateRoot);
    fixture.detectChanges();
    tick();

    fixture.componentInstance.rootElementSelector = '.alternate-root';
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    const dragRoot = fixture.componentInstance.dragRoot.nativeElement;
    const dragElement = fixture.componentInstance.dragElement.nativeElement;

    expect(dragRoot.style.transform).toBeFalsy();
    expect(dragElement.style.transform).toBeFalsy();

    dragElementViaMouse(fixture, dragRoot, 50, 100);

    expect(dragRoot.style.transform).toBe('translate3d(50px, 100px, 0px)');
    expect(dragElement.style.transform).toBeFalsy();
  }));

  it('should not be able to drag the element if dragging is disabled', fakeAsync(() => {
    const fixture = createComponent(StandaloneDraggable);
    fixture.detectChanges();
    const dragElement = fixture.componentInstance.dragElement.nativeElement;

    expect(dragElement.classList).not.toContain('cdk-drag-disabled');

    fixture.componentInstance.dragDisabled.set(true);
    fixture.detectChanges();

    expect(dragElement.classList).toContain('cdk-drag-disabled');
    expect(dragElement.style.transform).toBeFalsy();
    dragElementViaMouse(fixture, dragElement, 50, 100);
    expect(dragElement.style.transform).toBeFalsy();
  }));

  it('should enable native drag interactions if dragging is disabled', fakeAsync(() => {
    const fixture = createComponent(StandaloneDraggable);
    fixture.detectChanges();
    const dragElement = fixture.componentInstance.dragElement.nativeElement;
    const styles = dragElement.style;

    expect(styles.touchAction || (styles as any).webkitUserDrag).toBeFalsy();

    fixture.componentInstance.dragDisabled.set(true);
    fixture.detectChanges();

    expect(styles.touchAction || (styles as any).webkitUserDrag).toBeFalsy();
  }));

  it('should enable native drag interactions if not dragging', fakeAsync(() => {
    const fixture = createComponent(StandaloneDraggable);
    fixture.detectChanges();
    const dragElement = fixture.componentInstance.dragElement.nativeElement;
    const styles = dragElement.style;

    expect(styles.touchAction || (styles as any).webkitUserDrag).toBeFalsy();
  }));

  it('should disable native drag interactions if dragging', fakeAsync(() => {
    const fixture = createComponent(StandaloneDraggable);
    fixture.detectChanges();
    const dragElement = fixture.componentInstance.dragElement.nativeElement;
    const styles = dragElement.style;

    expect(styles.touchAction || (styles as any).webkitUserDrag).toBeFalsy();

    startDraggingViaMouse(fixture, dragElement);
    dispatchMouseEvent(document, 'mousemove', 50, 100);
    fixture.detectChanges();

    expect(styles.touchAction || (styles as any).webkitUserDrag).toBe('none');
  }));

  it('should re-enable drag interactions once dragging is over', fakeAsync(() => {
    const fixture = createComponent(StandaloneDraggable);
    fixture.detectChanges();
    const dragElement = fixture.componentInstance.dragElement.nativeElement;
    const styles = dragElement.style;

    startDraggingViaMouse(fixture, dragElement);
    dispatchMouseEvent(document, 'mousemove', 50, 100);
    fixture.detectChanges();

    expect(styles.touchAction || (styles as any).webkitUserDrag).toBe('none');

    dispatchMouseEvent(document, 'mouseup', 50, 100);
    fixture.detectChanges();

    expect(styles.touchAction || (styles as any).webkitUserDrag).toBeFalsy();
  }));

  it('should not stop propagation for the drag sequence start event by default', fakeAsync(() => {
    const fixture = createComponent(StandaloneDraggable);
    fixture.detectChanges();
    const dragElement = fixture.componentInstance.dragElement.nativeElement;

    const event = createMouseEvent('mousedown');
    spyOn(event, 'stopPropagation').and.callThrough();

    dispatchEvent(dragElement, event);
    fixture.detectChanges();

    expect(event.stopPropagation).not.toHaveBeenCalled();
  }));

  it('should not throw if destroyed before the first change detection run', fakeAsync(() => {
    const fixture = createComponent(StandaloneDraggable);

    expect(() => {
      fixture.destroy();
    }).not.toThrow();
  }));

  it('should enable native drag interactions on the drag item when there is a handle', () => {
    const fixture = createComponent(StandaloneDraggableWithHandle);
    fixture.detectChanges();
    const dragElement = fixture.componentInstance.dragElement.nativeElement;
    expect(dragElement.style.touchAction).not.toBe('none');
  });

  it('should disable native drag interactions on the drag handle', () => {
    const fixture = createComponent(StandaloneDraggableWithHandle);
    fixture.detectChanges();
    const styles = fixture.componentInstance.handleElement.nativeElement.style;
    expect(styles.touchAction || (styles as any).webkitUserDrag).toBe('none');
  });

  it('should enable native drag interactions on the drag handle if dragging is disabled', () => {
    const fixture = createComponent(StandaloneDraggableWithHandle);
    fixture.detectChanges();
    fixture.componentInstance.draggingDisabled = true;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    const styles = fixture.componentInstance.handleElement.nativeElement.style;
    expect(styles.touchAction || (styles as any).webkitUserDrag).toBeFalsy();
  });

  it(
    'should enable native drag interactions on the drag handle if dragging is disabled ' +
      'on init',
    () => {
      const fixture = createComponent(StandaloneDraggableWithHandle);
      fixture.componentInstance.draggingDisabled = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      const styles = fixture.componentInstance.handleElement.nativeElement.style;
      expect(styles.touchAction || (styles as any).webkitUserDrag).toBeFalsy();
    },
  );

  it('should toggle native drag interactions based on whether the handle is disabled', () => {
    const fixture = createComponent(StandaloneDraggableWithHandle);
    fixture.detectChanges();
    fixture.componentInstance.handleInstance.disabled = true;
    fixture.detectChanges();
    const styles = fixture.componentInstance.handleElement.nativeElement.style;
    expect(styles.touchAction || (styles as any).webkitUserDrag).toBeFalsy();

    fixture.componentInstance.handleInstance.disabled = false;
    fixture.detectChanges();
    expect(styles.touchAction || (styles as any).webkitUserDrag).toBe('none');
  });

  it('should be able to reset a freely-dragged item to its initial position', fakeAsync(() => {
    const fixture = createComponent(StandaloneDraggable);
    fixture.detectChanges();
    const dragElement = fixture.componentInstance.dragElement.nativeElement;

    expect(dragElement.style.transform).toBeFalsy();
    dragElementViaMouse(fixture, dragElement, 50, 100);
    expect(dragElement.style.transform).toBe('translate3d(50px, 100px, 0px)');

    fixture.componentInstance.dragInstance.reset();
    expect(dragElement.style.transform).toBeFalsy();
  }));

  it('should preserve initial transform after resetting', fakeAsync(() => {
    const fixture = createComponent(StandaloneDraggable);
    fixture.detectChanges();
    const dragElement = fixture.componentInstance.dragElement.nativeElement;

    dragElement.style.transform = 'scale(2)';

    dragElementViaMouse(fixture, dragElement, 50, 100);
    expect(dragElement.style.transform).toBe('translate3d(50px, 100px, 0px) scale(2)');

    fixture.componentInstance.dragInstance.reset();
    expect(dragElement.style.transform).toBe('scale(2)');
  }));

  it('should start dragging an item from its initial position after a reset', fakeAsync(() => {
    const fixture = createComponent(StandaloneDraggable);
    fixture.detectChanges();
    const dragElement = fixture.componentInstance.dragElement.nativeElement;

    expect(dragElement.style.transform).toBeFalsy();
    dragElementViaMouse(fixture, dragElement, 50, 100);
    expect(dragElement.style.transform).toBe('translate3d(50px, 100px, 0px)');
    fixture.componentInstance.dragInstance.reset();

    dragElementViaMouse(fixture, dragElement, 25, 50);
    expect(dragElement.style.transform).toBe('translate3d(25px, 50px, 0px)');
  }));

  it('should not dispatch multiple events for a mouse event right after a touch event', fakeAsync(() => {
    const fixture = createComponent(StandaloneDraggable);
    fixture.detectChanges();

    const dragElement = fixture.componentInstance.dragElement.nativeElement;

    // Dispatch a touch sequence.
    dispatchTouchEvent(dragElement, 'touchstart');
    fixture.detectChanges();
    dispatchTouchEvent(dragElement, 'touchend');
    fixture.detectChanges();
    tick();

    // Immediately dispatch a mouse sequence to simulate a fake event.
    startDraggingViaMouse(fixture, dragElement);
    fixture.detectChanges();
    dispatchMouseEvent(dragElement, 'mouseup');
    fixture.detectChanges();
    tick();

    expect(fixture.componentInstance.startedSpy).toHaveBeenCalledTimes(1);
    expect(fixture.componentInstance.endedSpy).toHaveBeenCalledTimes(1);
  }));

  it('should round the transform value', fakeAsync(() => {
    const fixture = createComponent(StandaloneDraggable);
    fixture.detectChanges();
    const dragElement = fixture.componentInstance.dragElement.nativeElement;

    expect(dragElement.style.transform).toBeFalsy();
    dragElementViaMouse(fixture, dragElement, 13.37, 37);
    expect(dragElement.style.transform).toBe('translate3d(13px, 37px, 0px)');
  }));

  it('should allow for dragging to be constrained to an element', fakeAsync(() => {
    const fixture = createComponent(StandaloneDraggable);
    fixture.componentInstance.boundary = '.wrapper';
    fixture.detectChanges();
    const dragElement = fixture.componentInstance.dragElement.nativeElement;

    expect(dragElement.style.transform).toBeFalsy();
    dragElementViaMouse(fixture, dragElement, 300, 300);
    expect(dragElement.style.transform).toBe('translate3d(100px, 100px, 0px)');
  }));

  it('should allow for dragging to be constrained to an element while using constrainPosition', fakeAsync(() => {
    const fixture = createComponent(StandaloneDraggable);
    fixture.componentInstance.boundary = '.wrapper';
    fixture.detectChanges();

    fixture.componentInstance.dragInstance.constrainPosition = (
      {x, y}: Point,
      _dragRef: DragRef,
      _dimensions: DOMRect,
      pickup: Point,
    ) => {
      x -= pickup.x;
      y -= pickup.y;
      return {x, y};
    };

    const dragElement = fixture.componentInstance.dragElement.nativeElement;

    expect(dragElement.style.transform).toBeFalsy();
    dragElementViaMouse(fixture, dragElement, 300, 300);
    expect(dragElement.style.transform).toBe('translate3d(100px, 100px, 0px)');
  }));

  it('should be able to pass in a DOM node as the boundary', fakeAsync(() => {
    const fixture = createComponent(StandaloneDraggable);
    fixture.componentInstance.boundary = fixture.nativeElement.querySelector('.wrapper');
    fixture.detectChanges();
    const dragElement = fixture.componentInstance.dragElement.nativeElement;

    expect(dragElement.style.transform).toBeFalsy();
    dragElementViaMouse(fixture, dragElement, 300, 300);
    expect(dragElement.style.transform).toBe('translate3d(100px, 100px, 0px)');
  }));

  it('should adjust the x offset if the boundary becomes narrower after a viewport resize', fakeAsync(() => {
    const fixture = createComponent(StandaloneDraggable);
    const boundary: HTMLElement = fixture.nativeElement.querySelector('.wrapper');
    fixture.componentInstance.boundary = boundary;
    fixture.detectChanges();
    const dragElement = fixture.componentInstance.dragElement.nativeElement;

    dragElementViaMouse(fixture, dragElement, 300, 300);
    expect(dragElement.style.transform).toBe('translate3d(100px, 100px, 0px)');

    boundary.style.width = '150px';
    dispatchFakeEvent(window, 'resize');
    tick(20);

    expect(dragElement.style.transform).toBe('translate3d(50px, 100px, 0px)');
  }));

  it('should keep the old position if the boundary is invisible after a resize', fakeAsync(() => {
    const fixture = createComponent(StandaloneDraggable);
    const boundary: HTMLElement = fixture.nativeElement.querySelector('.wrapper');
    fixture.componentInstance.boundary = boundary;
    fixture.detectChanges();
    const dragElement = fixture.componentInstance.dragElement.nativeElement;

    dragElementViaMouse(fixture, dragElement, 300, 300);
    expect(dragElement.style.transform).toBe('translate3d(100px, 100px, 0px)');

    boundary.style.display = 'none';
    dispatchFakeEvent(window, 'resize');
    tick(20);

    expect(dragElement.style.transform).toBe('translate3d(100px, 100px, 0px)');
  }));

  it('should handle the element and boundary dimensions changing between drag sequences', fakeAsync(() => {
    const fixture = createComponent(StandaloneDraggable);
    const boundary: HTMLElement = fixture.nativeElement.querySelector('.wrapper');
    fixture.componentInstance.boundary = boundary;
    fixture.detectChanges();
    const dragElement = fixture.componentInstance.dragElement.nativeElement;

    dragElementViaMouse(fixture, dragElement, 300, 300);
    expect(dragElement.style.transform).toBe('translate3d(100px, 100px, 0px)');

    // Bump the width and height of both the boundary and the drag element.
    boundary.style.width = boundary.style.height = '300px';
    dragElement.style.width = dragElement.style.height = '150px';

    dragElementViaMouse(fixture, dragElement, 300, 300);
    expect(dragElement.style.transform).toBe('translate3d(150px, 150px, 0px)');
  }));

  it('should adjust the y offset if the boundary becomes shorter after a viewport resize', fakeAsync(() => {
    const fixture = createComponent(StandaloneDraggable);
    const boundary: HTMLElement = fixture.nativeElement.querySelector('.wrapper');
    fixture.componentInstance.boundary = boundary;
    fixture.detectChanges();
    const dragElement = fixture.componentInstance.dragElement.nativeElement;

    dragElementViaMouse(fixture, dragElement, 300, 300);
    expect(dragElement.style.transform).toBe('translate3d(100px, 100px, 0px)');

    boundary.style.height = '150px';
    dispatchFakeEvent(window, 'resize');
    tick(20);

    expect(dragElement.style.transform).toBe('translate3d(100px, 50px, 0px)');
  }));

  it(
    'should reset the x offset if the boundary becomes narrower than the element ' +
      'after a resize',
    fakeAsync(() => {
      const fixture = createComponent(StandaloneDraggable);
      const boundary: HTMLElement = fixture.nativeElement.querySelector('.wrapper');
      fixture.componentInstance.boundary = boundary;
      fixture.detectChanges();
      const dragElement = fixture.componentInstance.dragElement.nativeElement;

      dragElementViaMouse(fixture, dragElement, 300, 300);
      expect(dragElement.style.transform).toBe('translate3d(100px, 100px, 0px)');

      boundary.style.width = '50px';
      dispatchFakeEvent(window, 'resize');
      tick(20);

      expect(dragElement.style.transform).toBe('translate3d(0px, 100px, 0px)');
    }),
  );

  it('should reset the y offset if the boundary becomes shorter than the element after a resize', fakeAsync(() => {
    const fixture = createComponent(StandaloneDraggable);
    const boundary: HTMLElement = fixture.nativeElement.querySelector('.wrapper');
    fixture.componentInstance.boundary = boundary;
    fixture.detectChanges();
    const dragElement = fixture.componentInstance.dragElement.nativeElement;

    dragElementViaMouse(fixture, dragElement, 300, 300);
    expect(dragElement.style.transform).toBe('translate3d(100px, 100px, 0px)');

    boundary.style.height = '50px';
    dispatchFakeEvent(window, 'resize');
    tick(20);

    expect(dragElement.style.transform).toBe('translate3d(100px, 0px, 0px)');
  }));

  it('should allow for the position constrain logic to be customized', fakeAsync(() => {
    const fixture = createComponent(StandaloneDraggable);
    const spy = jasmine.createSpy('constrain position spy').and.returnValue({
      x: 50,
      y: 50,
    } as Point);

    fixture.componentInstance.constrainPosition = spy;
    fixture.detectChanges();
    const dragElement = fixture.componentInstance.dragElement.nativeElement;

    expect(dragElement.style.transform).toBeFalsy();
    dragElementViaMouse(fixture, dragElement, 300, 300);

    expect(spy).toHaveBeenCalledWith(
      jasmine.objectContaining({x: 300, y: 300}),
      jasmine.any(DragRef),
      jasmine.anything(),
      jasmine.objectContaining({x: jasmine.any(Number), y: jasmine.any(Number)}),
    );

    const elementRect = dragElement.getBoundingClientRect();
    expect(Math.floor(elementRect.top)).toBe(50);
    expect(Math.floor(elementRect.left)).toBe(50);
  }));

  it('should throw if drag item is attached to an ng-container', () => {
    const errorHandler = jasmine.createSpyObj(['handleError']);
    createComponent(DraggableOnNgContainer, {
      providers: [
        {
          provide: ErrorHandler,
          useValue: errorHandler,
        },
      ],
    }).detectChanges();
    expect(errorHandler.handleError.calls.mostRecent().args[0].message).toMatch(
      /^cdkDrag must be attached to an element node/,
    );
  });

  it('should cancel drag if the mouse moves before the delay is elapsed', fakeAsync(() => {
    // We can't use Jasmine's `clock` because Zone.js interferes with it.
    spyOn(Date, 'now').and.callFake(() => currentTime);
    let currentTime = 0;

    const fixture = createComponent(StandaloneDraggable);
    fixture.componentInstance.dragStartDelay = 1000;
    fixture.detectChanges();
    const dragElement = fixture.componentInstance.dragElement.nativeElement;

    expect(dragElement.style.transform)
      .withContext('Expected element not to be moved by default.')
      .toBeFalsy();

    startDraggingViaMouse(fixture, dragElement);
    currentTime += 750;
    dispatchMouseEvent(document, 'mousemove', 50, 100);
    currentTime += 500;
    fixture.detectChanges();

    expect(dragElement.style.transform)
      .withContext('Expected element not to be moved if the mouse moved before the delay.')
      .toBeFalsy();
  }));

  it('should enable native drag interactions if mouse moves before the delay', fakeAsync(() => {
    // We can't use Jasmine's `clock` because Zone.js interferes with it.
    spyOn(Date, 'now').and.callFake(() => currentTime);
    let currentTime = 0;

    const fixture = createComponent(StandaloneDraggable);
    fixture.componentInstance.dragStartDelay = 1000;
    fixture.detectChanges();
    const dragElement = fixture.componentInstance.dragElement.nativeElement;
    const styles = dragElement.style;

    expect(dragElement.style.transform)
      .withContext('Expected element not to be moved by default.')
      .toBeFalsy();

    startDraggingViaMouse(fixture, dragElement);
    currentTime += 750;
    dispatchMouseEvent(document, 'mousemove', 50, 100);
    currentTime += 500;
    fixture.detectChanges();

    expect(styles.touchAction || (styles as any).webkitUserDrag).toBeFalsy();
  }));

  it('should allow dragging after the drag start delay is elapsed', fakeAsync(() => {
    // We can't use Jasmine's `clock` because Zone.js interferes with it.
    spyOn(Date, 'now').and.callFake(() => currentTime);
    let currentTime = 0;

    const fixture = createComponent(StandaloneDraggable);
    fixture.componentInstance.dragStartDelay = 500;
    fixture.detectChanges();
    const dragElement = fixture.componentInstance.dragElement.nativeElement;

    expect(dragElement.style.transform)
      .withContext('Expected element not to be moved by default.')
      .toBeFalsy();

    dispatchMouseEvent(dragElement, 'mousedown');
    fixture.detectChanges();
    currentTime += 750;

    // The first `mousemove` here starts the sequence and the second one moves the element.
    dispatchMouseEvent(document, 'mousemove', 50, 100);
    dispatchMouseEvent(document, 'mousemove', 50, 100);
    fixture.detectChanges();

    expect(dragElement.style.transform)
      .withContext('Expected element to be dragged after all the time has passed.')
      .toBe('translate3d(50px, 100px, 0px)');
  }));

  it('should not prevent the default touch action before the delay has elapsed', fakeAsync(() => {
    spyOn(Date, 'now').and.callFake(() => currentTime);
    let currentTime = 0;

    const fixture = createComponent(StandaloneDraggable);
    fixture.componentInstance.dragStartDelay = 500;
    fixture.detectChanges();
    const dragElement = fixture.componentInstance.dragElement.nativeElement;

    expect(dragElement.style.transform)
      .withContext('Expected element not to be moved by default.')
      .toBeFalsy();

    dispatchTouchEvent(dragElement, 'touchstart');
    fixture.detectChanges();
    currentTime += 250;

    expect(dispatchTouchEvent(document, 'touchmove', 50, 100).defaultPrevented).toBe(false);
  }));

  it('should handle the drag delay as a string', fakeAsync(() => {
    // We can't use Jasmine's `clock` because Zone.js interferes with it.
    spyOn(Date, 'now').and.callFake(() => currentTime);
    let currentTime = 0;

    const fixture = createComponent(StandaloneDraggable);
    fixture.componentInstance.dragStartDelay = '500';
    fixture.detectChanges();
    const dragElement = fixture.componentInstance.dragElement.nativeElement;

    expect(dragElement.style.transform)
      .withContext('Expected element not to be moved by default.')
      .toBeFalsy();

    dispatchMouseEvent(dragElement, 'mousedown');
    fixture.detectChanges();
    currentTime += 750;

    // The first `mousemove` here starts the sequence and the second one moves the element.
    dispatchMouseEvent(document, 'mousemove', 50, 100);
    dispatchMouseEvent(document, 'mousemove', 50, 100);
    fixture.detectChanges();

    expect(dragElement.style.transform)
      .withContext('Expected element to be dragged after all the time has passed.')
      .toBe('translate3d(50px, 100px, 0px)');
  }));

  it('should be able to configure the drag start delay based on the event type', fakeAsync(() => {
    // We can't use Jasmine's `clock` because Zone.js interferes with it.
    spyOn(Date, 'now').and.callFake(() => currentTime);
    let currentTime = 0;

    const fixture = createComponent(StandaloneDraggable);
    fixture.componentInstance.dragStartDelay = {touch: 500, mouse: 0};
    fixture.detectChanges();
    const dragElement = fixture.componentInstance.dragElement.nativeElement;

    expect(dragElement.style.transform)
      .withContext('Expected element not to be moved by default.')
      .toBeFalsy();

    dragElementViaTouch(fixture, dragElement, 50, 100);
    expect(dragElement.style.transform)
      .withContext('Expected element not to be moved via touch because it has a delay.')
      .toBeFalsy();

    dragElementViaMouse(fixture, dragElement, 50, 100);
    expect(dragElement.style.transform)
      .withContext('Expected element to be moved via mouse because it has no delay.')
      .toBe('translate3d(50px, 100px, 0px)');
  }));

  it('should be able to get the current position', fakeAsync(() => {
    const fixture = createComponent(StandaloneDraggable);
    fixture.detectChanges();

    const dragElement = fixture.componentInstance.dragElement.nativeElement;
    const dragInstance = fixture.componentInstance.dragInstance;

    expect(dragInstance.getFreeDragPosition()).toEqual({x: 0, y: 0});

    dragElementViaMouse(fixture, dragElement, 50, 100);
    expect(dragInstance.getFreeDragPosition()).toEqual({x: 50, y: 100});

    dragElementViaMouse(fixture, dragElement, 100, 200);
    expect(dragInstance.getFreeDragPosition()).toEqual({x: 150, y: 300});
  }));

  it('should be able to set the current position programmatically', fakeAsync(() => {
    const fixture = createComponent(StandaloneDraggable);
    fixture.detectChanges();

    const dragElement = fixture.componentInstance.dragElement.nativeElement;
    const dragInstance = fixture.componentInstance.dragInstance;

    dragInstance.setFreeDragPosition({x: 50, y: 100});

    expect(dragElement.style.transform).toBe('translate3d(50px, 100px, 0px)');
    expect(dragInstance.getFreeDragPosition()).toEqual({x: 50, y: 100});
  }));

  it('should be able to set the current position', fakeAsync(() => {
    const fixture = createComponent(StandaloneDraggable);
    fixture.componentInstance.freeDragPosition = {x: 50, y: 100};
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    const dragElement = fixture.componentInstance.dragElement.nativeElement;
    const dragInstance = fixture.componentInstance.dragInstance;

    expect(dragElement.style.transform).toBe('translate3d(50px, 100px, 0px)');
    expect(dragInstance.getFreeDragPosition()).toEqual({x: 50, y: 100});
  }));

  it('should be able to get the up-to-date position as the user is dragging', fakeAsync(() => {
    const fixture = createComponent(StandaloneDraggable);
    fixture.detectChanges();

    const dragElement = fixture.componentInstance.dragElement.nativeElement;
    const dragInstance = fixture.componentInstance.dragInstance;

    expect(dragInstance.getFreeDragPosition()).toEqual({x: 0, y: 0});

    startDraggingViaMouse(fixture, dragElement);
    dispatchMouseEvent(document, 'mousemove', 50, 100);
    fixture.detectChanges();

    expect(dragInstance.getFreeDragPosition()).toEqual({x: 50, y: 100});

    dispatchMouseEvent(document, 'mousemove', 100, 200);
    fixture.detectChanges();

    expect(dragInstance.getFreeDragPosition()).toEqual({x: 100, y: 200});
  }));

  it('should react to changes in the free drag position', fakeAsync(() => {
    const fixture = createComponent(StandaloneDraggable);
    fixture.componentInstance.freeDragPosition = {x: 50, y: 100};
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    const dragElement = fixture.componentInstance.dragElement.nativeElement;

    expect(dragElement.style.transform).toBe('translate3d(50px, 100px, 0px)');

    fixture.componentInstance.freeDragPosition = {x: 100, y: 200};
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expect(dragElement.style.transform).toBe('translate3d(100px, 200px, 0px)');
  }));

  it('should be able to continue dragging after the current position was set', fakeAsync(() => {
    const fixture = createComponent(StandaloneDraggable);
    fixture.componentInstance.freeDragPosition = {x: 50, y: 100};
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    const dragElement = fixture.componentInstance.dragElement.nativeElement;

    expect(dragElement.style.transform).toBe('translate3d(50px, 100px, 0px)');

    dragElementViaMouse(fixture, dragElement, 100, 200);

    expect(dragElement.style.transform).toBe('translate3d(150px, 300px, 0px)');
  }));

  it('should include the dragged distance as the user is dragging', fakeAsync(() => {
    const fixture = createComponent(StandaloneDraggable);
    fixture.detectChanges();
    const dragElement = fixture.componentInstance.dragElement.nativeElement;
    const spy = jasmine.createSpy('moved spy');
    const subscription = fixture.componentInstance.dragInstance.moved.subscribe(spy);

    startDraggingViaMouse(fixture, dragElement);

    dispatchMouseEvent(document, 'mousemove', 50, 100);
    fixture.detectChanges();

    let event = spy.calls.mostRecent().args[0];
    expect(event.distance).toEqual({x: 50, y: 100});

    dispatchMouseEvent(document, 'mousemove', 75, 50);
    fixture.detectChanges();

    event = spy.calls.mostRecent().args[0];
    expect(event.distance).toEqual({x: 75, y: 50});

    subscription.unsubscribe();
  }));

  it('should be able to configure the drag input defaults through a provider', fakeAsync(() => {
    const config: DragDropConfig = {
      draggingDisabled: true,
      dragStartDelay: 1337,
      lockAxis: 'y',
      constrainPosition: () => ({x: 1337, y: 42}),
      previewClass: 'custom-preview-class',
      boundaryElement: '.boundary',
      rootElementSelector: '.root',
      previewContainer: 'parent',
    };

    const fixture = createComponent(PlainStandaloneDraggable, {
      providers: [
        {
          provide: CDK_DRAG_CONFIG,
          useValue: config,
        },
      ],
    });
    fixture.detectChanges();
    const drag = fixture.componentInstance.dragInstance;
    expect(drag.disabled).toBe(true);
    expect(drag.dragStartDelay).toBe(1337);
    expect(drag.lockAxis).toBe('y');
    expect(drag.constrainPosition).toBe(config.constrainPosition);
    expect(drag.previewClass).toBe('custom-preview-class');
    expect(drag.boundaryElement).toBe('.boundary');
    expect(drag.rootElementSelector).toBe('.root');
    expect(drag.previewContainer).toBe('parent');
  }));

  it('should not throw if touches and changedTouches are empty', fakeAsync(() => {
    const fixture = createComponent(StandaloneDraggable);
    fixture.detectChanges();
    const dragElement = fixture.componentInstance.dragElement.nativeElement;

    startDraggingViaTouch(fixture, dragElement);
    continueDraggingViaTouch(fixture, 50, 100);

    const event = createTouchEvent('touchend', 50, 100);
    Object.defineProperties(event, {
      touches: {get: () => []},
      changedTouches: {get: () => []},
    });

    expect(() => {
      dispatchEvent(document, event);
      fixture.detectChanges();
      tick();
    }).not.toThrow();
  }));

  it('should update the free drag position if the page is scrolled', fakeAsync(() => {
    const fixture = createComponent(StandaloneDraggable);
    fixture.detectChanges();

    const cleanup = makeScrollable();
    const dragElement = fixture.componentInstance.dragElement.nativeElement;

    expect(dragElement.style.transform).toBeFalsy();
    startDraggingViaMouse(fixture, dragElement, 0, 0);
    dispatchMouseEvent(document, 'mousemove', 50, 100);
    fixture.detectChanges();

    expect(dragElement.style.transform).toBe('translate3d(50px, 100px, 0px)');

    scrollTo(0, 500);
    dispatchFakeEvent(document, 'scroll');
    fixture.detectChanges();
    expect(dragElement.style.transform).toBe('translate3d(50px, 600px, 0px)');

    cleanup();
  }));

  it(
    'should update the free drag position if the user moves their pointer after the page ' +
      'is scrolled',
    fakeAsync(() => {
      const fixture = createComponent(StandaloneDraggable);
      fixture.detectChanges();

      const cleanup = makeScrollable();
      const dragElement = fixture.componentInstance.dragElement.nativeElement;

      expect(dragElement.style.transform).toBeFalsy();
      startDraggingViaMouse(fixture, dragElement, 0, 0);
      dispatchMouseEvent(document, 'mousemove', 50, 100);
      fixture.detectChanges();

      expect(dragElement.style.transform).toBe('translate3d(50px, 100px, 0px)');

      scrollTo(0, 500);
      dispatchFakeEvent(document, 'scroll');
      fixture.detectChanges();
      dispatchMouseEvent(document, 'mousemove', 50, 200);
      fixture.detectChanges();

      expect(dragElement.style.transform).toBe('translate3d(50px, 700px, 0px)');

      cleanup();
    }),
  );

  describe('with a handle', () => {
    it('should not be able to drag the entire element if it has a handle', fakeAsync(() => {
      const fixture = createComponent(StandaloneDraggableWithHandle);
      fixture.detectChanges();
      const dragElement = fixture.componentInstance.dragElement.nativeElement;

      expect(dragElement.style.transform).toBeFalsy();
      dragElementViaMouse(fixture, dragElement, 50, 100);
      expect(dragElement.style.transform).toBeFalsy();
    }));

    it('should be able to drag an element using its handle', fakeAsync(() => {
      const fixture = createComponent(StandaloneDraggableWithHandle);
      fixture.detectChanges();
      const dragElement = fixture.componentInstance.dragElement.nativeElement;
      const handle = fixture.componentInstance.handleElement.nativeElement;

      expect(dragElement.style.transform).toBeFalsy();
      dragElementViaMouse(fixture, handle, 50, 100);
      expect(dragElement.style.transform).toBe('translate3d(50px, 100px, 0px)');
    }));

    it('should not be able to drag the element if the handle is disabled', fakeAsync(() => {
      const fixture = createComponent(StandaloneDraggableWithHandle);
      fixture.detectChanges();
      const dragElement = fixture.componentInstance.dragElement.nativeElement;
      const handle = fixture.componentInstance.handleElement.nativeElement;

      fixture.componentInstance.handleInstance.disabled = true;

      expect(dragElement.style.transform).toBeFalsy();
      dragElementViaMouse(fixture, handle, 50, 100);
      expect(dragElement.style.transform).toBeFalsy();
    }));

    it('should not be able to drag the element if the handle is disabled before init', fakeAsync(() => {
      const fixture = createComponent(StandaloneDraggableWithPreDisabledHandle);
      fixture.detectChanges();
      const dragElement = fixture.componentInstance.dragElement.nativeElement;
      const handle = fixture.componentInstance.handleElement.nativeElement;

      expect(dragElement.style.transform).toBeFalsy();
      dragElementViaMouse(fixture, handle, 50, 100);
      expect(dragElement.style.transform).toBeFalsy();
    }));

    it('should not be able to drag using the handle if the element is disabled', fakeAsync(() => {
      const fixture = createComponent(StandaloneDraggableWithHandle);
      fixture.detectChanges();
      const dragElement = fixture.componentInstance.dragElement.nativeElement;
      const handle = fixture.componentInstance.handleElement.nativeElement;

      fixture.componentInstance.draggingDisabled = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(dragElement.style.transform).toBeFalsy();
      dragElementViaMouse(fixture, handle, 50, 100);
      expect(dragElement.style.transform).toBeFalsy();
    }));

    it('should be able to use a handle that was added after init', fakeAsync(() => {
      const fixture = createComponent(StandaloneDraggableWithDelayedHandle);

      fixture.detectChanges();
      fixture.componentInstance.showHandle = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      const dragElement = fixture.componentInstance.dragElement.nativeElement;
      const handle = fixture.componentInstance.handleElement.nativeElement;

      expect(dragElement.style.transform).toBeFalsy();
      dragElementViaMouse(fixture, handle, 50, 100);
      expect(dragElement.style.transform).toBe('translate3d(50px, 100px, 0px)');
    }));

    it('should be able to use more than one handle to drag the element', fakeAsync(async () => {
      const fixture = createComponent(StandaloneDraggableWithMultipleHandles);
      fixture.detectChanges();

      const dragElement = fixture.componentInstance.dragElement.nativeElement;
      const handles = fixture.componentInstance.handles.map(handle => handle.element.nativeElement);

      expect(dragElement.style.transform).toBeFalsy();
      dragElementViaMouse(fixture, handles[1], 50, 100);
      expect(dragElement.style.transform).toBe('translate3d(50px, 100px, 0px)');

      dragElementViaMouse(fixture, handles[0], 100, 200);
      expect(dragElement.style.transform).toBe('translate3d(150px, 300px, 0px)');
    }));

    it('should be able to drag with a handle that is not a direct descendant', fakeAsync(() => {
      const fixture = createComponent(StandaloneDraggableWithIndirectHandle, {
        extraDeclarations: [PassthroughComponent],
      });
      fixture.detectChanges();
      const dragElement = fixture.componentInstance.dragElement.nativeElement;
      const handle = fixture.componentInstance.handleElement.nativeElement;

      expect(dragElement.style.transform).toBeFalsy();
      dragElementViaMouse(fixture, dragElement, 50, 100);

      expect(dragElement.style.transform)
        .withContext('Expected not to be able to drag the element by itself.')
        .toBeFalsy();

      dragElementViaMouse(fixture, handle, 50, 100);
      expect(dragElement.style.transform)
        .withContext('Expected to drag the element by its handle.')
        .toBe('translate3d(50px, 100px, 0px)');
    }));

    it('should disable the tap highlight while dragging via the handle', fakeAsync(() => {
      // This test is irrelevant if the browser doesn't support styling the tap highlight color.
      if (!('webkitTapHighlightColor' in document.body.style)) {
        return;
      }

      const fixture = createComponent(StandaloneDraggableWithHandle);
      fixture.detectChanges();
      const dragElement = fixture.componentInstance.dragElement.nativeElement;
      const handle = fixture.componentInstance.handleElement.nativeElement;

      expect((dragElement.style as any).webkitTapHighlightColor).toBeFalsy();

      startDraggingViaMouse(fixture, handle);

      expect((dragElement.style as any).webkitTapHighlightColor).toBe('transparent');

      dispatchMouseEvent(document, 'mousemove', 50, 100);
      fixture.detectChanges();

      dispatchMouseEvent(document, 'mouseup', 50, 100);
      fixture.detectChanges();

      expect((dragElement.style as any).webkitTapHighlightColor).toBeFalsy();
    }));

    it('should preserve any existing `webkitTapHighlightColor`', fakeAsync(() => {
      // This test is irrelevant if the browser doesn't support styling the tap highlight color.
      if (!('webkitTapHighlightColor' in document.body.style)) {
        return;
      }

      const fixture = createComponent(StandaloneDraggableWithHandle);
      fixture.detectChanges();
      const dragElement = fixture.componentInstance.dragElement.nativeElement;
      const handle = fixture.componentInstance.handleElement.nativeElement;

      (dragElement.style as any).webkitTapHighlightColor = 'purple';

      startDraggingViaMouse(fixture, handle);

      expect((dragElement.style as any).webkitTapHighlightColor).toBe('transparent');

      dispatchMouseEvent(document, 'mousemove', 50, 100);
      fixture.detectChanges();

      dispatchMouseEvent(document, 'mouseup', 50, 100);
      fixture.detectChanges();

      expect((dragElement.style as any).webkitTapHighlightColor).toBe('purple');
    }));

    it('should throw if drag handle is attached to an ng-container', fakeAsync(() => {
      expect(() => {
        createComponent(DragHandleOnNgContainer).detectChanges();
        flush();
      }).toThrowError(/^cdkDragHandle must be attached to an element node/);
    }));

    it('should be able to drag an element using a handle with a shadow DOM child', fakeAsync(() => {
      if (!_supportsShadowDom()) {
        return;
      }

      const fixture = createComponent(StandaloneDraggableWithShadowInsideHandle, {
        extraDeclarations: [ShadowWrapper],
      });
      fixture.detectChanges();
      const dragElement = fixture.componentInstance.dragElement.nativeElement;
      const handleChild = fixture.componentInstance.handleChild.nativeElement;

      expect(dragElement.style.transform).toBeFalsy();
      dragElementViaMouse(fixture, handleChild, 50, 100);
      expect(dragElement.style.transform).toBe('translate3d(50px, 100px, 0px)');
    }));

    it('should prevent default dragStart on handle, not on entire draggable', fakeAsync(() => {
      const fixture = createComponent(StandaloneDraggableWithHandle);
      fixture.detectChanges();

      const draggableEvent = dispatchFakeEvent(
        fixture.componentInstance.dragElement.nativeElement,
        'dragstart',
      );
      fixture.detectChanges();

      const handleEvent = dispatchFakeEvent(
        fixture.componentInstance.handleElement.nativeElement,
        'dragstart',
        true,
      );
      fixture.detectChanges();

      expect(draggableEvent.defaultPrevented).toBe(false);
      expect(handleEvent.defaultPrevented).toBe(true);
    }));
  });
});

@Component({
  template: `
    <div class="wrapper" style="width: 200px; height: 200px; background: green;">
      <div
        cdkDrag
        [cdkDragBoundary]="boundary"
        [cdkDragStartDelay]="dragStartDelay"
        [cdkDragConstrainPosition]="constrainPosition"
        [cdkDragFreeDragPosition]="freeDragPosition"
        [cdkDragDisabled]="dragDisabled()"
        [cdkDragLockAxis]="dragLockAxis()"
        (cdkDragStarted)="startedSpy($event)"
        (cdkDragReleased)="releasedSpy($event)"
        (cdkDragEnded)="endedSpy($event)"
        #dragElement
        style="width: 100px; height: 100px; background: red;"></div>
    </div>
  `,
})
class StandaloneDraggable {
  @ViewChild('dragElement') dragElement: ElementRef<HTMLElement>;
  @ViewChild(CdkDrag) dragInstance: CdkDrag;
  startedSpy = jasmine.createSpy('started spy');
  endedSpy = jasmine.createSpy('ended spy');
  releasedSpy = jasmine.createSpy('released spy');
  boundary: string | HTMLElement;
  dragStartDelay: number | string | {touch: number; mouse: number};
  constrainPosition: (
    userPointerPosition: Point,
    dragRef: DragRef,
    dimensions: DOMRect,
    pickupPositionInElement: Point,
  ) => Point;
  freeDragPosition?: {x: number; y: number};
  dragDisabled = signal(false);
  dragLockAxis = signal<DragAxis | undefined>(undefined);
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div cdkDrag #dragElement style="width: 100px; height: 100px; background: red;"></div>
  `,
})
class StandaloneDraggableWithOnPush {
  @ViewChild('dragElement') dragElement: ElementRef<HTMLElement>;
  @ViewChild(CdkDrag) dragInstance: CdkDrag;
}

@Component({
  template: `
    <div #dragElement cdkDrag [cdkDragDisabled]="draggingDisabled"
      style="width: 100px; height: 100px; background: red; position: relative">
      <div #handleElement cdkDragHandle style="width: 10px; height: 10px; background: green;"></div>
    </div>
  `,
})
class StandaloneDraggableWithHandle {
  @ViewChild('dragElement') dragElement: ElementRef<HTMLElement>;
  @ViewChild('handleElement') handleElement: ElementRef<HTMLElement>;
  @ViewChild(CdkDrag) dragInstance: CdkDrag;
  @ViewChild(CdkDragHandle) handleInstance: CdkDragHandle;
  draggingDisabled = false;
}

@Component({
  template: `
    <div #dragElement cdkDrag
      style="width: 100px; height: 100px; background: red; position: relative">
      <div
        #handleElement
        cdkDragHandle
        [cdkDragHandleDisabled]="disableHandle"
        style="width: 10px; height: 10px; background: green;"></div>
    </div>
  `,
})
class StandaloneDraggableWithPreDisabledHandle {
  @ViewChild('dragElement') dragElement: ElementRef<HTMLElement>;
  @ViewChild('handleElement') handleElement: ElementRef<HTMLElement>;
  @ViewChild(CdkDrag) dragInstance: CdkDrag;
  disableHandle = true;
}

@Component({
  template: `
    <div #dragElement cdkDrag
      style="width: 100px; height: 100px; background: red; position: relative">
      @if (showHandle) {
        <div
          #handleElement
          cdkDragHandle style="width: 10px; height: 10px; background: green;"></div>
      }
    </div>
  `,
})
class StandaloneDraggableWithDelayedHandle {
  @ViewChild('dragElement') dragElement: ElementRef<HTMLElement>;
  @ViewChild('handleElement') handleElement: ElementRef<HTMLElement>;
  showHandle = false;
}

@Component({
  template: `
    <div #dragElement cdkDrag
      style="width: 100px; height: 100px; background: red; position: relative">

      <passthrough-component>
        <div
          #handleElement
          cdkDragHandle
          style="width: 10px; height: 10px; background: green;"></div>
      </passthrough-component>
    </div>
  `,
})
class StandaloneDraggableWithIndirectHandle {
  @ViewChild('dragElement') dragElement: ElementRef<HTMLElement>;
  @ViewChild('handleElement') handleElement: ElementRef<HTMLElement>;
}

@Component({
  selector: 'shadow-wrapper',
  template: '<ng-content></ng-content>',
  encapsulation: ViewEncapsulation.ShadowDom,
})
class ShadowWrapper {}

@Component({
  template: `
    <div #dragElement cdkDrag style="width: 100px; height: 100px; background: red;">
      <div cdkDragHandle style="width: 10px; height: 10px;">
        <shadow-wrapper>
          <div #handleChild style="width: 10px; height: 10px; background: green;"></div>
        </shadow-wrapper>
      </div>
    </div>
  `,
})
class StandaloneDraggableWithShadowInsideHandle {
  @ViewChild('dragElement') dragElement: ElementRef<HTMLElement>;
  @ViewChild('handleChild') handleChild: ElementRef<HTMLElement>;
}

@Component({
  encapsulation: ViewEncapsulation.None,
  styles: `
    .cdk-drag-handle {
      position: absolute;
      top: 0;
      background: green;
      width: 10px;
      height: 10px;
    }
  `,
  template: `
    <div #dragElement cdkDrag
      style="width: 100px; height: 100px; background: red; position: relative">
      <div cdkDragHandle style="left: 0;"></div>
      <div cdkDragHandle style="right: 0;"></div>
    </div>
  `,
})
class StandaloneDraggableWithMultipleHandles {
  @ViewChild('dragElement') dragElement: ElementRef<HTMLElement>;
  @ViewChildren(CdkDragHandle) handles: QueryList<CdkDragHandle>;
}

@Component({
  template: `
    <div #dragRoot class="alternate-root" style="width: 200px; height: 200px; background: hotpink">
      <div
        cdkDrag
        [cdkDragRootElement]="rootElementSelector"
        #dragElement
        style="width: 100px; height: 100px; background: red;"></div>
    </div>
  `,
})
class DraggableWithAlternateRoot {
  @ViewChild('dragElement') dragElement: ElementRef<HTMLElement>;
  @ViewChild('dragRoot') dragRoot: ElementRef<HTMLElement>;
  @ViewChild(CdkDrag) dragInstance: CdkDrag;
  rootElementSelector: string;
}

@Component({
  template: `
    <ng-container cdkDrag></ng-container>
  `,
})
class DraggableOnNgContainer {}

@Component({
  template: `
    <div cdkDrag>
      <ng-container cdkDragHandle></ng-container>
    </div>
  `,
})
class DragHandleOnNgContainer {}

@Component({
  template: `
    <div #dragRoot class="alternate-root" style="width: 200px; height: 200px; background: hotpink">
      <div
        cdkDrag
        cdkDragRootElement=".alternate-root"
        cdkDragHandle
        #dragElement
        style="width: 100px; height: 100px; background: red;"></div>
    </div>
  `,
})
class DraggableWithAlternateRootAndSelfHandle {
  @ViewChild('dragElement') dragElement: ElementRef<HTMLElement>;
  @ViewChild('dragRoot') dragRoot: ElementRef<HTMLElement>;
  @ViewChild(CdkDrag) dragInstance: CdkDrag;
}

@Component({
  template: `
    <div #dragRoot class="alternate-root" style="width: 200px; height: 200px; background: hotpink">
      <ng-container cdkDrag cdkDragRootElement=".alternate-root">
        <div style="width: 100px; height: 100px; background: red;"></div>
      </ng-container>
    </div>
  `,
})
class DraggableNgContainerWithAlternateRoot {
  @ViewChild('dragRoot') dragRoot: ElementRef<HTMLElement>;
  @ViewChild(CdkDrag) dragInstance: CdkDrag;
}

/**
 * Component that passes through whatever content is projected into it.
 * Used to test having drag elements being projected into a component.
 */
@Component({
  selector: 'passthrough-component',
  template: '<ng-content></ng-content>',
})
class PassthroughComponent {}

@Component({
  template: `<div cdkDrag></div>`,
})
class PlainStandaloneDraggable {
  @ViewChild(CdkDrag) dragInstance: CdkDrag;
}
