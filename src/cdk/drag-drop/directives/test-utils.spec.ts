import {EnvironmentProviders, Provider, Type, ViewEncapsulation} from '@angular/core';
import {ComponentFixture, TestBed, tick} from '@angular/core/testing';
import {dispatchMouseEvent, dispatchTouchEvent} from '../../testing/private';
import {CDK_DRAG_CONFIG, DragDropConfig, DropListOrientation} from './config';

/** Options that can be used to configure a test. */
export interface DragDropTestConfig {
  providers?: (Provider | EnvironmentProviders)[];
  dragDistance?: number;
  encapsulation?: ViewEncapsulation;
  listOrientation?: DropListOrientation;
}

/**
 * Creates a component fixture that can be used in a test.
 * @param componentType Component for which to create the fixture.
 * @param config Object that can be used to further configure the test.
 */
export function createComponent<T>(
  componentType: Type<T>,
  config: DragDropTestConfig = {},
): ComponentFixture<T> {
  const dragConfig: DragDropConfig = {
    // We default the `dragDistance` to zero, because the majority of the tests
    // don't care about it and drags are a lot easier to simulate when we don't
    // have to deal with thresholds.
    dragStartThreshold: config?.dragDistance ?? 0,
    pointerDirectionChangeThreshold: 5,
    listOrientation: config.listOrientation,
  };

  TestBed.configureTestingModule({
    imports: [componentType],
    providers: [
      {
        provide: CDK_DRAG_CONFIG,
        useValue: dragConfig,
      },
      ...(config.providers || []),
    ],
  });

  if (config.encapsulation != null) {
    TestBed.overrideComponent(componentType, {
      set: {encapsulation: config.encapsulation},
    });
  }

  return TestBed.createComponent<T>(componentType);
}

/**
 * Drags an element to a position on the page using the mouse.
 * @param fixture Fixture on which to run change detection.
 * @param element Element which is being dragged.
 * @param x Position along the x axis to which to drag the element.
 * @param y Position along the y axis to which to drag the element.
 */
export function dragElementViaMouse(
  fixture: ComponentFixture<any>,
  element: Element,
  x: number,
  y: number,
) {
  startDraggingViaMouse(fixture, element);

  dispatchMouseEvent(document, 'mousemove', x, y);
  fixture.detectChanges();

  dispatchMouseEvent(document, 'mouseup', x, y);
  fixture.detectChanges();
}

/**
 * Dispatches the events for starting a drag sequence.
 * @param fixture Fixture on which to run change detection.
 * @param element Element on which to dispatch the events.
 * @param x Position along the x axis to which to drag the element.
 * @param y Position along the y axis to which to drag the element.
 */
export function startDraggingViaMouse(
  fixture: ComponentFixture<any>,
  element: Element,
  x?: number,
  y?: number,
) {
  dispatchMouseEvent(element, 'mousedown', x, y);
  fixture.detectChanges();

  dispatchMouseEvent(document, 'mousemove', x, y);
  fixture.detectChanges();
}

/**
 * Drags an element to a position on the page using a touch device.
 * @param fixture Fixture on which to run change detection.
 * @param element Element which is being dragged.
 * @param x Position along the x axis to which to drag the element.
 * @param y Position along the y axis to which to drag the element.
 */
export function dragElementViaTouch(
  fixture: ComponentFixture<any>,
  element: Element,
  x: number,
  y: number,
) {
  startDraggingViaTouch(fixture, element);
  continueDraggingViaTouch(fixture, x, y);
  stopDraggingViaTouch(fixture, x, y);
}

/**
 * @param fixture Fixture on which to run change detection.
 * @param element Element which is being dragged.
 */
export function startDraggingViaTouch(fixture: ComponentFixture<any>, element: Element) {
  dispatchTouchEvent(element, 'touchstart');
  fixture.detectChanges();

  dispatchTouchEvent(document, 'touchmove');
  fixture.detectChanges();
}

/**
 * @param fixture Fixture on which to run change detection.
 * @param x Position along the x axis to which to drag the element.
 * @param y Position along the y axis to which to drag the element.
 */
export function continueDraggingViaTouch(fixture: ComponentFixture<any>, x: number, y: number) {
  dispatchTouchEvent(document, 'touchmove', x, y);
  fixture.detectChanges();
}

/**
 * @param fixture Fixture on which to run change detection.
 * @param x Position along the x axis to which to drag the element.
 * @param y Position along the y axis to which to drag the element.
 */
export function stopDraggingViaTouch(fixture: ComponentFixture<any>, x: number, y: number) {
  dispatchTouchEvent(document, 'touchend', x, y);
  fixture.detectChanges();
}

/**
 * Adds a large element to the page in order to make it scrollable.
 * @returns Function that should be used to clean up after the test is done.
 */
export function makeScrollable(
  direction: 'vertical' | 'horizontal' = 'vertical',
  element = document.body,
) {
  const veryTallElement = document.createElement('div');
  veryTallElement.style.width = direction === 'vertical' ? '100%' : '4000px';
  veryTallElement.style.height = direction === 'vertical' ? '2000px' : '5px';
  element.prepend(veryTallElement);

  return () => {
    scrollTo(0, 0);
    veryTallElement.remove();
  };
}

/** Ticks the specified amount of `requestAnimationFrame`-s. */
export function tickAnimationFrames(amount: number) {
  tick(16.6 * amount); // Angular turns rAF calls into 16.6ms timeouts in tests.
}
