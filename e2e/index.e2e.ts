describe('index', () => {

  beforeEach(() => {
    browser.get('/index.html');
  });

  it('should have a title', () => {
    expect(browser.getTitle()).toBe('Material2');
  });

});
