/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  CdkPopoverEditCdkTableExample,
  CdkPopoverEditCdkTableFlexExample,
  CdkPopoverEditCellSpanVanillaTableExample,
  CdkPopoverEditTabOutVanillaTableExample,
  CdkPopoverEditVanillaTableExample,
} from '@angular/components-examples/cdk-experimental/popover-edit';
import {
  PopoverEditCellSpanMatTableExample,
  PopoverEditMatTableExample,
  PopoverEditMatTableFlexExample,
  PopoverEditTabOutMatTableExample,
} from '@angular/components-examples/material-experimental/popover-edit';
import {ChangeDetectionStrategy, Component} from '@angular/core';
import {FormsModule} from '@angular/forms';

@Component({
  template: `
    <h3 id="cdk-popover-edit">CDK popover-edit with cdk-table</h3>
    <cdk-popover-edit-cdk-table-example></cdk-popover-edit-cdk-table-example>
    <h3 id="cdk-popover-edit-flex">CDK popover-edit with cdk-table flex</h3>
    <cdk-popover-edit-cdk-table-flex-example></cdk-popover-edit-cdk-table-flex-example>
    <h3 id="cdk-popover-edit-vanilla-span">CDK popover-edit with vanilla table</h3>
    <cdk-popover-edit-cell-span-vanilla-table-example>
    </cdk-popover-edit-cell-span-vanilla-table-example>
    <h3 id="cdk-popover-edit-vanilla-tabout">CDK popover-edit with vanilla table and tab out</h3>
    <cdk-popover-edit-tab-out-vanilla-table-example>
    </cdk-popover-edit-tab-out-vanilla-table-example>
    <h3 id="cdk-popover-edit-vanilla">CDK popover-edit with vanilla table</h3>
    <cdk-popover-edit-vanilla-table-example></cdk-popover-edit-vanilla-table-example>
    <h3 id="mat-popover-edit-span">Material popover-edit with mat-table and cell span</h3>
    <popover-edit-cell-span-mat-table-example></popover-edit-cell-span-mat-table-example>
    <h3 id="mat-popover-edit">Material popover-edit with mat-table</h3>
    <popover-edit-mat-table-example></popover-edit-mat-table-example>
    <h3 id="mat-popover-edit-flex">Material popover-edit with mat-table flex</h3>
    <popover-edit-mat-table-flex-example></popover-edit-mat-table-flex-example>
    <h3 id="mat-popover-edit-tabout">Material popover-edit with mat-table and tab out</h3>
    <popover-edit-tab-out-mat-table-example></popover-edit-tab-out-mat-table-example>
  `,
  imports: [
    CdkPopoverEditCdkTableFlexExample,
    CdkPopoverEditCdkTableExample,
    CdkPopoverEditCellSpanVanillaTableExample,
    CdkPopoverEditTabOutVanillaTableExample,
    CdkPopoverEditVanillaTableExample,
    PopoverEditCellSpanMatTableExample,
    PopoverEditMatTableFlexExample,
    PopoverEditMatTableExample,
    PopoverEditTabOutMatTableExample,
    FormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopoverEditDemo {}
