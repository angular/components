/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {$, browser} from 'protractor';
import {runBenchmark} from '@angular/dev-infra-private/benchmark/driver-utilities';

describe('checkbox overview performance benchmarks', () => {
  beforeAll(() => {
    browser.rootEl = '#root';
  });

  describe('increasing rows', () => {
    it('renders 10 rows with 5 cols', async() => {
      await runBenchmark({
        id: 'basic-table-render-10-rows-5-cols',
        url: '',
        ignoreBrowserSynchronization: true,
        params: [],
        prepare: async () => await $('#hide').click(),
        work: async () => await $('#show').click()
      });
    });

    it('renders 100 rows with 5 cols', async() => {
      await runBenchmark({
        id: 'basic-table-render-100-rows-5-cols',
        url: '',
        ignoreBrowserSynchronization: true,
        params: [],
        setup: async () => await $('#one-hundred-rows').click(),
        prepare: async () => await $('#hide').click(),
        work: async () => await $('#show').click()
      });
    });

    it('renders 1000 rows with 5 cols', async() => {
      await runBenchmark({
        id: 'basic-table-render-1000-rows-5-cols',
        url: '',
        ignoreBrowserSynchronization: true,
        params: [],
        setup: async () => await $('#one-thousand-rows').click(),
        prepare: async () => await $('#hide').click(),
        work: async () => await $('#show').click()
      });
    });
  });

  describe('increasing cols', () => {
    it('renders 10 rows with 5 cols', async() => {
      await runBenchmark({
        id: 'basic-table-render-10-rows-5-cols',
        url: '',
        ignoreBrowserSynchronization: true,
        params: [],
        setup: async () => await $('#show').click(),
        prepare: async () => await $('#hide').click(),
        work: async () => await $('#show').click()
      });
    });

    it('renders 10 rows with 10 cols', async() => {
      await runBenchmark({
        id: 'basic-table-render-10-rows-10-cols',
        url: '',
        ignoreBrowserSynchronization: true,
        params: [],
        setup: async () => await $('#ten-cols').click(),
        prepare: async () => await $('#hide').click(),
        work: async () => await $('#show').click()
      });
    });

    it('renders 10 rows with 20 cols', async() => {
      await runBenchmark({
        id: 'basic-table-render-10-rows-20-cols',
        url: '',
        ignoreBrowserSynchronization: true,
        params: [],
        setup: async () => await $('#twenty-cols').click(),
        prepare: async () => await $('#hide').click(),
        work: async () => await $('#show').click()
      });
    });
  });
});
