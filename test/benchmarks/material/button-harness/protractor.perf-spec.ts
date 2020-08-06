/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HarnessLoader} from '@angular/cdk/testing';
import {MatButtonHarness} from '@angular/material/button/testing/button-harness';
import {runBenchmark} from '@angular/dev-infra-private/benchmark/driver-utilities';
import {ProtractorHarnessEnvironment} from '@angular/cdk/testing/protractor';

let loader: HarnessLoader;

describe('perf test for basic protractor harness', () => {
	it('should load the protractor harness environment', async () => {
		await runBenchmark({
			id: 'initial-harness-load',
			url: '',
			ignoreBrowserSynchronization: true,
			params: [],
			work: () => { loader = ProtractorHarnessEnvironment.loader(); },
		});
	});

	it('should retrieve all of the buttons', async () => {
		await runBenchmark({
			id: 'get-first-button',
			url: '',
			ignoreBrowserSynchronization: true,
			params: [],
			setup: () => { loader = ProtractorHarnessEnvironment.loader(); },
			work: async () => await loader.getAllHarnesses(MatButtonHarness),
		});
	});

	it('should retrieve the first button', async () => {
		await runBenchmark({
			id: 'get-first-button',
			url: '',
			ignoreBrowserSynchronization: true,
			params: [],
			setup: () => { loader = ProtractorHarnessEnvironment.loader(); },
			work: async () => await (await loader.getHarness(MatButtonHarness.with({text: '0'}))).click(),
		});
	});

	it('should retrieve the middle button', async () => {
		await runBenchmark({
			id: 'get-middle-button',
			url: '',
			ignoreBrowserSynchronization: true,
			params: [],
			setup: () => { loader = ProtractorHarnessEnvironment.loader(); },
			work: async () => await (await loader.getHarness(MatButtonHarness.with({text: '49'}))).click(),
		});
	});

	it('should retrieve the last button', async () => {
		await runBenchmark({
			id: 'get-last-button',
			url: '',
			ignoreBrowserSynchronization: true,
			params: [],
			setup: () => { loader = ProtractorHarnessEnvironment.loader(); },
			work: async () => await (await loader.getHarness(MatButtonHarness.with({text: '99'}))).click(),
		});
	});
});
