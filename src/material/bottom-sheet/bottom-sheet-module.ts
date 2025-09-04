/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DialogModule} from '@angular/cdk/dialog';
import {PortalModule} from '@angular/cdk/portal';
import {NgModule} from '@angular/core';
import {BidiModule} from '@angular/cdk/bidi';
import {MatBottomSheetContainer} from './bottom-sheet-container';
import {MatBottomSheet} from './bottom-sheet';

@NgModule({
  imports: [DialogModule, PortalModule, MatBottomSheetContainer],
  exports: [MatBottomSheetContainer, BidiModule],
  providers: [MatBottomSheet],
})
export class MatBottomSheetModule {}
