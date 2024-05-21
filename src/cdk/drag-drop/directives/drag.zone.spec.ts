import {CdkScrollableModule} from '@angular/cdk/scrolling';
import {dispatchMouseEvent} from '@angular/cdk/testing/private';
import {
  Component,
  ElementRef,
  NgZone,
  Provider,
  Type,
  ViewChild,
  ViewEncapsulation,
  provideZoneChangeDetection,
} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {DragDropModule} from '../drag-drop-module';
import {Point} from '../drag-ref';
import {CDK_DRAG_CONFIG, DragDropConfig} from './config';
import {CdkDrag} from './drag';

describe('CdkDrag Zone.js integration', () => {
  function createComponent<T>(
    componentType: Type<T>,
    providers: Provider[] = [],
    dragDistance = 0,
    extraDeclarations: Type<any>[] = [],
    encapsulation?: ViewEncapsulation,
  ): ComponentFixture<T> {
    TestBed.configureTestingModule({
      imports: [DragDropModule, CdkScrollableModule],
      providers: [
        provideZoneChangeDetection(),
        {
          provide: CDK_DRAG_CONFIG,
          useValue: {
            // We default the `dragDistance` to zero, because the majority of the tests
            // don't care about it and drags are a lot easier to simulate when we don't
            // have to deal with thresholds.
            dragStartThreshold: dragDistance,
            pointerDirectionChangeThreshold: 5,
          } as DragDropConfig,
        },
        ...providers,
      ],
      declarations: [PassthroughComponent, componentType, ...extraDeclarations],
    });

    if (encapsulation != null) {
      TestBed.overrideComponent(componentType, {
        set: {encapsulation},
      });
    }

    TestBed.compileComponents();
    return TestBed.createComponent<T>(componentType);
  }

  describe('standalone draggable', () => {
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
});

/**
 * Dispatches the events for starting a drag sequence.
 * @param fixture Fixture on which to run change detection.
 * @param element Element on which to dispatch the events.
 * @param x Position along the x axis to which to drag the element.
 * @param y Position along the y axis to which to drag the element.
 */
function startDraggingViaMouse(
  fixture: ComponentFixture<any>,
  element: Element,
  x?: number,
  y?: number,
) {
  dispatchMouseEvent(element, 'mousedown', x, y);
  fixture.changeDetectorRef.markForCheck();
  fixture.detectChanges();

  dispatchMouseEvent(document, 'mousemove', x, y);
  fixture.changeDetectorRef.markForCheck();
  fixture.detectChanges();
}

/**
 * Drags an element to a position on the page using the mouse.
 * @param fixture Fixture on which to run change detection.
 * @param element Element which is being dragged.
 * @param x Position along the x axis to which to drag the element.
 * @param y Position along the y axis to which to drag the element.
 */
function dragElementViaMouse(
  fixture: ComponentFixture<any>,
  element: Element,
  x: number,
  y: number,
) {
  startDraggingViaMouse(fixture, element);

  dispatchMouseEvent(document, 'mousemove', x, y);
  fixture.changeDetectorRef.markForCheck();
  fixture.detectChanges();

  dispatchMouseEvent(document, 'mouseup', x, y);
  fixture.changeDetectorRef.markForCheck();
  fixture.detectChanges();
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
