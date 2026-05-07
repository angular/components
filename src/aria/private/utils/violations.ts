/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/** Logs each of the violations to the console as errors, optionally with the host element context. */
export function reportViolations(violations: string[], element: Element): void {
  if (violations.length) {
    console.warn('Violations found on element: %o:', element);
    violations.forEach(violation => {
      console.warn(violation);
    });
  }
}
