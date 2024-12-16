import {Component} from '@angular/core';
import {waitForAsync, inject, TestBed} from '@angular/core/testing';
import {ComponentPortal, PortalModule} from '@angular/cdk/portal';
import {Platform} from '@angular/cdk/platform';
import {ViewportRuler} from '@angular/cdk/scrolling';
import {Overlay, OverlayContainer, OverlayModule, OverlayRef, OverlayConfig} from '../index';

describe('BlockScrollStrategy', () => {
  let platform: Platform;
  let viewport: ViewportRuler;
  let documentElement: HTMLElement;
  let overlayRef: OverlayRef;
  let componentPortal: ComponentPortal<FocacciaMsg>;
  let forceScrollElement: HTMLElement;

  beforeEach(waitForAsync(() => {
    documentElement = document.documentElement!;

    // Ensure a clean state for every test.
    documentElement.classList.remove('cdk-global-scrollblock');

    TestBed.configureTestingModule({
      imports: [OverlayModule, PortalModule, FocacciaMsg],
    });
  }));

  beforeEach(inject(
    [Overlay, ViewportRuler, Platform],
    (overlay: Overlay, viewportRuler: ViewportRuler, _platform: Platform) => {
      let overlayConfig = new OverlayConfig({scrollStrategy: overlay.scrollStrategies.block()});

      overlayRef = overlay.create(overlayConfig);
      componentPortal = new ComponentPortal(FocacciaMsg);

      viewport = viewportRuler;
      forceScrollElement = document.createElement('div');
      document.body.appendChild(forceScrollElement);
      forceScrollElement.style.width = '100px';
      forceScrollElement.style.height = '3000px';
      forceScrollElement.style.background = 'rebeccapurple';
      platform = _platform;
    },
  ));

  afterEach(inject([OverlayContainer], (container: OverlayContainer) => {
    overlayRef.dispose();
    forceScrollElement.remove();
    window.scroll(0, 0);
    container.getContainerElement().remove();
  }));

  it(
    'should toggle scroll blocking along the y axis',
    skipIOS(() => {
      window.scroll(0, 100);
      expect(viewport.getViewportScrollPosition().top)
        .withContext('Expected viewport to be scrollable initially.')
        .toBe(100);

      overlayRef.attach(componentPortal);
      expect(documentElement.style.top)
        .withContext('Expected <html> element to be offset by the previous scroll amount.')
        .toBe('-100px');

      window.scroll(0, 300);
      expect(viewport.getViewportScrollPosition().top)
        .withContext('Expected the viewport not to scroll.')
        .toBe(100);

      overlayRef.detach();
      expect(viewport.getViewportScrollPosition().top)
        .withContext('Expected old scroll position to have bee restored after disabling.')
        .toBe(100);

      window.scroll(0, 300);
      expect(viewport.getViewportScrollPosition().top)
        .withContext('Expected user to be able to scroll after disabling.')
        .toBe(300);
    }),
  );

  it(
    'should toggle scroll blocking along the x axis',
    skipIOS(() => {
      forceScrollElement.style.height = '100px';
      forceScrollElement.style.width = '3000px';

      window.scroll(100, 0);
      expect(viewport.getViewportScrollPosition().left)
        .withContext('Expected viewport to be scrollable initially.')
        .toBe(100);

      overlayRef.attach(componentPortal);
      expect(documentElement.style.left)
        .withContext('Expected <html> element to be offset by the previous scroll amount.')
        .toBe('-100px');

      window.scroll(300, 0);
      expect(viewport.getViewportScrollPosition().left)
        .withContext('Expected the viewport not to scroll.')
        .toBe(100);

      overlayRef.detach();
      expect(viewport.getViewportScrollPosition().left)
        .withContext('Expected old scroll position to have bee restored after disabling.')
        .toBe(100);

      window.scroll(300, 0);
      expect(viewport.getViewportScrollPosition().left)
        .withContext('Expected user to be able to scroll after disabling.')
        .toBe(300);
    }),
  );

  it(
    'should toggle the `cdk-global-scrollblock` class',
    skipIOS(() => {
      expect(documentElement.classList).not.toContain('cdk-global-scrollblock');

      overlayRef.attach(componentPortal);
      expect(documentElement.classList).toContain('cdk-global-scrollblock');

      overlayRef.detach();
      expect(documentElement.classList).not.toContain('cdk-global-scrollblock');
    }),
  );

  it(
    'should restore any previously-set inline styles',
    skipIOS(() => {
      const root = documentElement;

      root.style.top = '13px';
      root.style.left = '37px';

      overlayRef.attach(componentPortal);

      expect(root.style.top).not.toBe('13px');
      expect(root.style.left).not.toBe('37px');

      overlayRef.detach();

      expect(root.style.top).toBe('13px');
      expect(root.style.left).toBe('37px');

      root.style.top = '';
      root.style.left = '';
    }),
  );

  it(
    `should't do anything if the page isn't scrollable`,
    skipIOS(() => {
      forceScrollElement.style.display = 'none';
      overlayRef.attach(componentPortal);
      expect(documentElement.classList).not.toContain('cdk-global-scrollblock');
    }),
  );

  it('should keep the content width', () => {
    forceScrollElement.style.width = '100px';

    const previousContentWidth = documentElement.getBoundingClientRect().width;

    overlayRef.attach(componentPortal);

    expect(documentElement.getBoundingClientRect().width).toBe(previousContentWidth);
  });

  it(
    'should not clobber user-defined scroll-behavior',
    skipIOS(() => {
      const root = documentElement;
      const body = document.body;
      const rootStyle = root.style as CSSStyleDeclaration & {scrollBehavior: string};
      const bodyStyle = body.style as CSSStyleDeclaration & {scrollBehavior: string};

      rootStyle.scrollBehavior = bodyStyle.scrollBehavior = 'smooth';

      // Get the value via the style declaration in order to
      // handle browsers that don't support the property yet.
      const initialRootValue = rootStyle.scrollBehavior;
      const initialBodyValue = rootStyle.scrollBehavior;

      overlayRef.attach(componentPortal);
      overlayRef.detach();

      expect(rootStyle.scrollBehavior).toBe(initialRootValue);
      expect(bodyStyle.scrollBehavior).toBe(initialBodyValue);

      // Avoid bleeding styles into other tests.
      rootStyle.scrollBehavior = bodyStyle.scrollBehavior = '';
    }),
  );

  /**
   * Skips the specified test, if it is being executed on iOS. This is necessary, because
   * programmatic scrolling inside the Karma iframe doesn't work on iOS, which renders these
   * tests unusable. For example, something as basic as the following won't work:
   * ```
   * window.scroll(0, 100);
   * expect(viewport.getViewportScrollPosition().top).toBe(100);
   * ```
   * @param spec Test to be executed or skipped.
   */
  function skipIOS(spec: Function) {
    return () => {
      if (!platform.IOS) {
        spec();
      }
    };
  }
});

/** Simple component that we can attach to the overlay. */
@Component({
  template: '<p>Focaccia</p>',
  imports: [OverlayModule, PortalModule],
})
class FocacciaMsg {}
