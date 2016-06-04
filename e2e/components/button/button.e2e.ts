describe('button', () => {

  beforeEach(() => {
    browser.get('/button');
  });

  describe('disabling behavior', () => {

    it('should prevent click handlers from executing when disabled', () => {
      element(by.id('testButton')).click();
      expect(element(by.id('clickCounter')).getText()).toEqual('1');

      element(by.id('disableToggle')).click();
      element(by.id('testButton')).click();
      expect(element(by.id('clickCounter')).getText()).toEqual('1');
    });

  });

});
