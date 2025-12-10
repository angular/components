/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken} from '@angular/core';
import type {GridCell} from './grid-cell';
import type {GridRow} from './grid-row';

/** Token used to expose a `GridCell`. */
export const GRID_CELL = new InjectionToken<GridCell>('GRID_CELL');

/** Token used to expose a `GridRow`. */
export const GRID_ROW = new InjectionToken<GridRow>('GRID_ROW');
