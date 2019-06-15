/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarness, HarnessPredicate} from '../../component-harness';
import {TestElement} from '../../test-element';

export class SubComponentHarness extends ComponentHarness {
  static readonly hostSelector = 'test-sub';

  static with(options: {title?: string, itemCount?: number} = {}) {
    return new HarnessPredicate(SubComponentHarness)
        .addOption(options.title,
            async (harness, title) => await (await harness.title()).text() === title)
        .addOption(options.itemCount,
            async (harness, count) => (await harness.getItems()).length === count);
  }

  readonly title = this.locatorFor('h2');
  readonly getItems = this.locatorForAll('li');
  readonly globalElement = this.documentRootLocatorFactory().locatorFor('#username');

  async getItem(index: number): Promise<TestElement> {
    const items = await this.getItems();
    return items[index];
  }
}
