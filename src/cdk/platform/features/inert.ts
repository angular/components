/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

let supportsInert: boolean | undefined;

/** Returns whether the browser supports the `inert` attribute. */
export function _supportsInert(): boolean {
  if (typeof supportsInert === 'boolean') {
    return supportsInert;
  }

  supportsInert = typeof document !== 'undefined' && !!document.body && 'inert' in document.body;
  return supportsInert;
}
