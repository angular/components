/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarness} from '../../component-harness';
import {TestElement} from '../../test-element';
import {SubComponentHarness} from './sub-component-harness';

export class WrongComponentHarness extends ComponentHarness {
  static readonly hostSelector = 'wrong-selector';
}

export class MainComponentHarness extends ComponentHarness {
  static readonly hostSelector = 'test-main';

  readonly title = this.locatorForRequired('h1');
  readonly button = this.locatorForRequired('button');
  readonly asyncCounter = this.locatorForRequired('#asyncCounter');
  readonly counter = this.locatorForRequired('#counter');
  readonly input = this.locatorForRequired('#input');
  readonly value = this.locatorForRequired('#value');
  readonly allLabels = this.locatorForAll('label');
  readonly allLists = this.locatorForAll(SubComponentHarness);
  readonly memo = this.locatorForRequired('textarea');
  // Allow null for element
  readonly nullItem = this.locatorForOptional('wrong locator');
  // Allow null for component harness
  readonly nullComponentHarness = this.locatorForOptional(WrongComponentHarness);
  readonly errorItem = this.locatorForRequired('wrong locator');

  readonly globalEl = this.documentRootLocatorFactory().locatorForRequired('.sibling');
  readonly errorGlobalEl = this.documentRootLocatorFactory().locatorForRequired('wrong locator');
  readonly nullGlobalEl = this.documentRootLocatorFactory().locatorForOptional('wrong locator');

  readonly optionalDiv = this.locatorForOptional('div');
  readonly optionalSubComponent = this.locatorForOptional(SubComponentHarness);
  readonly errorSubComponent = this.locatorForRequired(WrongComponentHarness);

  private _testTools = this.locatorForRequired(SubComponentHarness);

  async increaseCounter(times: number) {
    const button = await this.button();
    for (let i = 0; i < times; i++) {
      await button.click();
    }
  }

  async getTestTool(index: number): Promise<TestElement> {
    const subComponent = await this._testTools();
    return subComponent.getItem(index);
  }

  async getTestTools(): Promise<TestElement[]> {
    const subComponent = await this._testTools();
    return subComponent.getItems();
  }
}
