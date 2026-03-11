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
  inject,
} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatDialog, MatDialogRef} from '../dialog';
import {Subject} from 'rxjs';
import {MATERIAL_ANIMATIONS} from '../core';

describe('MatDialog', () => {
  let dialog: MatDialog;
  let zone: NgZone;
  let scrolledSubject = new Subject();

  let testViewContainerRef: ViewContainerRef;
  let viewContainerFixture: ComponentFixture<ComponentWithChildViewContainer>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZoneChangeDetection(),
        {provide: Location, useClass: SpyLocation},
        {provide: MATERIAL_ANIMATIONS, useValue: {animationsDisabled: true}},
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

    dialog = TestBed.inject(MatDialog);
    zone = TestBed.inject(NgZone);
    viewContainerFixture = TestBed.createComponent(ComponentWithChildViewContainer);
    viewContainerFixture.detectChanges();
    testViewContainerRef = viewContainerFixture.componentInstance.childViewContainer;
  });

  it('should invoke the afterClosed callback inside the NgZone', async () => {
    const dialogRef = dialog.open(PizzaMsg, {viewContainerRef: testViewContainerRef});
    const afterCloseCallback = jasmine.createSpy('afterClose callback');

    dialogRef.afterClosed().subscribe(() => {
      afterCloseCallback(NgZone.isInAngularZone());
    });
    zone.run(() => {
      dialogRef.close();
      viewContainerFixture.detectChanges();
    });
    await viewContainerFixture.whenStable();

    expect(afterCloseCallback).toHaveBeenCalledWith(true);
  });
});

@Directive({
  selector: 'dir-with-view-container',
})
class DirectiveWithViewContainer {
  viewContainerRef = inject(ViewContainerRef);
}

@Component({
  selector: 'arbitrary-component',
  template: `@if (showChildView) {<dir-with-view-container></dir-with-view-container>}`,
  imports: [DirectiveWithViewContainer],
})
class ComponentWithChildViewContainer {
  showChildView = true;

  @ViewChild(DirectiveWithViewContainer) childWithViewContainer!: DirectiveWithViewContainer;

  get childViewContainer() {
    return this.childWithViewContainer.viewContainerRef;
  }
}

/** Simple component for testing ComponentPortal. */
@Component({
  template: '<p>Pizza</p> <input> <button>Close</button>',
})
class PizzaMsg {
  dialogRef = inject<MatDialogRef<PizzaMsg>>(MatDialogRef);
  dialogInjector = inject(Injector);
  directionality = inject(Directionality);
}
