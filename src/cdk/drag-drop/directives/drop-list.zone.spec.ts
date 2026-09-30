import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  QueryList,
  ViewChild,
  ViewChildren,
  provideZoneChangeDetection,
} from '@angular/core';
import {ComponentFixtureAutoDetect} from '@angular/core/testing';
import {dispatchMouseEvent} from '../../testing/private';
import {CdkDragDrop} from '../drag-events';
import {moveItemInArray} from '../drag-utils';
import {CdkDrag} from './drag';
import {CdkDropList} from './drop-list';
import {createComponent, startDraggingViaMouse} from './test-utils.spec';

describe('CdkDropList Zone.js integration', () => {
  it('should render the new order and clean up in the same task as the drop', async () => {
    const fixture = createComponent(DraggableInDropZone, {
      providers: [
        provideZoneChangeDetection(),
        {provide: ComponentFixtureAutoDetect, useValue: true},
      ],
    });
    fixture.detectChanges();

    const list = fixture.componentInstance.list.nativeElement;
    const items = fixture.componentInstance.dragItems.map(item => item.element.nativeElement);
    const thirdItemRect = items[2].getBoundingClientRect();

    startDraggingViaMouse(fixture, items[0]);
    dispatchMouseEvent(document, 'mousemove', thirdItemRect.left + 1, thirdItemRect.top + 1);
    fixture.detectChanges();
    dispatchMouseEvent(document, 'mouseup', thirdItemRect.left + 1, thirdItemRect.top + 1);

    // Wait for the drop sequence to finish, but not for anything past the current task.
    await Promise.resolve();

    expect(fixture.componentInstance.items).toEqual(['One', 'Two', 'Zero', 'Three']);
    expect(Array.from(list.children).map(child => child.textContent!.trim())).toEqual([
      'One',
      'Two',
      'Zero',
      'Three',
    ]);
    expect(items.map(item => item.style.transform)).toEqual(['', '', '', '']);
    expect(items[0].style.opacity).toBeFalsy();
    expect(list.querySelector('.cdk-drag-placeholder')).toBeFalsy();
    expect(document.querySelector('.cdk-drag-preview')).toBeFalsy();
  });
});

@Component({
  template: `
    <div cdkDropList #list style="width: 100px" (cdkDropListDropped)="drop($event)">
      @for (item of items; track item) {
        <div cdkDrag style="height: 25px">{{item}}</div>
      }
    </div>
  `,
  imports: [CdkDropList, CdkDrag],
  changeDetection: ChangeDetectionStrategy.Eager,
})
class DraggableInDropZone {
  @ViewChild('list', {read: ElementRef}) list!: ElementRef<HTMLElement>;
  @ViewChildren(CdkDrag) dragItems!: QueryList<CdkDrag>;
  items = ['Zero', 'One', 'Two', 'Three'];

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.items, event.previousIndex, event.currentIndex);
  }
}
