/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {APP_ID, inject, Injectable} from '@angular/core';

let nextId = 0;

/**
 * Class that generates unique *enough* IDs for DOM elements. IDs
 * are based on an incrementing number starting at zero and the
 * Angular application's APP_ID.
 */
@Injectable({providedIn: 'root'})
export class IdGenerator {
  private _appId = inject(APP_ID);

  /**
   * Gets an ID for a DOM element based on a given prefix, the application's APP_ID, and
   * an incrementing number. Generated IDs are non-deterministic. Code should never depend on this
   * service producing a specific ID.
   *
   * @param prefix Prefix for the ID. Use this to make the ID specific to a specific use-case.
   *     For example, if you are generating an ID for a checkbox element, you might specify
   *     "my-checkbox".
   */
  getId(prefix: string): string {
    // In dev mode, introduce some entropy to the generated IDs in order to prevent people from
    // hard-coding specific IDs.
    let entropy = '';
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      entropy = `${Math.floor(Math.random() * 100000000)}`
    }

    return `${prefix}${entropy}${this._appId}${nextId++}`;
  }
}
