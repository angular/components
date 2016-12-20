import {ElementFinder, browser, by, element, ProtractorBy} from 'protractor';

/**
 * A set of utility functions for writing E2E tests.
 */
export class E2EUtils {
  /**
   * Asserts that an element exists.
   */
  expectToExist(selector: string, expected = true): webdriver.promise.Promise<any> {
    return this.waitForElement(selector).then(isPresent => {
      expect(isPresent).toBe(expected, `Expected "${selector}"${expected ? '' : ' not'} to exist`);
    });
  }

  /**
   * Asserts that an element is focused.
   */
  expectFocusOn(element: FinderResult, expected = true): void {
    expect(browser.driver.switchTo().activeElement().getInnerHtml()).toBe(
      this._getElement(element).getWebElement().getInnerHtml(),
      `Expected element${expected ? '' : ' not'} to be focused.`
    );
  }

  /**
   * Asserts that an element has a certan location.
   */
  expectLocation(element: FinderResult, {x, y}: Point): void {
    this._getElement(element).getLocation().then((location: Point) => {
      expect(location.x).toEqual(x);
      expect(location.y).toEqual(y);
    });
  }

  /**
   * Asserts that one element is aligned with another.
   */
  expectAlignedWith(element: FinderResult, otherElement: FinderResult): void {
    this._getElement(otherElement).getLocation().then((location: Point) => {
      this.expectLocation(this._getElement(element), location);
    });
  }

  /**
   * Waits for an element to be rendered.
   */
  waitForElement(selector: string): webdriver.promise.Promise<any> {
    return browser.isElementPresent(by.css(selector) as ProtractorBy);
  }

  /**
   * Presses a single key or a sequence of keys.
   */
  pressKeys(...keys: string[]): void {
    let actions = browser.actions();
    actions.sendKeys.call(actions, keys).perform();
  }

  /**
   * Clicks an element at a specific point. Useful if there's another element
   * that covers part of the target and can catch the click.
   */
  clickElementAtPoint(element: FinderResult, coords: Point): void {
    let webElement = this._getElement(element).getWebElement();
    browser.actions().mouseMove(webElement, coords).click().perform();
  }

  /**
   * Normalizes either turning a selector into an
   * ElementFinder or returning the finder itself.
   */
  private _getElement(el: FinderResult): ElementFinder {
    return typeof el === 'string' ? element(by.css(el)) : el;
  }
}

export interface Point { x: number; y: number; }
export type FinderResult = ElementFinder | string;
