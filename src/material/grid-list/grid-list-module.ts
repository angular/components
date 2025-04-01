/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgModule} from '@angular/core';
import {MatLineModule, MatCommonModule} from '@angular/material/core';
import {
  MatGridTile,
  MatGridTileText,
  MatGridTileFooterCssMatStyler,
  MatGridTileHeaderCssMatStyler,
  MatGridAvatarCssMatStyler,
} from './grid-tile';
import {MatGridList} from './grid-list';

@NgModule({
  imports: [
    MatLineModule,
    MatCommonModule,
    MatGridList,
    MatGridTile,
    MatGridTileText,
    MatGridTileHeaderCssMatStyler,
    MatGridTileFooterCssMatStyler,
    MatGridAvatarCssMatStyler,
  ],
  exports: [
    MatGridList,
    MatGridTile,
    MatGridTileText,
    MatLineModule,
    MatCommonModule,
    MatGridTileHeaderCssMatStyler,
    MatGridTileFooterCssMatStyler,
    MatGridAvatarCssMatStyler,
  ],
})
export class MatGridListModule {}
