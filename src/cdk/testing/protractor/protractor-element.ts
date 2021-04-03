/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {WebDriverElementBase} from '@angular/cdk/testing/webdriver';
import {browser, ElementFinder} from 'protractor';

/** A `TestElement` implementation for Protractor. */
export class ProtractorElement extends WebDriverElementBase {
  constructor(readonly element: ElementFinder) {
    super(() => element.getWebElement(), async () => browser.waitForAngular());
  }
}
