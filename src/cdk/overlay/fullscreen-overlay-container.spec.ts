import {DOCUMENT} from '@angular/common';
import {waitForAsync, inject, TestBed} from '@angular/core/testing';
import {Component, NgModule, ViewChild, ViewContainerRef, inject as inject_1} from '@angular/core';
import {PortalModule, CdkPortal} from '@angular/cdk/portal';
import {Overlay, OverlayContainer, OverlayModule, FullscreenOverlayContainer} from './index';
import {TemplatePortalDirective} from '../portal/portal-directives';

describe('FullscreenOverlayContainer', () => {
  let overlay: Overlay;
  let fullscreenListeners: Set<Function>;
  let fakeDocument: any;

  beforeEach(waitForAsync(() => {
    fullscreenListeners = new Set();

    TestBed.configureTestingModule({
      imports: [OverlayTestModule],
      providers: [
        {
          provide: DOCUMENT,
          useFactory: () => {
            // Provide a (very limited) stub for the document. This is the most practical solution for
            // now since we only hit a handful of Document APIs. If we end up having to add more
            // stubs here, we should reconsider whether to use a Proxy instead. Avoiding a proxy for
            // now since it isn't supported on IE. See:
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy
            fakeDocument = {
              body: document.body,
              head: document.head,
              fullscreenElement: document.createElement('div'),
              fullscreenEnabled: true,
              addEventListener: (eventName: string, listener: EventListener) => {
                if (eventName === 'fullscreenchange') {
                  fullscreenListeners.add(listener);
                } else {
                  document.addEventListener(eventName, listener);
                }
              },
              removeEventListener: (eventName: string, listener: EventListener) => {
                if (eventName === 'fullscreenchange') {
                  fullscreenListeners.delete(listener);
                } else {
                  document.addEventListener(eventName, listener);
                }
              },
              querySelectorAll: (...args: [string]) => document.querySelectorAll(...args),
              createElement: (...args: [string, (ElementCreationOptions | undefined)?]) =>
                document.createElement(...args),
              getElementsByClassName: (...args: [string]) =>
                document.getElementsByClassName(...args),
              querySelector: (...args: [string]) => document.querySelector(...args),
              createTextNode: (...args: [string]) => document.createTextNode(...args),
              createComment: (...args: [string]) => document.createComment(...args),
            };

            return fakeDocument;
          },
        },
      ],
    });
  }));

  beforeEach(inject([Overlay], (o: Overlay) => {
    overlay = o;
  }));

  afterEach(() => {
    fakeDocument = null;
  });

  it('should open an overlay inside a fullscreen element and move it to the body', () => {
    const fixture = TestBed.createComponent(TestComponentWithTemplatePortals);
    fixture.detectChanges();
    const overlayRef = overlay.create();
    const fullscreenElement = fakeDocument.fullscreenElement;

    overlayRef.attach(fixture.componentInstance.templatePortal);
    fixture.detectChanges();

    expect(fullscreenElement.contains(overlayRef.overlayElement)).toBe(true);

    fakeDocument.fullscreenElement = null;
    fullscreenListeners.forEach(listener => listener());
    fixture.detectChanges();

    expect(fullscreenElement.contains(overlayRef.overlayElement)).toBe(false);
    expect(document.body.contains(overlayRef.overlayElement)).toBe(true);
  });

  it('should open an overlay inside the body and move it to a fullscreen element', () => {
    const fullscreenElement = fakeDocument.fullscreenElement;
    fakeDocument.fullscreenElement = null;

    const fixture = TestBed.createComponent(TestComponentWithTemplatePortals);
    fixture.detectChanges();
    const overlayRef = overlay.create();

    overlayRef.attach(fixture.componentInstance.templatePortal);
    fixture.detectChanges();

    expect(fullscreenElement.contains(overlayRef.overlayElement)).toBe(false);
    expect(document.body.contains(overlayRef.overlayElement)).toBe(true);

    fakeDocument.fullscreenElement = fullscreenElement;
    fullscreenListeners.forEach(listener => listener());
    fixture.detectChanges();

    expect(fullscreenElement.contains(overlayRef.overlayElement)).toBe(true);
  });
});

/** Test-bed component that contains a TempatePortal and an ElementRef. */
@Component({
  template: `<ng-template cdk-portal>Cake</ng-template>`,
  providers: [Overlay],
  standalone: true,
  imports: [TemplatePortalDirective],
})
class TestComponentWithTemplatePortals {
  viewContainerRef = inject_1(ViewContainerRef);

  @ViewChild(CdkPortal) templatePortal: CdkPortal;
}

@NgModule({
  imports: [OverlayModule, PortalModule, TestComponentWithTemplatePortals],
  providers: [
    {
      provide: OverlayContainer,
      useClass: FullscreenOverlayContainer,
    },
  ],
})
class OverlayTestModule {}
