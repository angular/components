/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatButtonToggleModule} from '@angular/material-experimental/mdc-button-toggle';
import {MatIconModule} from '@angular/material/icon';
import {RouterModule} from '@angular/router';
import {MdcButtonToggleDemo} from './mdc-button-toggle-demo';
import {MatCheckboxModule} from '@angular/material-experimental/mdc-checkbox';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    MatIconModule,
    RouterModule.forChild([{path: '', component: MdcButtonToggleDemo}]),
  ],
  declarations: [MdcButtonToggleDemo],
})
export class MdcButtonToggleDemoModule {
}
