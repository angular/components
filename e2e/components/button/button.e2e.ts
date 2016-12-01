import {browser, by, element} from 'protractor';

describe('button', () => {
  describe('disabling behavior', () => {
    beforeEach(() => browser.get('/button'));

    it('should prevent click handlers from executing when disabled', () => {
      element(by.id('test-button')).click();
      expect(element(by.id('click-counter')).getText()).toEqual('1');

      element(by.id('disable-toggle')).click();
      element(by.id('test-button')).click();
      expect(element(by.id('click-counter')).getText()).toEqual('1');
    });
  });
});
