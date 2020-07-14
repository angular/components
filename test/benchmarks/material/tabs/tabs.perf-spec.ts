/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {$, $$, browser, ElementFinder} from 'protractor';
import {runBenchmark} from '@angular/dev-infra-private/benchmark/driver-utilities';

describe('tabs performance benchmarks', () => {
  beforeAll(() => {
    browser.rootEl = '#root';
  });

  it('renders three tabs', async() => {
    await runBenchmark({
      id: 'three-tab-render',
      url: '',
      ignoreBrowserSynchronization: true,
      params: [],
      prepare: async() => await $('#hide').click(),
      work: async() => await $('#show-three-tabs').click(),
    });
  });

  it('renders ten tabs', async() => {
    await runBenchmark({
      id: 'ten-tab-render',
      url: '',
      ignoreBrowserSynchronization: true,
      params: [],
      prepare: async() => await $('#hide').click(),
      work: async() => await $('#show-ten-tabs').click(),
    });
  });

  it('renders twenty tabs', async() => {
    await runBenchmark({
      id: 'twenty-tab-render',
      url: '',
      ignoreBrowserSynchronization: true,
      params: [],
      prepare: async() => await $('#hide').click(),
      work: async() => await $('#show-twenty-tabs').click(),
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
      setup: async() => {
        await $('#show-three-tabs').click();
        tabs = await $$('.mat-tab-label');
      },
      prepare: async() => {
        tabToClick = tabToClick < tabs.length - 1 ? tabToClick + 1 : 0;
      },
      work: async() => await tabs[tabToClick].click(),
    });
  });

  it('paginates tabs', async() => {
    async function isTabPaginatorDisabled(ele: ElementFinder) {
      return (await ele.getAttribute('class')).includes('mat-tab-header-pagination-disabled');
    }
    await runBenchmark({
      id: 'tab-pagination',
      url: '',
      ignoreBrowserSynchronization: true,
      params: [],
      prepare: async() => {
        await $('#hide').click();
        await $('#show-twenty-tabs').click();
      },
      work: async() => {
        const nextBtn = $('.mat-tab-header-pagination-after');
        while (!isTabPaginatorDisabled(nextBtn)) {
          await nextBtn.click();
        }
      }
    });
  });
});
