import {waitForAsync, TestBed} from '@angular/core/testing';
import {Component, Injector} from '@angular/core';
import {Subject} from 'rxjs';
import {ComponentPortal, PortalModule} from '../../portal';
import {
  OverlayContainer,
  OverlayModule,
  OverlayRef,
  OverlayConfig,
  ScrollDispatcher,
  createRepositionScrollStrategy,
  createOverlayRef,
} from '../index';

describe('RepositionScrollStrategy', () => {
  let injector: Injector;
  let overlayRef: OverlayRef;
  let overlayContainer: OverlayContainer;
  let componentPortal: ComponentPortal<PastaMsg>;
  let scrolledSubject = new Subject();

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [OverlayModule, PortalModule, PastaMsg],
      providers: [
        {
          provide: ScrollDispatcher,
          useFactory: () => ({
            scrolled: () => scrolledSubject,
          }),
        },
      ],
    });

    injector = TestBed.inject(Injector);
    overlayContainer = TestBed.inject(OverlayContainer);
    componentPortal = new ComponentPortal(PastaMsg);
  }));

  afterEach(() => {
    overlayRef.dispose();
    overlayContainer.getContainerElement().remove();
  });

  it('should update the overlay position when the page is scrolled', () => {
    const overlayConfig = new OverlayConfig({
      scrollStrategy: createRepositionScrollStrategy(injector),
    });

    overlayRef = createOverlayRef(injector, overlayConfig);
    overlayRef.attach(componentPortal);
    spyOn(overlayRef, 'updatePosition');

    scrolledSubject.next();
    expect(overlayRef.updatePosition).toHaveBeenCalledTimes(1);

    scrolledSubject.next();
    expect(overlayRef.updatePosition).toHaveBeenCalledTimes(2);
  });

  it('should not be updating the position after the overlay is detached', () => {
    const overlayConfig = new OverlayConfig({
      scrollStrategy: createRepositionScrollStrategy(injector),
    });

    overlayRef = createOverlayRef(injector, overlayConfig);
    overlayRef.attach(componentPortal);
    spyOn(overlayRef, 'updatePosition');

    overlayRef.detach();
    scrolledSubject.next();

    expect(overlayRef.updatePosition).not.toHaveBeenCalled();
  });

  it('should not be updating the position after the overlay is destroyed', () => {
    const overlayConfig = new OverlayConfig({
      scrollStrategy: createRepositionScrollStrategy(injector),
    });

    overlayRef = createOverlayRef(injector, overlayConfig);
    overlayRef.attach(componentPortal);
    spyOn(overlayRef, 'updatePosition');

    overlayRef.dispose();
    scrolledSubject.next();

    expect(overlayRef.updatePosition).not.toHaveBeenCalled();
  });

  it('should be able to close the overlay once it is out of view', () => {
    const overlayConfig = new OverlayConfig({
      scrollStrategy: createRepositionScrollStrategy(injector, {
        autoClose: true,
      }),
    });

    overlayRef = createOverlayRef(injector, overlayConfig);
    overlayRef.attach(componentPortal);
    spyOn(overlayRef, 'updatePosition');
    spyOn(overlayRef, 'detach');
    spyOn(overlayRef.overlayElement, 'getBoundingClientRect').and.returnValue({
      top: -1000,
      bottom: -900,
      left: 0,
      right: 100,
      width: 100,
      height: 100,
    } as DOMRect);

    scrolledSubject.next();
    expect(overlayRef.detach).toHaveBeenCalledTimes(1);
  });
});

/** Simple component that we can attach to the overlay. */
@Component({
  template: '<p>Pasta</p>',
  imports: [OverlayModule, PortalModule],
})
class PastaMsg {}
