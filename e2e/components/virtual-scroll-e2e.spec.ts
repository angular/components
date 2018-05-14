import {browser, by, element, ElementFinder} from 'protractor';


fdescribe('cdk-virtual-scroll autosize', () => {
  let viewport: ElementFinder;

  beforeEach(() => {
    browser.get('/virtual-scroll');
    viewport = element(by.css('.demo-virtual-scroll-uniform-size cdk-virtual-scroll-viewport'));
  });

  describe('with uniform items', () => {
    it('should scroll down slowly', async () => {
      await browser.executeScript(scrollViewportTo, viewport, 100);
    })
  });
});


function scrollViewportTo(viewportEl: any, offset: number) {
  viewportEl.scrollTop = offset;
}
