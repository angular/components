import {browser, by, element, ElementFinder} from 'protractor';

declare var window: any;


fdescribe('autosize cdk-virtual-scroll', () => {
  let viewport: ElementFinder;

  beforeEach(() => {
    browser.get('/virtual-scroll');
    viewport = element(by.css('.demo-virtual-scroll-uniform-size cdk-virtual-scroll-viewport'));
  });

  describe('with uniform items', () => {
    it('should scroll down slowly', async () => {
      await browser.executeAsyncScript(smoothScrollViewportTo, viewport, 100);
    });
  });
});


function scrollViewportTo(viewportEl: any, offset: number, done: () => void) {
  viewportEl.scrollTop = offset;
  window.requestAnimationFrame(() => done());
}


function smoothScrollViewportTo(viewportEl: any, offset: number, done: () => void) {
  let promise = Promise.resolve();
  let curOffset = viewportEl.offsetTop;
  const delta = offset - curOffset;
  do {
    curOffset += Math.min(25, Math.max(-25, delta));
    promise = promise.then(() => new Promise<void>(resolve => {
      viewportEl.scrollTop = offset;
      window.requestAnimationFrame(() => resolve());
    }));
  } while (curOffset != offset);
  promise.then(() => done());
}
