import {ComponentPortal, PortalModule} from '../../portal';
import {Component, NgZone, provideZoneChangeDetection} from '@angular/core';
import {TestBed, fakeAsync, inject} from '@angular/core/testing';
import {Subject} from 'rxjs';
import {Overlay} from '../overlay';
import {OverlayConfig} from '../overlay-config';
import {OverlayContainer} from '../overlay-container';
import {OverlayModule} from '../overlay-module';
import {OverlayRef} from '../overlay-ref';
import {CdkScrollable, ScrollDispatcher, ViewportRuler} from '../public-api';

describe('CloseScrollStrategy Zone.js integration', () => {
  let overlayRef: OverlayRef;
  let componentPortal: ComponentPortal<MozarellaMsg>;
  let scrolledSubject = new Subject<CdkScrollable | undefined>();
  let scrollPosition: number;

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
  }));

  beforeEach(inject([Overlay], (overlay: Overlay) => {
    let overlayConfig = new OverlayConfig({scrollStrategy: overlay.scrollStrategies.close()});
    overlayRef = overlay.create(overlayConfig);
    componentPortal = new ComponentPortal(MozarellaMsg);
  }));

  afterEach(inject([OverlayContainer], (container: OverlayContainer) => {
    overlayRef.dispose();
    container.getContainerElement().remove();
  }));

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
