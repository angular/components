/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HarnessEnvironment, HarnessLoader, TestElement} from '@angular/cdk/testing';
import {
  by,
  element as protractorElement,
  ElementArrayFinder,
  ElementFinder,
  Locator
} from 'protractor';
import {ProtractorElement} from './protractor-element';

/** The default query function that respects shadow boundaries. */
const defaultQueryFn = (selector: string, root: ElementFinder) => root.all(by.css(selector));

/** A `HarnessEnvironment` implementation for Protractor. */
export class ProtractorHarnessEnvironment extends HarnessEnvironment<ElementFinder> {
  protected constructor(rawRootElement: ElementFinder,
      private _queryFn: (selector: string, root: ElementFinder) => ElementArrayFinder =
          defaultQueryFn) {
    super(rawRootElement);
  }

  /** Creates a `HarnessLoader` rooted at the document root. */
  static loader(queryFn?: (selector: string, root: ElementFinder) => ElementArrayFinder):
      HarnessLoader {
    return new ProtractorHarnessEnvironment(protractorElement(by.css('body')), queryFn);
  }

  async forceStabilize(): Promise<void> {}

  async waitForTasksOutsideAngular(): Promise<void> {
    // TODO: figure out how we can do this for the protractor environment.
    // https://github.com/angular/components/issues/17412
  }

  protected getDocumentRoot(): ElementFinder {
    return protractorElement(by.css('body'));
  }

  protected createTestElement(element: ElementFinder): TestElement {
    return new ProtractorElement(element);
  }

  protected createEnvironment(element: ElementFinder): HarnessEnvironment<ElementFinder> {
    return new ProtractorHarnessEnvironment(element, this._queryFn);
  }

  protected async getAllRawElements(selector: string): Promise<ElementFinder[]> {
    const elementFinderArray = this._queryFn(selector, this.rawRootElement);
    const length = await elementFinderArray.count();
    const elements: ElementFinder[] = [];
    for (let i = 0; i < length; i++) {
      elements.push(elementFinderArray.get(i));
    }
    return elements;
  }
}
