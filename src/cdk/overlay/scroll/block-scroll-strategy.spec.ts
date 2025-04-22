import {Component, Injector} from '@angular/core';
import {waitForAsync, TestBed} from '@angular/core/testing';
import {ComponentPortal, PortalModule} from '../../portal';
import {Platform} from '../../platform';
import {ViewportRuler} from '../../scrolling';
import {
  OverlayContainer,
  OverlayModule,
  OverlayRef,
  OverlayConfig,
  createBlockScrollStrategy,
  createOverlayRef,
} from '../index';

describe('BlockScrollStrategy', () => {
  let platform: Platform;
  let viewport: ViewportRuler;
  let documentElement: HTMLElement;
  let overlayRef: OverlayRef;
  let componentPortal: ComponentPortal<FocacciaMsg>;
  let forceScrollElement: HTMLElement;
  let overlayContainer: OverlayContainer;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({imports: [OverlayModule, PortalModule, FocacciaMsg]});

    const injector = TestBed.inject(Injector);
    const overlayConfig = new OverlayConfig({scrollStrategy: createBlockScrollStrategy(injector)});

    viewport = TestBed.inject(ViewportRuler);
    platform = TestBed.inject(Platform);
    overlayContainer = TestBed.inject(OverlayContainer);
    overlayRef = createOverlayRef(injector, overlayConfig);
    componentPortal = new ComponentPortal(FocacciaMsg);
    documentElement = document.documentElement!;
    documentElement.classList.remove('cdk-global-scrollblock');
    forceScrollElement = document.createElement('div');
    document.body.appendChild(forceScrollElement);
    forceScrollElement.style.width = '100px';
    forceScrollElement.style.height = '3000px';
    forceScrollElement.style.background = 'rebeccapurple';
  }));

  afterEach(() => {
    overlayRef.dispose();
    forceScrollElement.remove();
    window.scroll(0, 0);
    overlayContainer.getContainerElement().remove();
  });

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

  it(
    `should't do anything if the page isn't scrollable while zoomed out`,
    skipIOS(() => {
      if (platform.FIREFOX) {
        // style.zoom is only supported from Firefox 126
        return;
      }

      forceScrollElement.style.display = 'none';
      document.body.style.zoom = '75%';
      overlayRef.attach(componentPortal);
      expect(document.body.scrollWidth).toBeGreaterThan(window.innerWidth);
      expect(documentElement.classList).not.toContain('cdk-global-scrollblock');
      overlayRef.detach();
      document.body.style.zoom = '100%';

      document.documentElement.style.zoom = '75%';
      overlayRef.attach(componentPortal);
      expect(document.body.scrollWidth).toBeGreaterThan(window.innerWidth);
      expect(documentElement.classList).not.toContain('cdk-global-scrollblock');
      document.documentElement.style.zoom = '100%';
    }),
  );

  it(
    `should add cdk-global-scrollblock while zoomed in`,
    skipIOS(() => {
      if (platform.FIREFOX) {
        // style.zoom is only supported from Firefox 126
        return;
      }

      forceScrollElement.style.width = window.innerWidth - 20 + 'px';
      forceScrollElement.style.height = window.innerHeight - 20 + 'px';
      overlayRef.attach(componentPortal);
      expect(documentElement.classList).not.toContain('cdk-global-scrollblock');
      overlayRef.detach();

      document.body.style.zoom = '200%';
      overlayRef.attach(componentPortal);
      expect(documentElement.classList).toContain('cdk-global-scrollblock');
      document.body.style.zoom = '100%';
      overlayRef.detach();

      document.documentElement.style.zoom = '200%';
      overlayRef.attach(componentPortal);
      expect(documentElement.classList).toContain('cdk-global-scrollblock');
      document.documentElement.style.zoom = '100%';
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
