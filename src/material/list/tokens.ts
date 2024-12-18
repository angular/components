/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken} from '@angular/core';

/** Object that can be used to configure the default options for the list module. */
export interface MatListConfig {
  /** Whether icon indicators should be hidden for single-selection. */
  hideSingleSelectionIndicator?: boolean;
}

/** Injection token that can be used to provide the default options for the list module. */
export const MAT_LIST_CONFIG = new InjectionToken<MatListConfig>('MAT_LIST_CONFIG');
