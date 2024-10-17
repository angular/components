/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  CdkSelectionColumnExample,
  CdkSelectionListExample,
} from '@angular/components-examples/cdk-experimental/selection';
import {
  MatSelectionColumnExample,
  MatSelectionListExample,
} from '@angular/components-examples/material-experimental/selection';
import {ChangeDetectionStrategy, Component} from '@angular/core';
import {FormsModule} from '@angular/forms';

@Component({
  template: `
    <h3>CDK selection with a list</h3>
    <cdk-selection-list-example></cdk-selection-list-example>

    <h3>CDK selection column and CDK row selection with CDK table</h3>
    <cdk-selection-column-example></cdk-selection-column-example>

    <h3>Mat selection with a list</h3>
    <mat-selection-list-example></mat-selection-list-example>

    <h3>Mat selection column and Mat row selection with Mat table</h3>
    <mat-selection-column-example></mat-selection-column-example>
  `,
  imports: [
    CdkSelectionColumnExample,
    CdkSelectionListExample,
    MatSelectionColumnExample,
    MatSelectionListExample,
    FormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectionDemo {}
