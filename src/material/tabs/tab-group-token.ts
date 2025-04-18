/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken} from '@angular/core';

/**
 * Used to provide a tab group without causing a circular dependency.
 * @docs-private
 */
export interface MatTabGroupBase {}

/**
 * Used to provide a tab group without causing a circular dependency.
 * @docs-private
 */
export const MAT_TAB_GROUP = new InjectionToken<MatTabGroupBase>('MAT_TAB_GROUP');
