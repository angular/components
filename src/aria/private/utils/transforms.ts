/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {numberAttribute} from '@angular/core';

/**
 * Transform function for tabIndex inputs.
 * Returns undefined if the value is undefined, otherwise converts it to a number.
 */
export function tabIndexTransform(v: string | number | undefined): number | undefined {
  return v === undefined ? undefined : numberAttribute(v);
}
