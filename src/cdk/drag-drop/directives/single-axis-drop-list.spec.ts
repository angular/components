import {fakeAsync, flush} from '@angular/core/testing';
import {dispatchMouseEvent} from '@angular/cdk/testing/private';
import {_supportsShadowDom} from '@angular/cdk/platform';
import {createComponent, startDraggingViaMouse} from './test-utils.spec';
import {
  ConnectedDropZones,
  DraggableInDropZone,
  DraggableInScrollableVerticalDropZone,
  ITEM_HEIGHT,
  ITEM_WIDTH,
  defineCommonDropListTests,
  getHorizontalFixtures,
} from './drop-list-shared.spec';

describe('Single-axis drop list', () => {
  const {DraggableInHorizontalDropZone} = getHorizontalFixtures('horizontal');

  defineCommonDropListTests({
    verticalListOrientation: 'vertical',
    horizontalListOrientation: 'horizontal',
    getSortedSiblings: (element, direction) => {
      return element.parentElement
        ? Array.from(element.parentElement.children).sort((a, b) => {
            return a.getBoundingClientRect()[direction] - b.getBoundingClientRect()[direction];
          })
        : [];
    },
  });

  it('should lay out the elements correctly, when swapping down with a taller element', fakeAsync(() => {
    const fixture = createComponent(DraggableInDropZone);
    fixture.detectChanges();

    const items = fixture.componentInstance.dragItems.map(i => i.element.nativeElement);
    const {top, left} = items[0].getBoundingClientRect();

    fixture.componentInstance.items[0].height = ITEM_HEIGHT * 2;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    startDraggingViaMouse(fixture, items[0], left, top);

    const placeholder = document.querySelector('.cdk-drag-placeholder')! as HTMLElement;
    const target = items[1];
    const targetRect = target.getBoundingClientRect();

    // Add a few pixels to the top offset so we get some overlap.
    dispatchMouseEvent(document, 'mousemove', targetRect.left, targetRect.top + 5);
    fixture.detectChanges();

    expect(placeholder.style.transform).toBe(`translate3d(0px, ${ITEM_HEIGHT}px, 0px)`);
    expect(target.style.transform).toBe(`translate3d(0px, ${-ITEM_HEIGHT * 2}px, 0px)`);

    dispatchMouseEvent(document, 'mouseup');
    fixture.detectChanges();
    flush();
  }));

  it('should lay out the elements correctly, when swapping up with a taller element', fakeAsync(() => {
    const fixture = createComponent(DraggableInDropZone);
    fixture.detectChanges();

    const items = fixture.componentInstance.dragItems.map(i => i.element.nativeElement);
    const {top, left} = items[1].getBoundingClientRect();

    fixture.componentInstance.items[1].height = ITEM_HEIGHT * 2;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    startDraggingViaMouse(fixture, items[1], left, top);

    const placeholder = document.querySelector('.cdk-drag-placeholder')! as HTMLElement;
    const target = items[0];
    const targetRect = target.getBoundingClientRect();

    // Add a few pixels to the top offset so we get some overlap.
    dispatchMouseEvent(document, 'mousemove', targetRect.left, targetRect.bottom - 5);
    fixture.detectChanges();

    expect(placeholder.style.transform).toBe(`translate3d(0px, ${-ITEM_HEIGHT}px, 0px)`);
    expect(target.style.transform).toBe(`translate3d(0px, ${ITEM_HEIGHT * 2}px, 0px)`);

    dispatchMouseEvent(document, 'mouseup');
    fixture.detectChanges();
    flush();
  }));

  it('should lay out elements correctly, when swapping an item with margin', fakeAsync(() => {
    const fixture = createComponent(DraggableInDropZone);
    fixture.detectChanges();

    const items = fixture.componentInstance.dragItems.map(i => i.element.nativeElement);
    const {top, left} = items[0].getBoundingClientRect();

    fixture.componentInstance.items[0].margin = 12;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    startDraggingViaMouse(fixture, items[0], left, top);

    const placeholder = document.querySelector('.cdk-drag-placeholder')! as HTMLElement;
    const target = items[1];
    const targetRect = target.getBoundingClientRect();

    // Add a few pixels to the top offset so we get some overlap.
    dispatchMouseEvent(document, 'mousemove', targetRect.left, targetRect.top + 5);
    fixture.detectChanges();

    expect(placeholder.style.transform).toBe(`translate3d(0px, ${ITEM_HEIGHT + 12}px, 0px)`);
    expect(target.style.transform).toBe(`translate3d(0px, ${-ITEM_HEIGHT - 12}px, 0px)`);

    dispatchMouseEvent(document, 'mouseup');
    fixture.detectChanges();
    flush();
  }));

  it('should lay out the elements correctly, when swapping to the right with a wider element', fakeAsync(() => {
    const fixture = createComponent(DraggableInHorizontalDropZone);
    fixture.detectChanges();

    const items = fixture.componentInstance.dragItems.map(i => i.element.nativeElement);

    fixture.componentInstance.items[0].width = ITEM_WIDTH * 2;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    const {top, left} = items[0].getBoundingClientRect();
    startDraggingViaMouse(fixture, items[0], left, top);

    const placeholder = document.querySelector('.cdk-drag-placeholder')! as HTMLElement;
    const target = items[1];
    const targetRect = target.getBoundingClientRect();

    dispatchMouseEvent(document, 'mousemove', targetRect.right - 5, targetRect.top);
    fixture.detectChanges();

    expect(placeholder.style.transform).toBe(`translate3d(${ITEM_WIDTH}px, 0px, 0px)`);
    expect(target.style.transform).toBe(`translate3d(${-ITEM_WIDTH * 2}px, 0px, 0px)`);

    dispatchMouseEvent(document, 'mouseup');
    fixture.detectChanges();
    flush();
  }));

  it('should lay out the elements correctly, when swapping left with a wider element', fakeAsync(() => {
    const fixture = createComponent(DraggableInHorizontalDropZone);
    fixture.detectChanges();

    const items = fixture.componentInstance.dragItems.map(i => i.element.nativeElement);
    const {top, left} = items[1].getBoundingClientRect();

    fixture.componentInstance.items[1].width = ITEM_WIDTH * 2;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    startDraggingViaMouse(fixture, items[1], left, top);

    const placeholder = document.querySelector('.cdk-drag-placeholder')! as HTMLElement;
    const target = items[0];
    const targetRect = target.getBoundingClientRect();

    dispatchMouseEvent(document, 'mousemove', targetRect.right - 5, targetRect.top);
    fixture.detectChanges();

    expect(placeholder.style.transform).toBe(`translate3d(${-ITEM_WIDTH}px, 0px, 0px)`);
    expect(target.style.transform).toBe(`translate3d(${ITEM_WIDTH * 2}px, 0px, 0px)`);

    dispatchMouseEvent(document, 'mouseup');
    fixture.detectChanges();
    flush();
  }));

  it('should clear the `transform` value from siblings when item is dropped', fakeAsync(() => {
    const fixture = createComponent(DraggableInDropZone);
    fixture.detectChanges();

    const dragItems = fixture.componentInstance.dragItems;
    const firstItem = dragItems.first;
    const thirdItem = dragItems.toArray()[2].element.nativeElement;
    const thirdItemRect = thirdItem.getBoundingClientRect();

    startDraggingViaMouse(fixture, firstItem.element.nativeElement);

    dispatchMouseEvent(document, 'mousemove', thirdItemRect.left + 1, thirdItemRect.top + 1);
    fixture.detectChanges();

    expect(thirdItem.style.transform).toBeTruthy();

    dispatchMouseEvent(document, 'mouseup');
    fixture.detectChanges();
    flush();
    fixture.detectChanges();

    expect(thirdItem.style.transform).toBeFalsy();
  }));

  it('should lay out elements correctly, when horizontally swapping an item with margin', fakeAsync(() => {
    const fixture = createComponent(DraggableInHorizontalDropZone);
    fixture.detectChanges();

    const items = fixture.componentInstance.dragItems.map(i => i.element.nativeElement);
    const {top, left} = items[0].getBoundingClientRect();

    fixture.componentInstance.items[0].margin = 12;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    startDraggingViaMouse(fixture, items[0], left, top);

    const placeholder = document.querySelector('.cdk-drag-placeholder')! as HTMLElement;
    const target = items[1];
    const targetRect = target.getBoundingClientRect();

    dispatchMouseEvent(document, 'mousemove', targetRect.right - 5, targetRect.top);
    fixture.detectChanges();

    expect(placeholder.style.transform).toBe(`translate3d(${ITEM_WIDTH + 12}px, 0px, 0px)`);
    expect(target.style.transform).toBe(`translate3d(${-ITEM_WIDTH - 12}px, 0px, 0px)`);

    dispatchMouseEvent(document, 'mouseup');
    fixture.detectChanges();
    flush();
  }));

  it('should preserve the original `transform` of items in the list', fakeAsync(() => {
    const fixture = createComponent(DraggableInScrollableVerticalDropZone);
    fixture.detectChanges();
    const items = fixture.componentInstance.dragItems.map(item => item.element.nativeElement);
    items.forEach(element => (element.style.transform = 'rotate(180deg)'));
    const thirdItemRect = items[2].getBoundingClientRect();
    const hasInitialTransform = (element: HTMLElement) =>
      element.style.transform.indexOf('rotate(180deg)') > -1;

    startDraggingViaMouse(fixture, items[0]);
    fixture.detectChanges();
    const preview = document.querySelector('.cdk-drag-preview') as HTMLElement;
    const placeholder = fixture.nativeElement.querySelector('.cdk-drag-placeholder');

    expect(items.every(hasInitialTransform))
      .withContext('Expected items to preserve transform when dragging starts.')
      .toBe(true);
    expect(hasInitialTransform(preview))
      .withContext('Expected preview to preserve transform when dragging starts.')
      .toBe(true);
    expect(hasInitialTransform(placeholder))
      .withContext('Expected placeholder to preserve transform when dragging starts.')
      .toBe(true);

    dispatchMouseEvent(document, 'mousemove', thirdItemRect.left + 1, thirdItemRect.top + 1);
    fixture.detectChanges();
    expect(items.every(hasInitialTransform))
      .withContext('Expected items to preserve transform while dragging.')
      .toBe(true);
    expect(hasInitialTransform(preview))
      .withContext('Expected preview to preserve transform while dragging.')
      .toBe(true);
    expect(hasInitialTransform(placeholder))
      .withContext('Expected placeholder to preserve transform while dragging.')
      .toBe(true);

    dispatchMouseEvent(document, 'mouseup');
    fixture.detectChanges();
    flush();
    fixture.detectChanges();
    expect(items.every(hasInitialTransform))
      .withContext('Expected items to preserve transform when dragging stops.')
      .toBe(true);
    expect(hasInitialTransform(preview))
      .withContext('Expected preview to preserve transform when dragging stops.')
      .toBe(true);
    expect(hasInitialTransform(placeholder))
      .withContext('Expected placeholder to preserve transform when dragging stops.')
      .toBe(true);
  }));

  it('should enter as last child if entering from top in reversed container', fakeAsync(() => {
    const fixture = createComponent(ConnectedDropZones);

    // Make sure there's only one item in the first list.
    fixture.componentInstance.todo = ['things'];
    fixture.detectChanges();

    const groups = fixture.componentInstance.groupedDragItems;
    const dropZones = fixture.componentInstance.dropInstances.map(d => d.element.nativeElement);
    const item = groups[0][0];

    // Add some initial padding as the target drop zone
    const targetDropZoneStyle = dropZones[1].style;
    targetDropZoneStyle.paddingTop = '10px';
    targetDropZoneStyle.display = 'flex';
    targetDropZoneStyle.flexDirection = 'column-reverse';

    const targetRect = dropZones[1].getBoundingClientRect();

    startDraggingViaMouse(fixture, item.element.nativeElement);

    const placeholder = dropZones[0].querySelector('.cdk-drag-placeholder')!;

    expect(placeholder).toBeTruthy();

    expect(dropZones[0].contains(placeholder))
      .withContext('Expected placeholder to be inside the first container.')
      .toBe(true);

    dispatchMouseEvent(document, 'mousemove', targetRect.left, targetRect.top);
    fixture.detectChanges();

    expect(dropZones[1].lastChild === placeholder)
      .withContext('Expected placeholder to be last child inside second container.')
      .toBe(true);

    dispatchMouseEvent(document, 'mouseup');
  }));
});
