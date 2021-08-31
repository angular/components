/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MdcTableExamplesModule} from '@angular/components-examples/material-experimental/mdc-table';
import {NgModule} from '@angular/core';
import {MatTableModule} from '@angular/material-experimental/mdc-table';
import {MatIconModule} from '@angular/material/icon';
import {RouterModule} from '@angular/router';

import {MdcTableDemo} from './mdc-table-demo';

@NgModule({
  imports: [
    MatIconModule,
    MatTableModule,
    MdcTableExamplesModule,
    RouterModule.forChild([{path: '', component: MdcTableDemo}]),
  ],
  declarations: [MdcTableDemo],
})
export class MdcTableDemoModule {
}
