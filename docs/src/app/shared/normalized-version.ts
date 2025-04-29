/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {VERSION} from '@angular/material/core';

/**
 * Normalized Material version without its additional SHA information if present.
 *
 * Snapshot builds of Angular will include these as part of their ng-dev release
 * stamping. We only want to show the SHA details in the footer of the page.
 *
 * e.g. `14.0.0-next.3+38.sha-9d233f4` should become `14.0.0-next.3`
 */
export const normalizedMaterialVersion = VERSION.full.match(/(\d+\.\d+\.\d+(?:[^\+]*))/)![1];
