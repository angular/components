/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HarnessEnvironment, HarnessLoader, TestElement} from '@angular/cdk/testing';
import * as webdriver from 'selenium-webdriver';
import {WebDriverElement} from './webdriver-element';

/** Options to configure the environment. */
export interface WebDriverHarnessEnvironmentOptions {
  /** The query function used to find DOM elements. */
  queryFn: (selector: string, root: () => webdriver.WebElement) => Promise<webdriver.WebElement[]>;
}

/** The default environment options. */
const defaultEnvironmentOptions: WebDriverHarnessEnvironmentOptions = {
  queryFn: async (selector: string, root: () => webdriver.WebElement) =>
      root().findElements(webdriver.By.css(selector))
};

/** A `HarnessEnvironment` implementation for WebDriver. */
export class WebDriverHarnessEnvironment extends HarnessEnvironment<() => webdriver.WebElement> {
  /** The options for this environment. */
  private _options: WebDriverHarnessEnvironmentOptions;

  protected constructor(
      rawRootElement: () => webdriver.WebElement, options?: WebDriverHarnessEnvironmentOptions) {
    super(rawRootElement);
    this._options = {...defaultEnvironmentOptions, ...options};
  }

  /** Gets the ElementFinder corresponding to the given TestElement. */
  static getNativeElement(el: TestElement): webdriver.WebElement {
    if (el instanceof WebDriverElement) {
      return el.element();
    }
    throw Error('This TestElement was not created by the WebDriverHarnessEnvironment');
  }

  /** Creates a `HarnessLoader` rooted at the document root. */
  static loader(driver: webdriver.WebDriver, options?: WebDriverHarnessEnvironmentOptions):
      HarnessLoader {
    return new WebDriverHarnessEnvironment(
        () => driver.findElement(webdriver.By.css('body')), options);
  }

  async forceStabilize(): Promise<void> {
    // TODO(mmalerba): I think we have to actually do something here for the webdriver environment,
    //  since we can't rely on protractor magic.
  }

  async waitForTasksOutsideAngular(): Promise<void> {
    // TODO: figure out how we can do this for the webdriver environment.
    //  https://github.com/angular/components/issues/17412
  }

  protected getDocumentRoot(): () => webdriver.WebElement {
    return () => this.rawRootElement().getDriver().findElement(webdriver.By.css('body'));
  }

  protected createTestElement(element: () => webdriver.WebElement): TestElement {
    return new WebDriverElement(element);
  }

  protected createEnvironment(element: () => webdriver.WebElement):
      HarnessEnvironment<() => webdriver.WebElement> {
    return new WebDriverHarnessEnvironment(element);
  }

  // TODO(mmalerba): I'm not so sure about this...
  //  it feels like maybe the return type should be `() => Promise<webdriver.WebElement[]>` instead.
  protected async getAllRawElements(selector: string): Promise<(() => webdriver.WebElement)[]> {
    const els = await this._options.queryFn(selector, this.rawRootElement);
    return els.map((x: webdriver.WebElement) => () => x);
  }
}
