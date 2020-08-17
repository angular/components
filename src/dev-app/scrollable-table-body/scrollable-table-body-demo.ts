/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';

@Component({
  template: `
    <h3 id="cdk-scrollable-table-body-flex">CDK scrollable-table-body with flex table</h3>
    <cdk-scrollable-table-body-flex-example></cdk-scrollable-table-body-flex-example>

    <h3 id="mat-scrollable-table-body-flex">Material scrollable-table-body with flex table</h3>
    <mat-scrollable-table-body-flex-example></mat-scrollable-table-body-flex-example>
  `,
})
export class ScrollableTableBodyDemo {}
