/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/** Imports a Google Maps library. */
export function importLibrary<T>(name: string, symbol: string): Promise<T> {
  // TODO(crisbeto): needs to cast to `any` to avoid some internal limitations around typings.
  // Should be cleaned up eventually.
  return (window as any).google.maps.importLibrary(name).then((library: any) => library[symbol]);
}
