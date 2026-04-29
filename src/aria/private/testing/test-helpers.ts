/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Yields execution to the microtask queue, allowing MutationObserver callbacks to fire.
 * Useful for testing async behaviors without relying on Zone.js.
 */
export function waitForMicrotasks(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0));
}
