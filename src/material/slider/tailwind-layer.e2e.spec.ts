/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {browser, by, element} from 'protractor';

describe('Tailwind layer + Angular Material E2E', () => {
  beforeEach(async () => await browser.get('/tailwind-layer'));

  it('allows utility layer styles to override Angular Material styles', async () => {
    const button = element(by.id('tailwind-utility-button'));
    const backgroundColor = await browser.executeScript<string>(
      'return getComputedStyle(arguments[0]).backgroundColor;',
      button.getWebElement(),
    );

    // Tailwind's lime-500 utility value.
    expect(backgroundColor).toBe('rgb(132, 204, 22)');
  });

  it('also allows unlayered utility styles to override layered Material styles', async () => {
    const button = element(by.id('unlayered-utility-button'));
    const backgroundColor = await browser.executeScript<string>(
      'return getComputedStyle(arguments[0]).backgroundColor;',
      button.getWebElement(),
    );

    // Unlayered author styles outrank named layers in Cascade 5.
    expect(backgroundColor).toBe('rgb(217, 70, 239)');
  });
});
