/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  HarnessEnvironment,
  HarnessLoader,
  TestElement,
  ɵwaitForRootZoneToStabilize,
  ɵhasInterceptedRootZone,
} from '@angular/cdk/testing';
import {
  browser as protractorBrowser,
  by as protractorBy,
  element as protractorElement,
  ElementArrayFinder,
  ElementFinder
} from 'protractor';
import {ProtractorElement} from './protractor-element';

/** Options to configure the environment. */
export interface ProtractorHarnessEnvironmentOptions {
  /** The query function used to find DOM elements. */
  queryFn: (selector: string, root: ElementFinder) => ElementArrayFinder;
}

/** The default environment options. */
const defaultEnvironmentOptions: ProtractorHarnessEnvironmentOptions = {
  queryFn: (selector: string, root: ElementFinder) => root.all(protractorBy.css(selector))
};

/** A `HarnessEnvironment` implementation for Protractor. */
export class ProtractorHarnessEnvironment extends HarnessEnvironment<ElementFinder> {
  /** The options for this environment. */
  private _options: ProtractorHarnessEnvironmentOptions;

  protected constructor(
      rawRootElement: ElementFinder, options?: ProtractorHarnessEnvironmentOptions) {
    super(rawRootElement);
    this._options = {...defaultEnvironmentOptions, ...options};
  }

  /** Creates a `HarnessLoader` rooted at the document root. */
  static loader(options?: ProtractorHarnessEnvironmentOptions): HarnessLoader {
    return new ProtractorHarnessEnvironment(protractorElement(protractorBy.css('body')), options);
  }

  async forceStabilize(): Promise<void> {
    // Protractor automatically stabilizes whenever a command is executed. See
    // Angular's `blocking-proxy` for more details: https://github.com/angular/blocking-proxy.
  }

  async waitForTasksOutsideAngular(): Promise<void> {
    // Wait until the task queue has been drained and the zone is stable. Note that
    // we cannot rely on "fixture.whenStable" since it does not catch tasks scheduled
    // outside of the Angular zone. For test harnesses, we want to ensure that the
    // app is fully stabilized and therefore need to use our own zone interceptor.
    await protractorBrowser.executeScript<Promise<void>>(`
      // Inline helper functions needed for checking the root zone.
      ${ɵhasInterceptedRootZone}
      // Wait for the root zone to stabilize and return a promise.
      return (${ɵwaitForRootZoneToStabilize})();
    `);
  }

  protected getDocumentRoot(): ElementFinder {
    return protractorElement(protractorBy.css('body'));
  }

  protected createTestElement(element: ElementFinder): TestElement {
    return new ProtractorElement(element);
  }

  protected createEnvironment(element: ElementFinder): HarnessEnvironment<ElementFinder> {
    return new ProtractorHarnessEnvironment(element, this._options);
  }

  protected async getAllRawElements(selector: string): Promise<ElementFinder[]> {
    const elementArrayFinder = this._options.queryFn(selector, this.rawRootElement);
    const length = await elementArrayFinder.count();
    const elements: ElementFinder[] = [];
    for (let i = 0; i < length; i++) {
      elements.push(elementArrayFinder.get(i));
    }
    return elements;
  }
}
