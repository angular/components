import {Directionality} from '@angular/cdk/bidi';
import {ScrollDispatcher} from '@angular/cdk/scrolling';
import {SpyLocation} from '@angular/common/testing';
import {
  Component,
  Directive,
  Injector,
  NgZone,
  ViewChild,
  ViewContainerRef,
  provideZoneChangeDetection,
} from '@angular/core';
import {ComponentFixture, TestBed, fakeAsync, flush, inject} from '@angular/core/testing';
import {MatDialog, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {Subject} from 'rxjs';

describe('MatDialog', () => {
  let dialog: MatDialog;
  let scrolledSubject = new Subject();

  let testViewContainerRef: ViewContainerRef;
  let viewContainerFixture: ComponentFixture<ComponentWithChildViewContainer>;

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        NoopAnimationsModule,
        ComponentWithChildViewContainer,
        PizzaMsg,
        DirectiveWithViewContainer,
      ],
      providers: [
        provideZoneChangeDetection(),
        {provide: Location, useClass: SpyLocation},
        {
          provide: ScrollDispatcher,
          useFactory: () => ({
            scrolled: () => scrolledSubject,
            register: () => {},
            deregister: () => {},
          }),
        },
      ],
    });
  }));

  beforeEach(inject([MatDialog], (d: MatDialog) => {
    dialog = d;
  }));

  beforeEach(() => {
    viewContainerFixture = TestBed.createComponent(ComponentWithChildViewContainer);

    viewContainerFixture.detectChanges();
    testViewContainerRef = viewContainerFixture.componentInstance.childViewContainer;
  });

  it('should invoke the afterClosed callback inside the NgZone', fakeAsync(
    inject([NgZone], (zone: NgZone) => {
      const dialogRef = dialog.open(PizzaMsg, {viewContainerRef: testViewContainerRef});
      const afterCloseCallback = jasmine.createSpy('afterClose callback');

      dialogRef.afterClosed().subscribe(() => {
        afterCloseCallback(NgZone.isInAngularZone());
      });
      zone.run(() => {
        dialogRef.close();
        viewContainerFixture.detectChanges();
        flush();
      });

      expect(afterCloseCallback).toHaveBeenCalledWith(true);
    }),
  ));
});

@Directive({
  selector: 'dir-with-view-container',
  standalone: true,
})
class DirectiveWithViewContainer {
  constructor(public viewContainerRef: ViewContainerRef) {}
}

@Component({
  selector: 'arbitrary-component',
  template: `@if (showChildView) {<dir-with-view-container></dir-with-view-container>}`,
  standalone: true,
  imports: [DirectiveWithViewContainer],
})
class ComponentWithChildViewContainer {
  showChildView = true;

  @ViewChild(DirectiveWithViewContainer) childWithViewContainer: DirectiveWithViewContainer;

  get childViewContainer() {
    return this.childWithViewContainer.viewContainerRef;
  }
}

/** Simple component for testing ComponentPortal. */
@Component({
  template: '<p>Pizza</p> <input> <button>Close</button>',
  standalone: true,
})
class PizzaMsg {
  constructor(
    public dialogRef: MatDialogRef<PizzaMsg>,
    public dialogInjector: Injector,
    public directionality: Directionality,
  ) {}
}
