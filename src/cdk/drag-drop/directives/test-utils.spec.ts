import {EnvironmentProviders, Provider, Type, ViewEncapsulation} from '@angular/core';
import {ComponentFixture, TestBed, flush, tick} from '@angular/core/testing';
import {dispatchMouseEvent, dispatchTouchEvent} from '@angular/cdk/testing/private';
import {CdkScrollableModule} from '@angular/cdk/scrolling';
import {DragDropModule} from '../drag-drop-module';
import {CDK_DRAG_CONFIG, DragDropConfig} from './config';

/**
 * Creates a component fixture that can be used in a test.
 * @param componentType Component for which to create the fixture.
 * @param config Object that can be used to further configure the test.
 */
export function createComponent<T>(
  componentType: Type<T>,
  config: {
    providers?: (Provider | EnvironmentProviders)[];
    dragDistance?: number;
    extraDeclarations?: Type<unknown>[];
    encapsulation?: ViewEncapsulation;
  } = {},
): ComponentFixture<T> {
  TestBed.configureTestingModule({
    imports: [DragDropModule, CdkScrollableModule],
    providers: [
      {
        provide: CDK_DRAG_CONFIG,
        useValue: {
          // We default the `dragDistance` to zero, because the majority of the tests
          // don't care about it and drags are a lot easier to simulate when we don't
          // have to deal with thresholds.
          dragStartThreshold: config?.dragDistance ?? 0,
          pointerDirectionChangeThreshold: 5,
        } as DragDropConfig,
      },
      ...(config.providers || []),
    ],
    declarations: [componentType, ...(config.extraDeclarations || [])],
  });

  if (config.encapsulation != null) {
    TestBed.overrideComponent(componentType, {
      set: {encapsulation: config.encapsulation},
    });
  }

  TestBed.compileComponents();
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

/** Gets the index of an element among its siblings, based on their position on the page. */
export function getElementIndexByPosition(element: Element, direction: 'top' | 'left') {
  return getElementSibligsByPosition(element, direction).indexOf(element);
}

/** Gets the siblings of an element, sorted by their position on the page. */
export function getElementSibligsByPosition(element: Element, direction: 'top' | 'left') {
  return element.parentElement
    ? Array.from(element.parentElement.children).sort((a, b) => {
        return a.getBoundingClientRect()[direction] - b.getBoundingClientRect()[direction];
      })
    : [];
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
  element.appendChild(veryTallElement);

  return () => {
    scrollTo(0, 0);
    veryTallElement.remove();
  };
}

/**
 * Asserts that sorting an element down works correctly.
 * @param fixture Fixture against which to run the assertions.
 * @param items Array of items against which to test sorting.
 */
export function assertDownwardSorting(fixture: ComponentFixture<any>, items: Element[]) {
  const draggedItem = items[0];
  const {top, left} = draggedItem.getBoundingClientRect();

  startDraggingViaMouse(fixture, draggedItem, left, top);

  const placeholder = document.querySelector('.cdk-drag-placeholder')! as HTMLElement;

  // Drag over each item one-by-one going downwards.
  for (let i = 0; i < items.length; i++) {
    const elementRect = items[i].getBoundingClientRect();

    // Add a few pixels to the top offset so we get some overlap.
    dispatchMouseEvent(document, 'mousemove', elementRect.left, elementRect.top + 5);
    fixture.detectChanges();
    expect(getElementIndexByPosition(placeholder, 'top')).toBe(i);
  }

  dispatchMouseEvent(document, 'mouseup');
  fixture.detectChanges();
  flush();
}

/**
 * Asserts that sorting an element up works correctly.
 * @param fixture Fixture against which to run the assertions.
 * @param items Array of items against which to test sorting.
 */
export function assertUpwardSorting(fixture: ComponentFixture<any>, items: Element[]) {
  const draggedItem = items[items.length - 1];
  const {top, left} = draggedItem.getBoundingClientRect();

  startDraggingViaMouse(fixture, draggedItem, left, top);

  const placeholder = document.querySelector('.cdk-drag-placeholder')! as HTMLElement;

  // Drag over each item one-by-one going upwards.
  for (let i = items.length - 1; i > -1; i--) {
    const elementRect = items[i].getBoundingClientRect();

    // Remove a few pixels from the bottom offset so we get some overlap.
    dispatchMouseEvent(document, 'mousemove', elementRect.left, elementRect.bottom - 5);
    fixture.detectChanges();
    expect(getElementIndexByPosition(placeholder, 'top')).toBe(i);
  }

  dispatchMouseEvent(document, 'mouseup');
  fixture.detectChanges();
  flush();
}

/** Ticks the specified amount of `requestAnimationFrame`-s. */
export function tickAnimationFrames(amount: number) {
  tick(16.6 * amount); // Angular turns rAF calls into 16.6ms timeouts in tests.
}
