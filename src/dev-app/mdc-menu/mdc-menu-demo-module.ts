/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material-experimental/mdc-button';
import {MatMenuModule} from '@angular/material-experimental/mdc-menu';
import {MatDividerModule} from '@angular/material/divider';
import {MatIconModule} from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar';
import {RouterModule} from '@angular/router';

import {MdcMenuDemo} from './mdc-menu-demo';

@NgModule({
  imports: [
    CommonModule,
    MatMenuModule,
    RouterModule.forChild([{path: '', component: MdcMenuDemo}]),
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatDividerModule,
  ],
  declarations: [MdcMenuDemo],
})
export class MdcMenuDemoModule {
}
