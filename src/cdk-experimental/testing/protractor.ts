/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {browser, by, element as protractorElement, ElementFinder} from 'protractor';

import {
  AbstractHarnessEnvironment,
  ComponentHarness,
  ComponentHarnessConstructor,
  HarnessEnvironment,
} from './component-harness';
import {TestElement} from './test-element';

export class ProtractorHarnessEnvironment extends AbstractHarnessEnvironment<ElementFinder> {
  static root(): ProtractorHarnessEnvironment {
    return new ProtractorHarnessEnvironment(protractorElement(by.css('body')));
  }

  async findAll(selector: string): Promise<HarnessEnvironment[]> {
    return (await this.getAllRawElements(selector)).map(e => new ProtractorHarnessEnvironment(e));
  }

  protected createTestElement(element: ElementFinder): TestElement {
    return new ProtractorElement(element);
  }

  protected createHarness<T extends ComponentHarness>(
      harnessType: ComponentHarnessConstructor<T>, element: ElementFinder): T {
    return new harnessType(new ProtractorHarnessEnvironment(element));
  }

  protected async getAllRawElements(selector: string): Promise<ElementFinder[]> {
    const elementFinders = this.rawRootElement.all(by.css(selector));
    return elementFinders.reduce(
        (result: ElementFinder[], el: ElementFinder) => el ? result.concat([el]) : result, []);
  }
}

class ProtractorElement implements TestElement {
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
