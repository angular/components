import {
  Component,
  ElementRef,
  NgZone,
  Type,
  ViewChild,
  provideZoneChangeDetection,
} from '@angular/core';
import {Point} from '../drag-ref';
import {CdkDrag} from './drag';
import {createComponent as _createComponent, dragElementViaMouse} from './test-utils.spec';
import {ComponentFixture} from '@angular/core/testing';

describe('Standalone CdkDrag Zone.js integration', () => {
  function createComponent<T>(type: Type<T>): ComponentFixture<T> {
    return _createComponent(type, {
      providers: [provideZoneChangeDetection()],
    });
  }

  it('should emit to `moved` inside the NgZone', () => {
    const fixture = createComponent(StandaloneDraggable);
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    const spy = jasmine.createSpy('move spy');
    const subscription = fixture.componentInstance.dragInstance.moved.subscribe(() =>
      spy(NgZone.isInAngularZone()),
    );

    dragElementViaMouse(fixture, fixture.componentInstance.dragElement.nativeElement, 10, 20);
    expect(spy).toHaveBeenCalledWith(true);

    subscription.unsubscribe();
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
        (cdkDragStarted)="startedSpy($event)"
        (cdkDragReleased)="releasedSpy($event)"
        (cdkDragEnded)="endedSpy($event)"
        #dragElement
        style="width: 100px; height: 100px; background: red;"></div>
    </div>
  `,
  imports: [CdkDrag],
})
class StandaloneDraggable {
  @ViewChild('dragElement') dragElement: ElementRef<HTMLElement>;
  @ViewChild(CdkDrag) dragInstance: CdkDrag;
  startedSpy = jasmine.createSpy('started spy');
  endedSpy = jasmine.createSpy('ended spy');
  releasedSpy = jasmine.createSpy('released spy');
  boundary: string | HTMLElement;
  dragStartDelay: number | string | {touch: number; mouse: number};
  constrainPosition: (point: Point) => Point;
  freeDragPosition?: {x: number; y: number};
}
