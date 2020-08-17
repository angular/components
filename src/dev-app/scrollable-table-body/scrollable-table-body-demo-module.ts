/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {ScrollableTableBodyDemo} from './scrollable-table-body-demo';
import {
  CdkScrollableTableBodyExamplesModule,
} from '@angular/components-examples/cdk-experimental/scrollable-table-body';
import {
  MatScrollableTableBodyExamplesModule,
} from '@angular/components-examples/material-experimental/scrollable-table-body';

@NgModule({
  imports: [
      CdkScrollableTableBodyExamplesModule,
      MatScrollableTableBodyExamplesModule,
    RouterModule.forChild([{path: '', component: ScrollableTableBodyDemo}]),
  ],
  declarations: [ScrollableTableBodyDemo],
})
export class ScrollableTableBodyDemoModule {
}
