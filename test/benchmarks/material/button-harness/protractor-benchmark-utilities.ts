/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {runBenchmark} from '@angular/dev-infra-private/benchmark/driver-utilities';
import {USE_BENCHPRESS} from './constants';

/**
 * Records the performance of the given function.
 *
 * @param id A unique identifier.
 * @param callback A function whose performance will be recorded.
 */
export async function benchmark(id: string, callback: Function) {
  if (USE_BENCHPRESS) {
    await benchmarkWithBenchpress(id, callback);
  } else {
    await benchmarkWithConsoleAPI(id, callback);
  }
}

/**
 * A simple wrapper for runBenchmark ... which is a wrapper for benchpress.
 *
 * @param id
 * @param callback
 */
async function benchmarkWithBenchpress(id: string, callback: Function) {
	await runBenchmark({
		id,
		url: '',
		ignoreBrowserSynchronization: true,
		params: [],
		work: async () => await callback(),
	});
}

/**
 * Uses console.time with the given id to record the time it takes for the given callback to run.
 *
 * @param id
 * @param callback
 */
async function benchmarkWithConsoleAPI(id: string, callback: Function) {
	console.time(id);
	await callback();
	console.timeEnd(id);
}
