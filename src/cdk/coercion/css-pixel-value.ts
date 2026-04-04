/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/** Coerces a value to a CSS pixel value. */
export function coerceCssPixelValue(value: unknown): string {
  if (value == null) {
    return '';
  }

  return typeof value === 'string' ? value : `${String(value)}px`;
}
