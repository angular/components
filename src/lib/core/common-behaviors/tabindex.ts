/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Constructor} from './constructor';
import {CanDisable} from './disabled';

/** @docs-private */
export interface CanTabIndex {
  tabIndex: number;
}

/** Mixin to augment a directive with a `tabIndex` property. */
export function mixinTabIndex<T extends Constructor<CanDisable>>(base: T, defaultTabIndex = 0)
    : Constructor<CanTabIndex> & T {
  return class extends base {
    private _tabIndex: number;

    get tabIndex(): number { return this.disabled ? -1 : this._tabIndex || defaultTabIndex; }
    set tabIndex(value: number) {
      if (typeof value !== 'undefined') {
        this._tabIndex = value;
      }
    }

    constructor(...args: any[]) {
      super(...args);
    }
  };
}

