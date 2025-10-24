/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export type SignalLike<T> = () => T;

export interface WritableSignalLike<T> extends SignalLike<T> {
  set(value: T): void;
  update(updateFn: (value: T) => T): void;
}

/** Converts a getter setter style signal to a WritableSignalLike. */
export function convertGetterSetterToWritableSignalLike<T>(
  getter: () => T,
  setter: (v: T) => void,
): WritableSignalLike<T> {
  // tslint:disable-next-line:ban Have to use `Object.assign` to preserve the getter function.
  return Object.assign(getter, {
    set: setter,
    update: (updateCallback: (v: T) => T) => setter(updateCallback(getter())),
  });
}
