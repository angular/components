/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatCheckboxModule} from '@angular/material-experimental/mdc-checkbox';
import {RouterModule} from '@angular/router';
import {MdcCheckboxDemo} from './mdc-checkbox-demo';

@NgModule({
  imports: [
    MatCheckboxModule,
    RouterModule.forChild([{path: '', component: MdcCheckboxDemo}]),
  ],
  declarations: [MdcCheckboxDemo],
})
export class MdcCheckboxDemoModule {
}
