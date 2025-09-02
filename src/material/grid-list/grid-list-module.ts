/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {BidiModule} from '@angular/cdk/bidi';
import {NgModule} from '@angular/core';
import {MatLineModule} from '../core';
import {MatGridList} from './grid-list';
import {
  MatGridAvatarCssMatStyler,
  MatGridTile,
  MatGridTileFooterCssMatStyler,
  MatGridTileHeaderCssMatStyler,
  MatGridTileText,
} from './grid-tile';

// Export required to fix compiler confusion about import module paths
export {MatLine} from '../core';

@NgModule({
  imports: [
    MatLineModule,
    MatGridList,
    MatGridTile,
    MatGridTileText,
    MatGridTileHeaderCssMatStyler,
    MatGridTileFooterCssMatStyler,
    MatGridAvatarCssMatStyler,
  ],
  exports: [
    BidiModule,
    MatGridList,
    MatGridTile,
    MatGridTileText,
    MatLineModule,
    MatGridTileHeaderCssMatStyler,
    MatGridTileFooterCssMatStyler,
    MatGridAvatarCssMatStyler,
  ],
})
export class MatGridListModule {}
