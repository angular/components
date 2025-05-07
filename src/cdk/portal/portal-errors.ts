/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Throws an exception when attempting to attach a null portal to a host.
 * @nodoc
 */
export function throwNullPortalError() {
  throw Error('Must provide a portal to attach');
}

/**
 * Throws an exception when attempting to attach a portal to a host that is already attached.
 * @nodoc
 */
export function throwPortalAlreadyAttachedError() {
  throw Error('Host already has a portal attached');
}

/**
 * Throws an exception when attempting to attach a portal to an already-disposed host.
 * @nodoc
 */
export function throwPortalOutletAlreadyDisposedError() {
  throw Error('This PortalOutlet has already been disposed');
}

/**
 * Throws an exception when attempting to attach an unknown portal type.
 * @nodoc
 */
export function throwUnknownPortalTypeError() {
  throw Error(
    'Attempting to attach an unknown Portal type. BasePortalOutlet accepts either ' +
      'a ComponentPortal or a TemplatePortal.',
  );
}

/**
 * Throws an exception when attempting to attach a portal to a null host.
 * @nodoc
 */
export function throwNullPortalOutletError() {
  throw Error('Attempting to attach a portal to a null PortalOutlet');
}

/**
 * Throws an exception when attempting to detach a portal that is not attached.
 * @nodoc
 */
export function throwNoPortalAttachedError() {
  throw Error('Attempting to detach a portal that is not attached to a host');
}
