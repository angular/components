/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {AbstractConstructor, Constructor} from './constructor';

/**
 * @docs-private
 * @deprecated Will be removed together with `mixinDisabled`.
 * @breaking-change 19.0.0
 */
export interface CanDisable {
  /** Whether the component is disabled. */
  disabled: boolean;
}

type CanDisableCtor = Constructor<CanDisable> & AbstractConstructor<CanDisable>;

/**
 * Mixin to augment a directive with a `disabled` property.
 * @deprecated Use an input with a transform instead.
 * @breaking-change 19.0.0
 */
export function mixinDisabled<T extends AbstractConstructor<{}>>(base: T): CanDisableCtor & T;
export function mixinDisabled<T extends Constructor<{}>>(base: T): CanDisableCtor & T {
  return class extends base {
    private _disabled: boolean = false;

    get disabled(): boolean {
      return this._disabled;
    }
    set disabled(value: any) {
      this._disabled = coerceBooleanProperty(value);
    }

    constructor(...args: any[]) {
      super(...args);
    }
  };
}
