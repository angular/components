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

  readonly title = this.requiredLocator('h1');
  readonly asyncCounter = this.requiredLocator('#asyncCounter');
  readonly counter = this.requiredLocator('#counter');
  readonly input = this.requiredLocator('#input');
  readonly value = this.requiredLocator('#value');
  readonly allLabels = this.allLocator('label');
  readonly allLists = this.allLocator(SubComponentHarness);
  readonly memo = this.requiredLocator('textarea');
  // Allow null for element
  readonly nullItem = this.optionalLocator('wrong locator');
  // Allow null for component harness
  readonly nullComponentHarness = this.optionalLocator(WrongComponentHarness);
  readonly errorItem = this.requiredLocator('wrong locator');

  readonly globalEl = this.documentRootLocatorFactory().requiredLocator('.sibling');
  readonly errorGlobalEl = this.documentRootLocatorFactory().requiredLocator('wrong locator');
  readonly nullGlobalEl = this.documentRootLocatorFactory().optionalLocator('wrong locator');

  readonly optionalDiv = this.optionalLocator('div');
  readonly optionalSubComponent = this.optionalLocator(SubComponentHarness);
  readonly errorSubComponent = this.requiredLocator(WrongComponentHarness);

  private _button = this.requiredLocator('button');
  private _testTools = this.requiredLocator(SubComponentHarness);

  async increaseCounter(times: number) {
    const button = await this._button();
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
