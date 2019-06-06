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
  HarnessLoader,
  LocatorFactory,
} from './component-harness';
import {TestElement} from './test-element';

export class ProtractorHarnessEnvironment extends AbstractHarnessEnvironment<ElementFinder> {
  protected constructor(rawRootElement: ElementFinder) {
    super(rawRootElement);
  }

  static create(): HarnessLoader {
    return new ProtractorHarnessEnvironment(protractorElement(by.css('body')));
  }

  documentRootLocatorFactory(): LocatorFactory {
    return new ProtractorHarnessEnvironment(protractorElement(by.css('body')));
  }

  protected createTestElement(element: ElementFinder): TestElement {
    return new ProtractorElement(element);
  }

  protected createComponentHarness<T extends ComponentHarness>(
      harnessType: ComponentHarnessConstructor<T>, element: ElementFinder): T {
    return new harnessType(new ProtractorHarnessEnvironment(element));
  }

  protected createHarnessLoader(element: ElementFinder): HarnessLoader {
    return new ProtractorHarnessEnvironment(element);
  }

  protected async getRawElement(selector: string): Promise<ElementFinder | null> {
    const element = this.rawRootElement.element(by.css(selector));
    return await element.isPresent() ? element : null;
  }

  protected async getAllRawElements(selector: string): Promise<ElementFinder[]> {
    const elements = this.rawRootElement.all(by.css(selector));
    return elements.reduce(
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
