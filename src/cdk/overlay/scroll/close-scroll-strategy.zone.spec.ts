import {ComponentPortal, PortalModule} from '../../portal';
import {Component, Injector, NgZone, provideZoneChangeDetection} from '@angular/core';
import {TestBed, fakeAsync} from '@angular/core/testing';
import {Subject} from 'rxjs';
import {OverlayConfig} from '../overlay-config';
import {OverlayContainer} from '../overlay-container';
import {OverlayModule} from '../overlay-module';
import {OverlayRef} from '../overlay-ref';
import {
  CdkScrollable,
  createCloseScrollStrategy,
  createOverlayRef,
  ScrollDispatcher,
  ViewportRuler,
} from '../public-api';

describe('CloseScrollStrategy Zone.js integration', () => {
  let overlayRef: OverlayRef;
  let componentPortal: ComponentPortal<MozarellaMsg>;
  let scrolledSubject = new Subject<CdkScrollable | undefined>();
  let scrollPosition: number;
  let overlayContainer: OverlayContainer;

  beforeEach(fakeAsync(() => {
    scrollPosition = 0;

    TestBed.configureTestingModule({
      imports: [OverlayModule, PortalModule, MozarellaMsg],
      providers: [
        provideZoneChangeDetection(),
        {
          provide: ScrollDispatcher,
          useFactory: () => ({
            scrolled: () => scrolledSubject,
          }),
        },
        {
          provide: ViewportRuler,
          useFactory: () => ({
            getViewportScrollPosition: () => ({top: scrollPosition}),
          }),
        },
      ],
    });

    const injector = TestBed.inject(Injector);
    const overlayConfig = new OverlayConfig({scrollStrategy: createCloseScrollStrategy(injector)});
    overlayRef = createOverlayRef(injector, overlayConfig);
    componentPortal = new ComponentPortal(MozarellaMsg);
    overlayContainer = TestBed.inject(OverlayContainer);
  }));

  afterEach(() => {
    overlayRef.dispose();
    overlayContainer.getContainerElement().remove();
  });

  it('should detach inside the NgZone', () => {
    const spy = jasmine.createSpy('detachment spy');
    const subscription = overlayRef.detachments().subscribe(() => spy(NgZone.isInAngularZone()));

    overlayRef.attach(componentPortal);
    scrolledSubject.next();

    expect(spy).toHaveBeenCalledWith(true);
    subscription.unsubscribe();
  });
});

/** Simple component that we can attach to the overlay. */
@Component({
  template: '<p>Mozarella</p>',
  imports: [OverlayModule, PortalModule],
})
class MozarellaMsg {}
