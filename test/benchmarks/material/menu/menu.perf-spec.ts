/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {runBenchmark} from '@angular/dev-infra-private/benchmark/driver-utilities';

import {HarnessLoader} from '@angular/cdk/testing';
import {ProtractorHarnessEnvironment} from '@angular/cdk/testing/protractor';
import {MatMenuHarness} from '@angular/material/menu/testing/menu-harness';

let loader: HarnessLoader;

describe('menu performance benchmarks', () => {
  beforeEach(() => {
    loader = ProtractorHarnessEnvironment.loader();
  });

  it('opens a menu with 10 items', async () => {
    let menu: MatMenuHarness;
    await runBenchmark({
      id: 'menu-open',
      url: '',
      ignoreBrowserSynchronization: true,
      params: [],
      setup: async () => menu = await loader.getHarness(MatMenuHarness),
      prepare: async () => await menu.close(),
      work: async () => await menu.open(),
    });
  });
});
