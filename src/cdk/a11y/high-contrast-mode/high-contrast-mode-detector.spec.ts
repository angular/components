import {
  BLACK_ON_WHITE_CSS_CLASS,
  HIGH_CONTRAST_MODE_ACTIVE_CSS_CLASS,
  HighContrastMode,
  HighContrastModeDetector,
  WHITE_ON_BLACK_CSS_CLASS,
} from './high-contrast-mode-detector';
import {Platform} from '@angular/cdk/platform';
import {fakeAsync, inject, tick} from '@angular/core/testing';

describe('HighContrastModeDetector', () => {
  let fakePlatform: Platform;

  beforeEach(inject([Platform], (p: Platform) => {
    fakePlatform = p;
  }));

  it('should detect NONE for non-browser platforms', () => {
    fakePlatform.isBrowser = false;
    const detector = new HighContrastModeDetector(fakePlatform, {});
    expect(detector.getHighContrastMode())
      .withContext('Expected high-contrast mode `NONE` on non-browser platforms')
      .toBe(HighContrastMode.NONE);
  });

  it('should not apply any css classes for non-browser platforms', () => {
    fakePlatform.isBrowser = false;
    const fakeDocument = getFakeDocument();
    const detector = new HighContrastModeDetector(fakePlatform, fakeDocument);
    detector._applyBodyHighContrastModeCssClasses();
    expect(fakeDocument.body.className)
      .withContext('Expected body not to have any CSS classes in non-browser platforms')
      .toBe('');
  });

  it('should detect ACTIVE when when forced-colors are enabled', () => {
    const forcedColorsMediaQuery = new FakeMediaQueryList(true, '(forced-colors: active)');
    const detector = new HighContrastModeDetector(
      fakePlatform,
      getFakeDocument([forcedColorsMediaQuery]),
    );
    expect(detector.getHighContrastMode())
      .withContext('Expected high-contrast mode `ACTIVE`')
      .toBe(HighContrastMode.ACTIVE);
  });

  it('should detect NONE when forced-colors are not enabled', () => {
    const forcedColorsMediaQuery = new FakeMediaQueryList(false, '(forced-colors: active)');
    const detector = new HighContrastModeDetector(
      fakePlatform,
      getFakeDocument([forcedColorsMediaQuery]),
    );
    expect(detector.getHighContrastMode())
      .withContext('Expected high-contrast mode `NONE`')
      .toBe(HighContrastMode.NONE);
  });

  it('should apply css classes for ACTIVE high-contrast mode', () => {
    const forcedColorsMediaQuery = new FakeMediaQueryList(true, '(forced-colors: active)');
    const fakeDocument = getFakeDocument([forcedColorsMediaQuery]);
    const detector = new HighContrastModeDetector(fakePlatform, fakeDocument);

    detector._applyBodyHighContrastModeCssClasses();
    expect(fakeDocument.body.className).toBe(HIGH_CONTRAST_MODE_ACTIVE_CSS_CLASS);
  });

  it('should update css classes when high-contrast mode changes', fakeAsync(() => {
    const forcedColorsMediaQuery = new FakeMediaQueryList(false, '(forced-colors: active)');

    const fakeDocument = getFakeDocument([forcedColorsMediaQuery]);
    const detector = new HighContrastModeDetector(fakePlatform, fakeDocument);

    detector._applyBodyHighContrastModeCssClasses();
    expect(fakeDocument.body.className).toBe('');

    forcedColorsMediaQuery.matches = true;
    tick();

    expect(fakeDocument.body.className)
      .withContext('Expected to detect that high-contrast mode now active')
      .toBe(HIGH_CONTRAST_MODE_ACTIVE_CSS_CLASS);
  }));

  it('should not apply any css classes when backgrounds are not coerced', () => {
    const fakeDocument = getFakeDocument();
    const detector = new HighContrastModeDetector(fakePlatform, fakeDocument);
    detector._applyBodyHighContrastModeCssClasses();
    expect(fakeDocument.body.className)
      .withContext('Expected body not to have any CSS classes in non-browser platforms')
      .toBe('');
  });
});

class FakeMediaQueryList {
  private cb: null | (() => void) = null;

  constructor(matches: boolean, public readonly media: string) {
    this._matches = matches;
  }

  get matches(): boolean {
    return this._matches;
  }
  set matches(value: boolean) {
    if (value !== this._matches) {
      this._matches = value;

      this.cb?.();
    }
  }
  private _matches: boolean;

  addListener(cb: () => void) {
    if (this.cb) {
      throw new Error('not implemented');
    }
    this.cb = cb;
  }

  removeListener() {
    this.cb = null;
  }
}

/** Gets a fake document that includes a fake `window.getComputedStyle` implementation. */
function getFakeDocument(mediaQueries?: FakeMediaQueryList[]) {
  const mediaQueriesLookup = {} as Record<string, FakeMediaQueryList>;
  for (const query of mediaQueries || []) {
    mediaQueriesLookup[query.media] = query;
  }

  return {
    body: document.createElement('body'),
    defaultView: {
      matchMedia(media: string): Partial<MediaQueryList> {
        return mediaQueriesLookup[media] || new FakeMediaQueryList(false, media);
      },
    },
  };
}
