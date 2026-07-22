/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  createComputed,
  createLinkedSignal,
  createSignal,
  linkedSignalSetFn,
  linkedSignalUpdateFn,
  SIGNAL,
  untracked as primitiveUntracked,
} from '@angular/core/primitives/signals';

export {primitiveUntracked as untracked};

export type SignalLike<T> = () => T;

export interface WritableSignalLike<T> extends SignalLike<T> {
  set(value: T): void;
  update(updateFn: (value: T) => T): void;
  asReadonly(): SignalLike<T>;
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
    asReadonly: () => getter,
  });
}

export function computed<T>(computation: () => T): SignalLike<T> {
  const computed = createComputed(computation);
  // TODO: Remove the `toString` after https://github.com/angular/angular/pull/65948 is merged.
  computed.toString = () => `[Computed: ${computed()}]`;
  computed[SIGNAL].debugName = '';
  return computed;
}

export function signal<T>(initialValue: T): WritableSignalLike<T> {
  const [get, set, update] = createSignal(initialValue);
  get[SIGNAL].debugName = '';
  // tslint:disable-next-line:ban Have to use `Object.assign` to preserve the getter function.
  return Object.assign(get, {set, update, asReadonly: () => get});
}

export function linkedSignal<T>(sourceFn: () => T): WritableSignalLike<T> {
  const getter = createLinkedSignal(sourceFn, s => s);
  getter[SIGNAL].debugName = '';
  // tslint:disable-next-line:ban Have to use `Object.assign` to preserve the getter function.
  return Object.assign(getter, {
    set: (v: T) => linkedSignalSetFn(getter[SIGNAL], v),
    update: (updater: (v: T) => T) => linkedSignalUpdateFn(getter[SIGNAL], updater),
    asReadonly: () => getter,
  });
}
