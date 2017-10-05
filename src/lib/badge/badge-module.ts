/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatCommonModule} from '@angular/material/core';
import {MatBadge, MatSvgIconBadge, MatIconBadge} from './badge';


@NgModule({
  imports: [MatCommonModule],
  exports: [
    MatBadge,
    MatIconBadge,
    MatSvgIconBadge,
    MatCommonModule,
  ],
  declarations: [
    MatBadge,
    MatIconBadge,
    MatSvgIconBadge,
  ],
})
export class MatBadgeModule {}
