import {CdkScrollableModule} from '@angular/cdk/scrolling';
import {
  Component,
  ElementRef,
  NgZone,
  Provider,
  Type,
  ViewChild,
  provideZoneChangeDetection,
} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {DragDropModule} from '../drag-drop-module';
import {Point} from '../drag-ref';
import {CDK_DRAG_CONFIG, DragDropConfig} from './config';
import {CdkDrag} from './drag';
import {dragElementViaMouse} from './test-utils.spec';

describe('Standalone CdkDrag Zone.js integration', () => {
  function createComponent<T>(
    componentType: Type<T>,
    providers: Provider[] = [],
    dragDistance = 0,
    extraDeclarations: Type<any>[] = [],
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
      declarations: [componentType, ...extraDeclarations],
    });

    TestBed.compileComponents();
    return TestBed.createComponent<T>(componentType);
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
