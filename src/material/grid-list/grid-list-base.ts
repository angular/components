/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken} from '@angular/core';

/**
 * Injection token used to provide a grid list to a tile and to avoid circular imports.
 * @nodoc
 */
export const MAT_GRID_LIST = new InjectionToken<MatGridListBase>('MAT_GRID_LIST');

/**
 * Base interface for a `MatGridList`.
 * @nodoc
 */
export interface MatGridListBase {
  cols: number;
  gutterSize: string;
  rowHeight: number | string;
}
