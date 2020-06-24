/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {$, $$, browser, ElementArrayFinder} from 'protractor';
import {runBenchmark} from '@angular/dev-infra-private/benchmark/driver-utilities';

describe('tabs performance benchmarks', () => {
  beforeAll(() => {
    browser.rootEl = '#root';
  });

  it('renders a small tab group', async() => {
    await runBenchmark({
      id: 'small-tab-group-render',
      url: '',
      ignoreBrowserSynchronization: true,
      params: [],
      prepare: async () => await $('#hide').click(),
      work: async () => await $('#show-small-tab-group').click(),
    });
  });

  it('renders a large tab group', async() => {
    await runBenchmark({
      id: 'large-tab-group-render',
      url: '',
      ignoreBrowserSynchronization: true,
      params: [],
      prepare: async () => await $('#hide').click(),
      work: async () => await $('#show-large-tab-group').click(),
    });
  });

  it('switches between tabs', async() => {
    let tabs: any[];
    let tabToClick = 0;
    await runBenchmark({
      id: 'tab-switching',
      url: '',
      ignoreBrowserSynchronization: true,
      params: [],
      setup: async () => {
        await $('#show-small-tab-group').click();
        tabs = await $$('.mat-tab-label');
      },
      prepare: async () => {
        tabToClick = tabToClick < tabs.length - 1 ? tabToClick + 1 : 0;
      },
      work: async () => await tabs[tabToClick].click(),
    });
  });
});
