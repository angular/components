/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgModule} from '@angular/core';
import {OverlayModule} from '@angular/cdk/overlay';
import {
  CdkPopoverEdit,
  CdkPopoverEditTabOut,
  CdkRowHoverContent,
  CdkEditable,
  CdkEditOpen,
} from './table-directives';
import {CdkEditControl, CdkEditRevert, CdkEditClose} from './lens-directives';

const EXPORTED_DECLARATIONS = [
  CdkPopoverEdit,
  CdkPopoverEditTabOut,
  CdkRowHoverContent,
  CdkEditControl,
  CdkEditRevert,
  CdkEditClose,
  CdkEditable,
  CdkEditOpen,
];

@NgModule({
  imports: [OverlayModule, ...EXPORTED_DECLARATIONS],
  exports: EXPORTED_DECLARATIONS,
})
export class CdkPopoverEditModule {}
