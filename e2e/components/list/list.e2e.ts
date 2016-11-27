describe('list', () => {
  beforeEach(() => browser.get('/list'));

  it('should render a list container', () => {
    expect(element(by.css('md-list')).isPresent()).toBe(true);
  });

  it('should render list items inside the list container', () => {
    let container = element(by.css('md-list'));
    expect(container.isElementPresent(by.css('md-list-item'))).toBe(true);
  });

  it('should be tabbable', () => {
    pressKey(protractor.Key.TAB);
    expectFocusOn(element(by.css('md-list')));
  });

  it('should shift focus between the list items', () => {
    let items = element.all(by.css('md-list-item'));

    pressKey(protractor.Key.TAB);
    pressKey(protractor.Key.DOWN);
    expectFocusOn(items.get(0));

    pressKey(protractor.Key.DOWN);
    expectFocusOn(items.get(1));

    pressKey(protractor.Key.DOWN);
    expectFocusOn(items.get(2));

    pressKey(protractor.Key.UP);
    expectFocusOn(items.get(1));

    pressKey(protractor.Key.UP);
    expectFocusOn(items.get(0));
  });

  // TODO: move to utility file. this was taken from the menu-page.ts
  function expectFocusOn(el: any): void {
    expect(browser.driver.switchTo().activeElement().getInnerHtml()).toBe(el.getInnerHtml());
  }

  function pressKey(key: string) {
    browser.actions().sendKeys(key).perform();
  }
});
