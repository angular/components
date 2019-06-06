/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {browser, ElementFinder} from 'protractor';
import {TestElement} from '../test-element';

export class ProtractorElement implements TestElement {
  constructor(readonly element: ElementFinder) {}

  async blur(): Promise<void> {
    return this.element['blur']();
  }

  async clear(): Promise<void> {
    return this.element.clear();
  }

  async click(): Promise<void> {
    return this.element.click();
  }

  async focus(): Promise<void> {
    return this.element['focus']();
  }

  async getCssValue(property: string): Promise<string> {
    return this.element.getCssValue(property);
  }

  async hover(): Promise<void> {
    return browser.actions()
        .mouseMove(await this.element.getWebElement())
        .perform();
  }

  async sendKeys(keys: string): Promise<void> {
    return this.element.sendKeys(keys);
  }

  async text(): Promise<string> {
    return this.element.getText();
  }

  async getAttribute(name: string): Promise<string|null> {
    return this.element.getAttribute(name);
  }
}
