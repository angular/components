/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgModule} from '@angular/core';
import {MatCommonModule} from '@angular/material/core';
import {A11yModule} from '@angular/cdk/a11y';
import {MatBadge, _MatBadgeStyleLoader} from './badge';

@NgModule({
  // Note: we _shouldn't_ have to import `_MatBadgeStyleLoader`,
  // but it seems to be necessary for tests.
  imports: [A11yModule, MatCommonModule, MatBadge, _MatBadgeStyleLoader],
  exports: [MatBadge, MatCommonModule],
})
export class MatBadgeModule {}
