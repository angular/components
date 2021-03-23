/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HarnessEnvironment, HarnessLoader, TestElement} from '@angular/cdk/testing';
import {By, WebDriver, WebElement} from 'selenium-webdriver';
import {WebdriverElement} from './webdriver-element';

/** A `HarnessEnvironment` implementation for Protractor. */
export class WebdriverHarnessEnvironment extends HarnessEnvironment<() => WebElement> {
  protected constructor(rawRootElement: () => WebElement) {
    super(rawRootElement);
  }

  /** Creates a `HarnessLoader` rooted at the document root. */
  static loader(driver: WebDriver): HarnessLoader {
    return new WebdriverHarnessEnvironment(() => driver.findElement(By.css('body')));
  }

  async forceStabilize(): Promise<void> {
    // TODO(mmalerba): I think we have to actually do something here for the webdriver environment,
    //  since we can't rely on protractor magic.
  }

  async waitForTasksOutsideAngular(): Promise<void> {
    // TODO: figure out how we can do this for the webdriver environment.
    //  https://github.com/angular/components/issues/17412
  }

  protected getDocumentRoot(): () => WebElement {
    return () => this.rawRootElement().getDriver().findElement(By.css('body'));
  }

  protected createTestElement(element: () => WebElement): TestElement {
    return new WebdriverElement(element);
  }

  protected createEnvironment(element: () => WebElement): HarnessEnvironment<() => WebElement> {
    return new WebdriverHarnessEnvironment(element);
  }

  // TODO(mmalerba): I'm not so sure about this...
  //  it feels like maybe the return type should be `() => Promise<WebElement[]>` instead.
  protected async getAllRawElements(selector: string): Promise<(() => WebElement)[]> {
    const els = await this.rawRootElement().findElements(By.css(selector));
    return els.map((x: WebElement) => () => x);
  }
}
