import {Component, ElementRef, inject} from '@angular/core';
import {TestBed, fakeAsync} from '@angular/core/testing';
import {DragDrop} from './drag-drop';
import {DragDropModule} from './drag-drop-module';
import {DragRef} from './drag-ref';
import {DropListRef} from './drop-list-ref';

describe('DragDrop', () => {
  let service: DragDrop;

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [DragDropModule, TestComponent],
    });

    service = TestBed.inject(DragDrop);
  }));

  it('should be able to attach a DragRef to a DOM node', () => {
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    const ref = service.createDrag(fixture.componentInstance.elementRef);

    expect(ref instanceof DragRef).toBe(true);
  });

  it('should be able to attach a DropListRef to a DOM node', () => {
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    const ref = service.createDropList(fixture.componentInstance.elementRef);

    expect(ref instanceof DropListRef).toBe(true);
  });
});

@Component({
  template: '<div></div>',
})
class TestComponent {
  elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
}
