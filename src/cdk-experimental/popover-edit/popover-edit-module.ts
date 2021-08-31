/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {OverlayModule} from '@angular/cdk/overlay';
import {NgModule} from '@angular/core';

import {CdkEditClose, CdkEditControl, CdkEditRevert} from './lens-directives';
import {
  DefaultPopoverEditPositionStrategyFactory,
  PopoverEditPositionStrategyFactory
} from './popover-edit-position-strategy-factory';
import {
  CdkEditable,
  CdkEditOpen,
  CdkPopoverEdit,
  CdkPopoverEditTabOut,
  CdkRowHoverContent
} from './table-directives';

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
  imports: [
    OverlayModule,
  ],
  exports: EXPORTED_DECLARATIONS,
  declarations: EXPORTED_DECLARATIONS,
  providers: [{
    provide: PopoverEditPositionStrategyFactory,
    useClass: DefaultPopoverEditPositionStrategyFactory
  }],
})
export class CdkPopoverEditModule {
}
