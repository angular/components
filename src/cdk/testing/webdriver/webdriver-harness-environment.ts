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

/** A `HarnessEnvironment` implementation for WebDriver. */
export class WebDriverHarnessEnvironment extends HarnessEnvironment<() => webdriver.WebElement> {
  protected constructor(rawRootElement: () => webdriver.WebElement) {
    super(rawRootElement);
  }

  /** Creates a `HarnessLoader` rooted at the document root. */
  static loader(driver: webdriver.WebDriver): HarnessLoader {
    return new WebDriverHarnessEnvironment(() => driver.findElement(webdriver.By.css('body')));
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
    const els = await this.rawRootElement().findElements(webdriver.By.css(selector));
    return els.map((x: webdriver.WebElement) => () => x);
  }
}
