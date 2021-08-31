/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatCommonModule, MatLineModule} from '@angular/material/core';

import {MatGridList} from './grid-list';
import {
  MatGridAvatarCssMatStyler,
  MatGridTile,
  MatGridTileFooterCssMatStyler,
  MatGridTileHeaderCssMatStyler,
  MatGridTileText
} from './grid-tile';


@NgModule({
  imports: [MatLineModule, MatCommonModule],
  exports: [
    MatGridList, MatGridTile, MatGridTileText, MatLineModule, MatCommonModule,
    MatGridTileHeaderCssMatStyler, MatGridTileFooterCssMatStyler, MatGridAvatarCssMatStyler
  ],
  declarations: [
    MatGridList, MatGridTile, MatGridTileText, MatGridTileHeaderCssMatStyler,
    MatGridTileFooterCssMatStyler, MatGridAvatarCssMatStyler
  ],
})
export class MatGridListModule {
}
