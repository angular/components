/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/** @docs-private */
export type Constructor<T> = new(...args: any[]) => T;

/**
 * Interface for a mixin to provide a directive with a function that checks if the sticky input has
 * been changed since the last time the function was called. Essentially adds a dirty-check to the
 * sticky value.
 * @docs-private
 */
export interface HasStickyState {
  /** State of whether the sticky input has changed since it was last checked. */
  _hasStickyChanged: boolean;

  checkStickyChanged(): boolean;

  resetStickyChanged(): void;
}

/**
 * Mixin to provide a directive with a function that checks if the sticky input has been
 * changed since the last time the function was called. Essentially adds a dirty-check to the
 * sticky value.
 */
export function mixinHasStickyInput<T extends Constructor<{}>>(base: T):
    Constructor<HasStickyState> & T {
  return class extends base {
    /** State of whether the sticky input has changed since it was last checked. */
    _hasStickyChanged: boolean = false;

    /** Whether the sticky value has changed since this was last called. */
    checkStickyChanged(): boolean {
      const hasStickyChanged = this._hasStickyChanged;
      this._hasStickyChanged = false;
      return hasStickyChanged;
    }

    /** Resets the dirty check for cases where the sticky state has been used without checking. */
    resetStickyChanged() {
      this._hasStickyChanged = false;
    }

    constructor(...args: any[]) { super(...args); }
  };
}
