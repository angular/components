import {ComponentFixture, flush} from '@angular/core/testing';
import {dispatchMouseEvent} from '@angular/cdk/testing/private';
import {_supportsShadowDom} from '@angular/cdk/platform';

import {startDraggingViaMouse} from './test-utils.spec';
import {defineCommonDropListTests} from './drop-list-shared.spec';

describe('Single-axis drop list', () => {
  defineCommonDropListTests({
    verticalListOrientation: 'vertical',
    horizontalListOrientation: 'horizontal',
    getElementIndexByPosition,
    getElementSibligsByPosition,
    assertUpwardSorting,
    assertDownwardSorting,
  });

  function getElementIndexByPosition(element: Element, direction: 'top' | 'left') {
    return getElementSibligsByPosition(element, direction).indexOf(element);
  }

  function getElementSibligsByPosition(element: Element, direction: 'top' | 'left') {
    return element.parentElement
      ? Array.from(element.parentElement.children).sort((a, b) => {
          return a.getBoundingClientRect()[direction] - b.getBoundingClientRect()[direction];
        })
      : [];
  }

  function assertDownwardSorting(fixture: ComponentFixture<any>, items: Element[]) {
    const draggedItem = items[0];
    const {top, left} = draggedItem.getBoundingClientRect();

    startDraggingViaMouse(fixture, draggedItem, left, top);

    const placeholder = document.querySelector('.cdk-drag-placeholder')! as HTMLElement;

    // Drag over each item one-by-one going downwards.
    for (let i = 0; i < items.length; i++) {
      const elementRect = items[i].getBoundingClientRect();

      // Add a few pixels to the top offset so we get some overlap.
      dispatchMouseEvent(document, 'mousemove', elementRect.left, elementRect.top + 5);
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      expect(getElementIndexByPosition(placeholder, 'top')).toBe(i);
    }

    dispatchMouseEvent(document, 'mouseup');
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    flush();
  }

  function assertUpwardSorting(fixture: ComponentFixture<any>, items: Element[]) {
    const draggedItem = items[items.length - 1];
    const {top, left} = draggedItem.getBoundingClientRect();

    startDraggingViaMouse(fixture, draggedItem, left, top);

    const placeholder = document.querySelector('.cdk-drag-placeholder')! as HTMLElement;

    // Drag over each item one-by-one going upwards.
    for (let i = items.length - 1; i > -1; i--) {
      const elementRect = items[i].getBoundingClientRect();

      // Remove a few pixels from the bottom offset so we get some overlap.
      dispatchMouseEvent(document, 'mousemove', elementRect.left, elementRect.bottom - 5);
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      expect(getElementIndexByPosition(placeholder, 'top')).toBe(i);
    }

    dispatchMouseEvent(document, 'mouseup');
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    flush();
  }
});
