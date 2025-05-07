/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/** @nodoc */
export function createMissingDateImplError(provider: string) {
  return Error(
    `MatDatepicker: No provider found for ${provider}. You must add one of the following ` +
      `to your app config: provideNativeDateAdapter, provideDateFnsAdapter, ` +
      `provideLuxonDateAdapter, provideMomentDateAdapter, or provide a custom implementation.`,
  );
}
