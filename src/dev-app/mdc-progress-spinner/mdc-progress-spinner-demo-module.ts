/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatProgressSpinnerModule} from '@angular/material-experimental/mdc-progress-spinner';
import {RouterModule} from '@angular/router';
import {MdcProgressSpinnerDemo} from './mdc-progress-spinner-demo';

@NgModule({
  imports: [
    MatProgressSpinnerModule,
    RouterModule.forChild([{path: '', component: MdcProgressSpinnerDemo}]),
  ],
  declarations: [MdcProgressSpinnerDemo],
})
export class MdcProgressSpinnerDemoModule {}
