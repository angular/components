/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Utility class for checking if the user's application is nooped.
 * Note, this is a class and not an exported function, because we'll be able to mock the
 * method within unit tests. Unit tests depend on `zone.js` to be imported and there's no
 * way to run unit tests with a nooped zone. Doing, for instance, `delete ɵglobal.Zone` may
 * fail unit tests running in parallel.
 */
export class NoopNgZoneChecker {
  /**
   * Checks whether the user's application uses the `zone.js`, which exports the `Zone`
   * class into the global scope. This function differs from `NgZone.isInAngularZone()`.
   * The `NgZone.isInAngularZone()` checks whether the code is running within the Angular zone,
   * but we can't know if the zone is nooped or not.
   */
  static isNoopNgZone(): boolean {
    // Note: we can't reference `zone.js` types through `/// <reference types="zone.js" />`
    // since `zone.js` package may be missing.
    // @ts-ignore
    return typeof Zone === 'undefined';
  }
}
