/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {APP_ID, inject, Service} from '@angular/core';

/**
 * Keeps track of the ID count per prefix. This helps us make the IDs a bit more deterministic
 * like they were before the service was introduced. Note that ideally we wouldn't have to do
 * this, but there are some internal tests that rely on the IDs.
 *
 * Note: use a map to avoid conflicts with built-in properties.
 */
const counters = new Map<string, number>();

/** Service that generates unique IDs for DOM nodes. */
@Service()
export class _IdGenerator {
  private _appId = inject(APP_ID);
  private static _infix = `a${Math.floor(Math.random() * 100000).toString()}`;

  /**
   * Generates a unique ID with a specific prefix.
   * @param prefix Prefix to add to the ID.
   * @param randomize Add a randomized infix string.
   */
  getId(prefix: string, randomize: boolean = false): string {
    // Omit the app ID if it's the default `ng`. Since the vast majority of pages have one
    // Angular app on them, we can reduce the amount of breakages by not adding it.
    if (this._appId !== 'ng') {
      prefix += this._appId;
    }

    let count = counters.get(prefix);

    if (count === undefined) {
      count = 0;
    } else {
      count++;
    }

    counters.set(prefix, count);
    return `${prefix}${randomize ? _IdGenerator._infix + '-' : ''}${count}`;
  }
}
