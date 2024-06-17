import {Component, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {fakeAsync, flush} from '@angular/core/testing';
import {CdkDropList} from './drop-list';
import {CdkDrag} from './drag';
import {moveItemInArray} from '../drag-utils';
import {CdkDragDrop} from '../drag-events';
import {
  ITEM_HEIGHT,
  ITEM_WIDTH,
  assertStartToEndSorting,
  assertEndToStartSorting,
  defineCommonDropListTests,
} from './drop-list-shared.spec';
import {createComponent, dragElementViaMouse} from './test-utils.spec';

describe('mixed drop list', () => {
  defineCommonDropListTests({
    verticalListOrientation: 'mixed',
    horizontalListOrientation: 'mixed',
    getSortedSiblings,
  });

  it('should dispatch the `dropped` event in a wrapping drop zone', fakeAsync(() => {
    const fixture = createComponent(DraggableInHorizontalWrappingDropZone);
    fixture.detectChanges();
    const dragItems = fixture.componentInstance.dragItems;

    expect(dragItems.map(drag => drag.element.nativeElement.textContent!.trim())).toEqual([
      'Zero',
      'One',
      'Two',
      'Three',
      'Four',
      'Five',
      'Six',
      'Seven',
    ]);

    const firstItem = dragItems.first;
    const seventhItemRect = dragItems.toArray()[6].element.nativeElement.getBoundingClientRect();

    dragElementViaMouse(
      fixture,
      firstItem.element.nativeElement,
      seventhItemRect.left + 1,
      seventhItemRect.top + 1,
    );
    flush();
    fixture.detectChanges();

    expect(fixture.componentInstance.droppedSpy).toHaveBeenCalledTimes(1);
    const event = fixture.componentInstance.droppedSpy.calls.mostRecent().args[0];

    // Assert the event like this, rather than `toHaveBeenCalledWith`, because Jasmine will
    // go into an infinite loop trying to stringify the event, if the test fails.
    expect(event).toEqual({
      previousIndex: 0,
      currentIndex: 6,
      item: firstItem,
      container: fixture.componentInstance.dropInstance,
      previousContainer: fixture.componentInstance.dropInstance,
      isPointerOverContainer: true,
      distance: {x: jasmine.any(Number), y: jasmine.any(Number)},
      dropPoint: {x: jasmine.any(Number), y: jasmine.any(Number)},
      event: jasmine.anything(),
    });

    expect(dragItems.map(drag => drag.element.nativeElement.textContent!.trim())).toEqual([
      'One',
      'Two',
      'Three',
      'Four',
      'Five',
      'Six',
      'Zero',
      'Seven',
    ]);
  }));

  it('should move the placeholder as an item is being sorted to the right in a wrapping drop zone', fakeAsync(() => {
    const fixture = createComponent(DraggableInHorizontalWrappingDropZone);
    fixture.detectChanges();
    assertStartToEndSorting(
      'horizontal',
      fixture,
      getSortedSiblings,
      fixture.componentInstance.dragItems.map(item => item.element.nativeElement),
    );
  }));

  it('should move the placeholder as an item is being sorted to the left in a wrapping drop zone', fakeAsync(() => {
    const fixture = createComponent(DraggableInHorizontalWrappingDropZone);
    fixture.detectChanges();
    assertEndToStartSorting(
      'horizontal',
      fixture,
      getSortedSiblings,
      fixture.componentInstance.dragItems.map(item => item.element.nativeElement),
    );
  }));
});

function getSortedSiblings(item: Element) {
  return Array.from(item.parentElement?.children || []);
}

@Component({
  styles: `
    .cdk-drop-list {
      display: block;
      width: ${ITEM_WIDTH * 3}px;
      background: pink;
      font-size: 0;
    }

    .cdk-drag {
      height: ${ITEM_HEIGHT * 2}px;
      width: ${ITEM_WIDTH}px;
      background: red;
      display: inline-block;
    }
  `,
  template: `
    <div
      cdkDropList
      cdkDropListOrientation="mixed"
      [cdkDropListData]="items"
      (cdkDropListDropped)="droppedSpy($event)">
      @for (item of items; track item) {
        <div cdkDrag>{{item}}</div>
      }
    </div>
  `,
  standalone: true,
  imports: [CdkDropList, CdkDrag],
})
class DraggableInHorizontalWrappingDropZone {
  @ViewChildren(CdkDrag) dragItems: QueryList<CdkDrag>;
  @ViewChild(CdkDropList) dropInstance: CdkDropList;
  items = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven'];
  droppedSpy = jasmine.createSpy('dropped spy').and.callFake((event: CdkDragDrop<string[]>) => {
    moveItemInArray(this.items, event.previousIndex, event.currentIndex);
  });
}
