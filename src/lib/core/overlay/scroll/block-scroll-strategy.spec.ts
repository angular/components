import {inject, TestBed, async} from '@angular/core/testing';
import {ComponentPortal, OverlayModule, BlockScrollStrategy, Platform} from '../../core';
import {ViewportRuler} from '../position/viewport-ruler';


describe('BlockScrollStrategy', () => {
  let platform = new Platform();
  let strategy: BlockScrollStrategy;
  let viewport: ViewportRuler;
  let forceScrollElement: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({ imports: [OverlayModule] }).compileComponents();
  }));

  beforeEach(inject([ViewportRuler], (_viewportRuler: ViewportRuler) => {
    strategy = new BlockScrollStrategy(_viewportRuler);
    viewport = _viewportRuler;
    forceScrollElement = document.createElement('div');
    document.body.appendChild(forceScrollElement);
    forceScrollElement.style.width = '100px';
    forceScrollElement.style.height = '3000px';
  }));

  afterEach(() => {
    document.body.removeChild(forceScrollElement);
    setScrollPosition(0, 0);
  });

  it('should toggle scroll blocking along the y axis', skipUnreliableBrowser(() => {
    forceScrollElement.style.height = '3000px';

    setScrollPosition(0, 100);
    expect(viewport.getViewportScrollPosition().top).toBe(100,
        'Expected viewport to be scrollable initially.');

    strategy.enable();
    expect(document.documentElement.style.top).toBe('-100px',
        'Expected <html> element to be offset by the previous scroll amount along the y axis.');

    setScrollPosition(0, 300);
    expect(viewport.getViewportScrollPosition().top).toBe(100,
        'Expected the viewport not to scroll.');

    strategy.disable();
    expect(viewport.getViewportScrollPosition().top).toBe(100,
        'Expected old scroll position to have bee restored after disabling.');

    setScrollPosition(0, 300);
    expect(viewport.getViewportScrollPosition().top).toBe(300,
        'Expected user to be able to scroll after disabling.');
  }));


  it('should toggle scroll blocking along the x axis', skipUnreliableBrowser(() => {
    forceScrollElement.style.width = '3000px';

    setScrollPosition(100, 0);
    expect(viewport.getViewportScrollPosition().left).toBe(100,
        'Expected viewport to be scrollable initially.');

    strategy.enable();
    expect(document.documentElement.style.left).toBe('-100px',
        'Expected <html> element to be offset by the previous scroll amount along the x axis.');

    setScrollPosition(300, 0);
    expect(viewport.getViewportScrollPosition().left).toBe(100,
        'Expected the viewport not to scroll.');

    strategy.disable();
    expect(viewport.getViewportScrollPosition().left).toBe(100,
        'Expected old scroll position to have bee restored after disabling.');

    setScrollPosition(300, 0);
    expect(viewport.getViewportScrollPosition().left).toBe(300,
        'Expected user to be able to scroll after disabling.');
  }));


  it('should toggle the `cdk-global-scrollblock` class', skipUnreliableBrowser(() => {
    forceScrollElement.style.height = '3000px';

    expect(document.documentElement.classList).not.toContain('cdk-global-scrollblock');

    strategy.enable();
    expect(document.documentElement.classList).toContain('cdk-global-scrollblock');

    strategy.disable();
    expect(document.documentElement.classList).not.toContain('cdk-global-scrollblock');
  }));

  it('should restore any previously-set inline styles', skipUnreliableBrowser(() => {
    const root = document.documentElement;

    forceScrollElement.style.height = '3000px';
    root.style.top = '13px';
    root.style.left = '37px';

    strategy.enable();

    expect(root.style.top).not.toBe('13px');
    expect(root.style.left).not.toBe('37px');

    strategy.disable();

    expect(root.style.top).toBe('13px');
    expect(root.style.left).toBe('37px');
  }));

  it(`should't do anything if the page isn't scrollable`, skipUnreliableBrowser(() => {
    forceScrollElement.style.display = 'none';
    strategy.enable();
    expect(document.documentElement.classList).not.toContain('cdk-global-scrollblock');
  }));


  // In the iOS simulator (BrowserStack & SauceLabs), adding content to the
  // body causes karma's iframe for the test to stretch to fit that content,
  // in addition to not allowing us to set the scroll position programmatically.
  // This renders the tests unusable and since we can't really do anything about it,
  // we have to skip them on iOS.
  function skipUnreliableBrowser(spec: Function) {
    return () => {
      if (!platform.IOS) { spec(); }
    };
  }

  function setScrollPosition(x: number, y: number) {
    window.scroll(x, y);
    viewport._cacheViewportGeometry();
  }

});
